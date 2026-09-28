import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import MobileMPRViewer from "../components/DICOMViewer/MobileMPRViewer";
import { 
  ChevronLeft, 
  Layers,
  FileText,
  RefreshCw,
  X,
  Play,
  Pause,
  Camera,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
  Ruler,
  Activity,
  ZoomIn,
  Move,
  Sun
} from "lucide-react";
import "./MobileLiteViewerV3.css";

// Utility: Compress Base64 image to prevent mobile heap OOM (max 512px, 0.7 quality)
const compressImage = (dataUrl, maxWidth = 512, quality = 0.7) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
      return resolve(dataUrl);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspect = img.width / img.height;
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        w = maxWidth;
        h = Math.round(maxWidth / aspect);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

// Utility: API call with exponential backoff retries (3 retries, base delay 1000ms)
const fetchWithRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`⚠️ [RETRY] Network request attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`, err.message);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

const MobileLiteViewerV3 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studyUID = searchParams.get("study") || searchParams.get("study_uid") || searchParams.get("studyUID");
  
  const [studyMeta, setStudyMeta] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMPRModal, setShowMPRModal] = useState(false);
  
  const [showSeriesDrawer, setShowSeriesDrawer] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showOverlayInfo, setShowOverlayInfo] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isInverted, setIsInverted] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // iOS Safari URL bar collapse
  useEffect(() => {
    const collapseIOSUrlBar = () => {
      window.scrollTo(0, 1);
    };
    collapseIOSUrlBar();
    window.addEventListener("touchstart", collapseIOSUrlBar, { once: true });
    return () => {
      window.removeEventListener("touchstart", collapseIOSUrlBar);
    };
  }, []);

  // TOUCH GESTURE & MEASUREMENT ENGINE
  const [touchMode, setTouchMode] = useState("PAN"); // "SCROLL" | "WL" | "PAN" | "MEASURE"
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState([]);
  const [activeMeasure, setActiveMeasure] = useState(null);
  const measureStartRef = useRef(null);

  const initialPinchDist = useRef(null);
  const initialPinchZoom = useRef(1);
  const touchLastPos = useRef({ x: 0, y: 0 });
  const touchDeltaAccumulator = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const isDragging = useRef(false);

  // REFS FOR FRESH STATE IN ASYNC HANDLERS
  const currentIndexRef = useRef(currentIndex);
  const activeSeriesRef = useRef(null);
  const currentInstanceRef = useRef(null);
  const studyMetaRef = useRef(studyMeta);

  const activeSeries = seriesList[activeSeriesIndex] || { instances: [] };
  const currentInstances = activeSeries.instances || [];
  const currentInstance = currentInstances[currentIndex];

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activeSeriesRef.current = activeSeries; }, [activeSeries]);
  useEffect(() => { currentInstanceRef.current = currentInstance; }, [currentInstance]);
  useEffect(() => { studyMetaRef.current = studyMeta; }, [studyMeta]);

  // Offline Key Image Queue Flushing on Network Reconnection
  useEffect(() => {
    const flushPendingQueue = async () => {
      const pendingStr = localStorage.getItem("pending_key_image_uploads");
      if (!pendingStr) return;
      try {
        const queue = JSON.parse(pendingStr);
        if (!Array.isArray(queue) || queue.length === 0) return;
        console.log(`📡 [OFFLINE SYNC] Connectivity restored! Flushing ${queue.length} pending key images...`);
        const remaining = [];
        for (const item of queue) {
          try {
            await fetchWithRetry(() => api.post("/api/v3/key-images/save", item), 2, 800);
          } catch (e) {
            remaining.push(item);
          }
        }
        if (remaining.length > 0) {
          localStorage.setItem("pending_key_image_uploads", JSON.stringify(remaining));
        } else {
          localStorage.removeItem("pending_key_image_uploads");
          console.log("✅ [OFFLINE SYNC] All pending key images successfully uploaded!");
        }
      } catch (e) {
        console.warn("Failed flushing offline key image queue:", e);
      }
    };

    window.addEventListener("online", flushPendingQueue);
    flushPendingQueue();
    return () => window.removeEventListener("online", flushPendingQueue);
  }, []);

  // Save active series & slice state
  useEffect(() => {
    if (studyUID) {
      const stateObj = JSON.stringify({
        seriesIndex: activeSeriesIndex,
        sliceIndex: currentIndex,
        updatedAt: Date.now()
      });
      sessionStorage.setItem(`viewer_state_${studyUID}`, stateObj);
      localStorage.setItem(`viewer_state_${studyUID}`, stateObj);
    }
  }, [studyUID, activeSeriesIndex, currentIndex]);

  const fetchStudyData = useCallback(async () => {
    if (!studyUID) return;
    setLoading(true);
    try {
      let res = await api.get(`/api/v3/pacs/mobile-study/${encodeURIComponent(studyUID)}`).catch(() => null);
      if (!res?.data?.success) {
        res = await api.get(`/api/pacs/mobile-study/${encodeURIComponent(studyUID)}`).catch(() => null);
      }

      let fetchedSeries = [];
      if (res?.data?.success && Array.isArray(res.data.series) && res.data.series.length > 0) {
        setStudyMeta({
          patientName: res.data.patientName || res.data.patient_name,
          patientId: res.data.patientId || res.data.patient_id,
          accession: res.data.accession,
          modality: res.data.modality,
          studyDate: res.data.studyDate || res.data.study_date,
          studyDescription: res.data.studyDescription || res.data.study_description
        });
        fetchedSeries = res.data.series;
      }

      if (
        fetchedSeries.length === 0 ||
        fetchedSeries.some(s => (s.totalSlices || s.total_slices || 0) > 1 && (!s.instances || s.instances.length <= 1))
      ) {
        let fallbackRes = await api.get(`/api/v3/pacs/study-series-instances/${encodeURIComponent(studyUID)}`).catch(() => null);
        if (!fallbackRes?.data?.success) {
          fallbackRes = await api.get(`/api/pacs/study-series-instances/${encodeURIComponent(studyUID)}`).catch(() => null);
        }
        if (fallbackRes?.data?.success && Array.isArray(fallbackRes.data.series)) {
          fetchedSeries = fallbackRes.data.series.map(s => ({
            seriesId: s.series_id || s.seriesId,
            seriesDescription: s.series_description || s.seriesDescription,
            modality: s.modality,
            totalSlices: s.total_slices || s.totalSlices || (s.instances?.length || 0),
            instances: (s.instances || []).map((inst, i) => ({
              id: inst.instance_id || inst.id,
              instanceNumber: inst.slice_number || inst.instanceNumber || i + 1,
              previewUrl: inst.preview_url || inst.previewUrl || `/api/v3/pacs/instance-preview/${inst.instance_id || inst.id}`,
              sopInstanceUid: inst.sop_instance_uid || inst.sopInstanceUid || inst.instance_id || inst.id
            }))
          }));
        }
      }

      setSeriesList(fetchedSeries);

      const mod = String(studyMeta?.modality || res?.data?.modality || "").toUpperCase();
      if (mod === "CT" || mod === "MR") {
        setTouchMode("SCROLL");
      } else {
        setTouchMode("PAN");
      }

      const paramSeries = searchParams.get("series");
      const paramSlice = searchParams.get("slice");
      try {
        const savedStateStr = sessionStorage.getItem(`viewer_state_${studyUID}`) || localStorage.getItem(`viewer_state_${studyUID}`);
        const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;
        const targetSeries = paramSeries !== null ? parseInt(paramSeries, 10) : (savedState?.seriesIndex ?? 0);
        const targetSlice = paramSlice !== null ? parseInt(paramSlice, 10) : (savedState?.sliceIndex ?? 0);

        const seriesIdxValid = !isNaN(targetSeries) && targetSeries >= 0 && targetSeries < (fetchedSeries.length || 1) ? targetSeries : 0;
        setActiveSeriesIndex(seriesIdxValid);

        const targetSeriesObj = fetchedSeries[seriesIdxValid] || fetchedSeries[0];
        const instancesCount = targetSeriesObj?.instances?.length || targetSeriesObj?.totalSlices || 1;
        const sliceIdxValid = !isNaN(targetSlice) && targetSlice >= 0 ? Math.min(targetSlice, instancesCount - 1) : 0;
        setCurrentIndex(sliceIdxValid >= 0 ? sliceIdxValid : 0);
      } catch (e) {
        console.warn("Failed to restore viewer state", e);
      }
    } catch (error) {
      console.error("Failed to load DICOM study for mobile viewer", error);
    } finally {
      setLoading(false);
    }
  }, [studyUID, searchParams, studyMeta?.modality]);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);

  const imageUrl = currentInstance 
    ? (currentInstance.previewUrl || currentInstance.preview_url || `/api/v3/pacs/instance-preview/${currentInstance.id || currentInstance.instance_id}`)
    : "";

  const mainCanvasRef = useRef(null);

  // Render High-Definition DICOM Slice to 2D Canvas with Calibrated Pixel LUT
  const render2DFrame = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const W = img.naturalWidth || 512;
      const H = img.naturalHeight || 512;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2, H / 2);
      if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      ctx.translate(-W / 2, -H / 2);

      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      if (brightness !== 1 || contrast !== 1 || isInverted) {
        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;
        const len = data.length;

        const cFactor = Math.max(0.1, contrast);
        const bOffset = (brightness - 1) * 128;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let lum = 0.299 * r + 0.587 * g + 0.114 * b;
          lum = (lum - 128) * cFactor + 128 + bOffset;

          if (isInverted) lum = 255 - lum;

          const finalVal = Math.round(Math.min(255, Math.max(0, lum)));
          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, brightness, contrast, isInverted, rotation, flipH]);

  useEffect(() => {
    render2DFrame();
  }, [render2DFrame]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && currentInstances.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % currentInstances.length);
      }, 150);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentInstances.length]);

  const nextImage = () => {
    if (currentIndex < currentInstances.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const resetTools = () => {
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
    setBrightness(1);
    setContrast(1);
    setIsInverted(false);
    setFlipH(false);
    setRotation(0);
    setIsPlaying(false);
    setMeasurements([]);
    setActiveMeasure(null);
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      resetTools();
    }
    lastTapTime.current = now;

    if (touchMode === "MEASURE" && e.touches.length === 1 && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      measureStartRef.current = { x, y };
      setActiveMeasure({ start: { x, y }, end: { x, y } });
      return;
    }

    if (e.touches.length === 2) {
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      initialPinchDist.current = Math.hypot(x2 - x1, y2 - y1);
      initialPinchZoom.current = zoom;
    } else if (e.touches.length === 1) {
      touchLastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchDeltaAccumulator.current = { x: 0, y: 0 };
    }
  };

  const handleTouchMove = (e) => {
    isDragging.current = true;

    if (touchMode === "MEASURE" && measureStartRef.current && e.touches.length === 1 && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      setActiveMeasure({ start: measureStartRef.current, end: { x, y } });
      return;
    }

    if (e.touches.length === 2 && initialPinchDist.current) {
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const scale = dist / initialPinchDist.current;
      const newZoom = Math.max(0.5, Math.min(6, parseFloat((initialPinchZoom.current * scale).toFixed(2))));
      setZoom(newZoom);
    } else if (e.touches.length === 1) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const dx = currentX - touchLastPos.current.x;
      const dy = currentY - touchLastPos.current.y;
      touchLastPos.current = { x: currentX, y: currentY };

      if (touchMode === "PAN") {
        setPanPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (touchMode === "WL") {
        setBrightness(b => Math.max(0.2, Math.min(3, parseFloat((b - dy * 0.008).toFixed(2)))));
        setContrast(c => Math.max(0.2, Math.min(3, parseFloat((c + dx * 0.008).toFixed(2)))));
      } else if (touchMode === "SCROLL") {
        touchDeltaAccumulator.current.y += dy;
        const threshold = 14;
        if (touchDeltaAccumulator.current.y <= -threshold) {
          nextImage();
          touchDeltaAccumulator.current.y = 0;
        } else if (touchDeltaAccumulator.current.y >= threshold) {
          prevImage();
          touchDeltaAccumulator.current.y = 0;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    if (touchMode === "MEASURE" && activeMeasure) {
      const dx = activeMeasure.end.x - activeMeasure.start.x;
      const dy = activeMeasure.end.y - activeMeasure.start.y;
      if (Math.hypot(dx, dy) > 8) {
        setMeasurements(prev => [...prev, activeMeasure]);
      }
      measureStartRef.current = null;
      setActiveMeasure(null);
    }

    initialPinchDist.current = null;
    touchDeltaAccumulator.current = { x: 0, y: 0 };
  };

  // RPC postMessage listener from parent RIS / Report Studio window
  useEffect(() => {
    const handleWindowMessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "REQUEST_SNAPSHOT" || data.type === "OHIF_CAPTURE_VIEWPORT") {
        try {
          const canvas = mainCanvasRef.current;
          const canvasDataUrl = canvas ? canvas.toDataURL("image/jpeg", 0.92) : null;
          const seriesUID = activeSeries?.seriesId || activeSeries?.series_id || activeSeries?.series_instance_uid;
          const seriesDesc = activeSeries?.seriesDescription || activeSeries?.series_description || "Series";
          const instId = currentInstance?.id || currentInstance?.instance_id;
          const sliceNum = currentIndex + 1;
          const totSlices = currentInstances.length || activeSeries?.totalSlices || 1;

          const snapshotPayload = {
            type: "SNAPSHOT_CAPTURED",
            payload: {
              dataUrl: canvasDataUrl || imageUrl,
              sopInstanceUid: instId,
              instanceId: instId,
              seriesUID: seriesUID,
              seriesInstanceUid: seriesUID,
              studyInstanceUid: studyUID,
              studyUID: studyUID,
              frameNumber: sliceNum,
              sliceNumber: sliceNum,
              totalSlices: totSlices,
              seriesDescription: seriesDesc,
              caption: `${seriesDesc} | Slice ${sliceNum}`,
              brightness,
              contrast,
              zoom,
              rotation,
              flipH
            }
          };
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(snapshotPayload, "*");
          }
        } catch (e) {
          console.warn("Snapshot event handling error:", e);
        }
      }
    };
    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [imageUrl, activeSeries, currentInstance, currentIndex, currentInstances.length, studyUID, brightness, contrast, zoom, rotation, flipH]);

  const captureSnapshot = async () => {
    try {
      const currentSlice = currentIndexRef.current;
      const series = activeSeriesRef.current;
      const instance = currentInstanceRef.current;
      const meta = studyMetaRef.current;

      if (!series || !instance) {
        alert("Error: No active series or instance");
        return;
      }

      const canvas = mainCanvasRef.current;
      if (!canvas) {
        alert("Error: Canvas not ready");
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      let rawCanvasDataUrl = null;
      try {
        rawCanvasDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      } catch (e) {
        console.error("Canvas export failed:", e);
        rawCanvasDataUrl = imageUrl;
      }

      const compressedDataUrl = await compressImage(rawCanvasDataUrl, 512, 0.7);

      const seriesDesc = series.seriesDescription || series.series_description || "Series";
      const totalCount = currentInstances.length || series.totalSlices || series.total_slices || 1;
      const fullCaption = `${seriesDesc} | Slice ${currentSlice + 1}/${totalCount}`;

      const payload = {
        reportId: null,
        studyUID: studyUID,
        seriesUID: series.seriesId || series.series_id || series.series_instance_uid,
        seriesDescription: seriesDesc,
        sliceNumber: currentSlice + 1,
        totalSlices: totalCount,
        instanceId: instance.id || instance.instance_id,
        sopInstanceUid: instance.id || instance.instance_id,
        modality: meta?.modality || "CT",
        caption: fullCaption,
        dataUrl: compressedDataUrl,
        brightness,
        windowCenter: brightness,
        contrast,
        windowWidth: contrast,
        zoom,
        rotation,
        flipHorizontal: flipH,
        measurementData: { measurements },
        capturedAt: new Date().toISOString()
      };

      console.log("📸 CAPTURING KEY IMAGE:", payload);

      let snapshotObj = null;

      try {
        const res = await fetchWithRetry(() => api.post("/api/v3/key-images/save", payload), 3, 1000);
        if (res?.data?.success && res?.data?.data) {
          snapshotObj = res.data.data;
        }
      } catch (e) {
        console.warn("⚠️ POST /api/v3/key-images/save failed after retries. Adding to offline queue:", e);
        try {
          const pendingQueueStr = localStorage.getItem("pending_key_image_uploads") || "[]";
          let pendingQueue = [];
          try { pendingQueue = JSON.parse(pendingQueueStr); } catch (err) { pendingQueue = []; }
          pendingQueue.push(payload);
          localStorage.setItem("pending_key_image_uploads", JSON.stringify(pendingQueue));
        } catch (queueErr) {
          console.error("Failed to queue key image offline:", queueErr);
        }
      }

      if (!snapshotObj) {
        snapshotObj = payload;
      }

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: "ADD_KEY_IMAGE",
            payload: snapshotObj
          }, "*");
        } catch (e) {
          console.warn("PostMessage to parent failed:", e);
        }
      }

      if (studyUID) {
        try {
          const savedStr = localStorage.getItem(`key_images_${studyUID}`) || "[]";
          let saved = [];
          try { saved = JSON.parse(savedStr); } catch (e) { saved = []; }
          const updated = [snapshotObj, ...saved.filter(s => (typeof s === "string" ? s : (s.previewUrl || s.preview_url || s.dataUrl)) !== (snapshotObj.preview_url || snapshotObj.dataUrl))];
          localStorage.setItem(`key_images_${studyUID}`, JSON.stringify(updated));
        } catch (e) {
          console.warn("LocalStorage key image update error:", e);
        }
      }

      alert(`✅ Key Image Captured!\n${fullCaption}`);

    } catch (error) {
      console.error("Key image capture failed:", error);
      alert("Capture failed: " + error.message);
    }
  };

  if (!studyUID) {
    return (
      <div className="lite-viewer-error">
        <h3>StudyInstanceUID Missing</h3>
        <p>Please select a valid study from the PACS worklist.</p>
        <button onClick={() => navigate(-1)}>Return to PACS</button>
      </div>
    );
  }

  const modalityKey = String(studyMeta?.modality || "CR").toUpperCase();
  const isMPRSupported = (modalityKey === "CT" || modalityKey === "MR") && (currentInstances.length > 2 || (activeSeries?.totalSlices && activeSeries.totalSlices > 2));

  return (
    <div className="lite-viewer-container dark">
      {/* 🌟 ULTRA-SLEEK GLASSMOPHISM HEADER */}
      <header className="lite-viewer-header">
        <button className="icon-btn-glass" onClick={() => navigate(-1)} title="Back to Worklist">
          <ChevronLeft size={20} />
        </button>

        <div className="patient-banner" onClick={() => setShowSeriesDrawer(true)}>
          <div className="patient-title-row">
            <span className="patient-title">{studyMeta?.patientName || "DICOM Mobile Viewer"}</span>
            <span className={`modality-pill mod-${modalityKey.toLowerCase()}`}>{modalityKey}</span>
          </div>
          <span className="patient-sub">
            ID: {studyMeta?.patientId || "PACS-Direct"} • Slice {currentIndex + 1}/{currentInstances.length || 1}
          </span>
        </div>

        <div className="header-actions">
          <button 
            className={`icon-btn-glass ${showPresetsMenu ? "active-glow" : ""}`} 
            onClick={() => setShowPresetsMenu(!showPresetsMenu)} 
            title="W/L Presets"
          >
            <SlidersHorizontal size={18} />
          </button>
          
          {seriesList.length > 1 && (
            <button 
              className={`icon-btn-glass ${showSeriesDrawer ? "active-glow" : ""}`} 
              onClick={() => setShowSeriesDrawer(true)} 
              title="Series Drawer"
            >
              <Layers size={18} />
            </button>
          )}

          <button 
            className="icon-btn-glass action-report" 
            onClick={() => navigate(`/report-studio?study=${studyUID}`)} 
            title="Open Radiology Report Editor"
          >
            <FileText size={18} />
          </button>
        </div>
      </header>

      {/* 🪟 FLOATING HIGH-TECH PRESETS SHEET MENU */}
      {showPresetsMenu && (
        <div className="presets-floating-sheet" onClick={() => setShowPresetsMenu(false)}>
          <div className="presets-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="presets-sheet-header">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-cyan-400" />
                <span className="text-white font-bold text-xs uppercase tracking-wide">
                  Calibrated DICOM W/L Presets
                </span>
              </div>
              <button onClick={() => setShowPresetsMenu(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="presets-grid">
              <button 
                className={`preset-chip ${contrast === 1 && brightness === 1 ? "active" : ""}`}
                onClick={() => { setBrightness(1); setContrast(1); setIsInverted(false); setShowPresetsMenu(false); }}
              >
                <span>Full Dynamic Range</span>
              </button>
              <button 
                className="preset-chip"
                onClick={() => { setBrightness(1.2); setContrast(1.6); setIsInverted(false); setShowPresetsMenu(false); }}
              >
                <span>🧠 Brain / Soft Tissue</span>
              </button>
              <button 
                className="preset-chip"
                onClick={() => { setBrightness(0.8); setContrast(2.2); setIsInverted(false); setShowPresetsMenu(false); }}
              >
                <span>🦴 Bone Windows</span>
              </button>
              <button 
                className="preset-chip"
                onClick={() => { setBrightness(1.4); setContrast(0.6); setIsInverted(false); setShowPresetsMenu(false); }}
              >
                <span>🫁 Lung Parenchyma</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MAIN DICOM CANVAS VIEWPORT */}
      <main 
        className="lite-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showMPRModal && isMPRSupported ? (
          <MobileMPRViewer 
            studyInstanceUID={studyUID} 
            imageIds={currentInstances.map(inst => inst.previewUrl || inst.preview_url || `/api/v3/pacs/instance-preview/${inst.id || inst.instance_id}`)}
          />
        ) : (
          <>
            <canvas 
              ref={mainCanvasRef} 
              className="dicom-canvas"
              style={{
                transform: `scale(${zoom}) translate(${panPosition.x}px, ${panPosition.y}px)`
              }}
            />

            {/* MINIMAL DICOM OVERLAY TEXT */}
            {showOverlayInfo && (
              <div className="viewport-overlay">
                <div className="overlay-top-left">
                  <span>{studyMeta?.patientName || "PATIENT"}</span>
                  <span>ID: {studyMeta?.patientId || "N/A"}</span>
                  <span>ACC: {studyMeta?.accession || "N/A"}</span>
                </div>
                <div className="overlay-top-right">
                  <span>{modalityKey} • {studyMeta?.studyDate || "2026"}</span>
                  <span>{activeSeries?.seriesDescription || activeSeries?.series_description || "Series"}</span>
                </div>
                <div className="overlay-bottom-left">
                  <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                  <span>B: {brightness.toFixed(2)} | C: {contrast.toFixed(2)}</span>
                </div>
                <div className="overlay-bottom-right">
                  <span>Slice: {currentIndex + 1} / {currentInstances.length || 1}</span>
                  <span>Mode: {touchMode}</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 📚 SERIES DRAWER */}
      {showSeriesDrawer && (
        <div className="series-drawer-overlay" onClick={() => setShowSeriesDrawer(false)}>
          <div className="series-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span>Study Series ({seriesList.length})</span>
              <button onClick={() => setShowSeriesDrawer(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="drawer-series-list">
              {seriesList.map((s, idx) => (
                <div 
                  key={idx}
                  className={`drawer-series-card ${idx === activeSeriesIndex ? "active" : ""}`}
                  onClick={() => {
                    setActiveSeriesIndex(idx);
                    setCurrentIndex(0);
                    setShowSeriesDrawer(false);
                  }}
                >
                  <div className="drawer-thumb-wrapper">
                    <img 
                      src={s.instances?.[0]?.previewUrl || s.instances?.[0]?.preview_url || `/api/v3/pacs/instance-preview/${s.instances?.[0]?.id || s.instances?.[0]?.instance_id}`} 
                      alt="" 
                      className="drawer-thumb" 
                    />
                  </div>
                  <div className="drawer-series-info">
                    <span className="drawer-series-desc">{s.seriesDescription || s.series_description || `Series ${idx + 1}`}</span>
                    <span className="drawer-series-meta">{s.instances?.length || s.totalSlices || s.total_slices || 0} Slices</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ BOTTOM FLOATING TOOLBAR */}
      <footer className="lite-bottom-toolbar">
        <button 
          className={`tool-tab-btn ${touchMode === "SCROLL" ? "active" : ""}`} 
          onClick={() => setTouchMode("SCROLL")}
          title="Scroll Slices"
        >
          <Activity size={18} />
          <span>Scroll</span>
        </button>

        <button 
          className={`tool-tab-btn ${touchMode === "PAN" ? "active" : ""}`} 
          onClick={() => setTouchMode("PAN")}
          title="Pan / Zoom View"
        >
          <Move size={18} />
          <span>Pan</span>
        </button>

        <button 
          className={`tool-tab-btn ${touchMode === "WL" ? "active" : ""}`} 
          onClick={() => setTouchMode("WL")}
          title="Adjust Window / Level"
        >
          <Sun size={18} />
          <span>W / L</span>
        </button>

        <button 
          className="snapshot-btn-sparkle" 
          onClick={captureSnapshot}
          title="1-Click Key Image Capture"
        >
          <Camera size={16} />
          <span>Capture Key Image</span>
        </button>

        {isMPRSupported && (
          <button 
            className={`tool-tab-btn ${showMPRModal ? "active" : ""}`} 
            onClick={() => setShowMPRModal(!showMPRModal)}
            title="3D MPR Reconstruction"
          >
            <Layers size={18} />
            <span>3D MPR</span>
          </button>
        )}
      </footer>
    </div>
  );
};

export default MobileLiteViewerV3;
