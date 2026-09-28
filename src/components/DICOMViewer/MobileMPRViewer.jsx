import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  Layers, 
  Activity, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  SlidersHorizontal,
  RotateCw,
  Grid,
  ArrowUpDown,
  Sliders,
  Move,
  Sun,
  ZoomIn,
  Scroll
} from "lucide-react";
import "./MobileMPRViewer.css";

/**
 * DICOM International Standard (PS 3.3 / PS 3.17) Multiplanar Reconstruction (MPR) & MIP Engine
 */
const DICOM_WL_PRESETS = {
  FULL: { name: "📷 Full Grayscale (Default)", width: 256, center: 128 },
  BRAIN: { name: "🧠 Brain CT", width: 120, center: 110 },
  SOFT_TISSUE: { name: "🥩 Soft Tissue", width: 150, center: 100 },
  BONE: { name: "🦴 Bone", width: 180, center: 160 },
  LUNG: { name: "🫁 Lung / Air", width: 140, center: 60 },
  HIGH_CONTRAST: { name: "⚡ High Contrast", width: 80, center: 100 },
};

const PROJECTION_MODES = {
  OFF: { id: "OFF", label: "Thin Slice (1mm)" },
  MIP: { id: "MIP", label: "MIP (Max Intensity)" },
  MINIP: { id: "MINIP", label: "MinIP (Airways/Lungs)" },
  AIP: { id: "AIP", label: "AIP (Average/Mean)" }
};

const get2DContext = (canvas, options = {}) => {
  if (!canvas) return null;
  try {
    return canvas.getContext("2d", { colorSpace: "srgb", willReadFrequently: true, ...options });
  } catch (e) {
    try {
      return canvas.getContext("2d", { willReadFrequently: true, ...options });
    } catch (err) {
      return canvas.getContext("2d");
    }
  }
};

export default function MobileMPRViewer({ studyInstanceUID, imageIds = [] }) {
  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [viewMode, setViewMode] = useState("GRID"); // "GRID" | "AXIAL" | "SAGITTAL" | "CORONAL"
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [projectionMode, setProjectionMode] = useState("MIP");
  const [slabThickness, setSlabThickness] = useState(12);
  const [obliqueAngle, setObliqueAngle] = useState(0);
  const [invertZ, setInvertZ] = useState(false);
  const [activeToolMode, setActiveToolMode] = useState("CROSSHAIR");

  const [activePresetKey, setActivePresetKey] = useState("FULL");
  const [windowWidth, setWindowWidth] = useState(256);
  const [windowCenter, setWindowCenter] = useState(128);
  const [zScale, setZScale] = useState(0.85);

  const [viewportTransform, setViewportTransform] = useState({
    AXIAL: { zoom: 1.0, panX: 0, panY: 0 },
    SAGITTAL: { zoom: 1.0, panX: 0, panY: 0 },
    CORONAL: { zoom: 1.0, panX: 0, panY: 0 }
  });

  const wlDragStartRef = useRef(null);
  const touchPinchDistRef = useRef(null);
  const touchStartZoomRef = useRef(1.0);
  const touchLastPosRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef({ time: 0, plane: null });

  const [crosshair, setCrosshair] = useState({ x: 256, y: 256, z: 5 });
  const [volumeMeta, setVolumeMeta] = useState({ width: 512, height: 512, depth: 10 });
  
  const volumeVoxelBufferRef = useRef(null);
  const isBufferReadyRef = useRef(false);

  useEffect(() => {
    try {
      if (window.innerWidth < 1024 && document.documentElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_err) {}
  }, []);

  const lutTable = useMemo(() => {
    const lut = new Uint8Array(256);
    const minVal = windowCenter - windowWidth / 2;
    const ww = Math.max(1, windowWidth);

    for (let b = 0; b < 256; b++) {
      if (b <= minVal) {
        lut[b] = 0;
      } else if (b >= minVal + ww) {
        lut[b] = 255;
      } else {
        lut[b] = Math.round(((b - minVal) / ww) * 255);
      }
    }
    return lut;
  }, [windowWidth, windowCenter]);

  useEffect(() => {
    let isSubscribed = true;
    const loadVolumeStack = async () => {
      setIsLoading(true);
      setLoadingProgress(5);
      isBufferReadyRef.current = false;

      if (!imageIds || imageIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const totalSlices = imageIds.length;
      const targetW = 512;
      const targetH = 512;

      const voxelBuffer = new Uint8Array(targetW * targetH * totalSlices);
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = targetW;
      offscreenCanvas.height = targetH;
      const offscreenCtx = get2DContext(offscreenCanvas);
      if (offscreenCtx) {
        offscreenCtx.imageSmoothingEnabled = true;
        offscreenCtx.imageSmoothingQuality = "high";
      }

      let loadedCount = 0;
      const CONCURRENCY_BATCH_SIZE = 16;

      const fetchSlice = (idx) => {
        return new Promise((resolve) => {
          if (!isSubscribed) return resolve();
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (isSubscribed && offscreenCtx) {
              offscreenCtx.clearRect(0, 0, targetW, targetH);
              offscreenCtx.drawImage(img, 0, 0, targetW, targetH);
              const imgData = offscreenCtx.getImageData(0, 0, targetW, targetH);
              const data = imgData.data;

              const sliceVoxelCount = targetW * targetH;
              const sliceOffset = idx * sliceVoxelCount;

              for (let p = 0; p < sliceVoxelCount; p++) {
                const r = data[p * 4];
                const g = data[p * 4 + 1];
                const b = data[p * 4 + 2];
                voxelBuffer[sliceOffset + p] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
              }
            }
            loadedCount++;
            if (isSubscribed) {
              setLoadingProgress(Math.round((loadedCount / totalSlices) * 100));
            }
            resolve();
          };
          img.onerror = () => {
            loadedCount++;
            resolve();
          };
          img.src = imageIds[idx];
        });
      };

      for (let i = 0; i < totalSlices; i += CONCURRENCY_BATCH_SIZE) {
        if (!isSubscribed) return;
        const batchPromises = [];
        for (let j = i; j < Math.min(totalSlices, i + CONCURRENCY_BATCH_SIZE); j++) {
          batchPromises.push(fetchSlice(j));
        }
        await Promise.all(batchPromises);
      }

      if (!isSubscribed) return;

      volumeVoxelBufferRef.current = voxelBuffer;
      isBufferReadyRef.current = true;
      setVolumeMeta({ width: targetW, height: targetH, depth: totalSlices });

      const calculatedZScale = Math.min(1.2, Math.max(0.5, (totalSlices / targetH) * 1.75));
      setZScale(parseFloat(calculatedZScale.toFixed(2)));

      setCrosshair({ 
        x: Math.floor(targetW / 2), 
        y: Math.floor(targetH / 2), 
        z: Math.floor(totalSlices / 2) 
      });

      setLoadingProgress(100);
      setIsLoading(false);
    };

    loadVolumeStack();

    return () => {
      isSubscribed = false;
      volumeVoxelBufferRef.current = null;
      isBufferReadyRef.current = false;
    };
  }, [imageIds]);

  const renderPlanes = useCallback(() => {
    if (!isBufferReadyRef.current || !volumeVoxelBufferRef.current) return;

    const buffer = volumeVoxelBufferRef.current;
    const { width: W, height: H, depth: D } = volumeMeta;
    const slicePixels = W * H;

    const isProjActive = projectionMode !== "OFF";
    const isFullVol = slabThickness >= 500;
    const halfSlab = isProjActive 
      ? (isFullVol ? Math.max(W, H, D) : Math.max(1, Math.floor(slabThickness / 2))) 
      : 0;

    const drawAnatomicalLabels = (ctx, topText, bottomText, leftText, rightText, width, height) => {
      ctx.save();
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(topText, width / 2, 6);

      ctx.textBaseline = "bottom";
      ctx.fillText(bottomText, width / 2, height - 6);

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(leftText, 6, height / 2);

      ctx.textAlign = "right";
      ctx.fillText(rightText, width - 6, height / 2);
      ctx.restore();
    };

    // 1. AXIAL RECONSTRUCTION
    const axialCanvas = axialCanvasRef.current;
    if (axialCanvas) {
      axialCanvas.width = W;
      axialCanvas.height = H;
      const ctx = get2DContext(axialCanvas);
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const axialImgData = ctx.createImageData(W, H);
        const data = axialImgData.data;
        const curZ = Math.min(Math.max(0, crosshair.z), D - 1);

        const zMin = isProjActive ? Math.max(0, curZ - halfSlab) : curZ;
        const zMax = isProjActive ? Math.min(D - 1, curZ + halfSlab) : curZ;

        for (let y = 0; y < H; y++) {
          const rowOffset = y * W;
          for (let x = 0; x < W; x++) {
            const pOffset = rowOffset + x;
            let finalRaw = 0;

            if (!isProjActive || zMin === zMax) {
              finalRaw = buffer[curZ * slicePixels + pOffset];
            } else if (projectionMode === "MIP") {
              let maxVal = 0;
              for (let z = zMin; z <= zMax; z++) {
                const val = buffer[z * slicePixels + pOffset];
                if (val > maxVal) maxVal = val;
              }
              finalRaw = maxVal;
            } else if (projectionMode === "MINIP") {
              let minVal = 255;
              for (let z = zMin; z <= zMax; z++) {
                const val = buffer[z * slicePixels + pOffset];
                if (val < minVal) minVal = val;
              }
              finalRaw = minVal;
            } else if (projectionMode === "AIP") {
              let sum = 0;
              const count = zMax - zMin + 1;
              for (let z = zMin; z <= zMax; z++) {
                sum += buffer[z * slicePixels + pOffset];
              }
              finalRaw = Math.round(sum / count);
            }

            const lutPixel = lutTable[finalRaw];
            const outIdx = pOffset * 4;
            data[outIdx] = lutPixel;
            data[outIdx + 1] = lutPixel;
            data[outIdx + 2] = lutPixel;
            data[outIdx + 3] = 255;
          }
        }

        ctx.putImageData(axialImgData, 0, 0);

        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(crosshair.x, 0); ctx.lineTo(crosshair.x, H);
        ctx.moveTo(0, crosshair.y); ctx.lineTo(W, crosshair.y);
        ctx.stroke();

        drawAnatomicalLabels(ctx, "A", "P", "R", "L", W, H);
      }
    }

    // 2. SAGITTAL RECONSTRUCTION
    const sagCanvas = sagittalCanvasRef.current;
    if (sagCanvas) {
      sagCanvas.width = H;
      sagCanvas.height = H;
      const ctx = get2DContext(sagCanvas);
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const sagImgData = ctx.createImageData(H, H);
        const data = sagImgData.data;
        const curX = Math.min(Math.max(0, crosshair.x), W - 1);
        const xMin = isProjActive ? Math.max(0, curX - halfSlab) : curX;
        const xMax = isProjActive ? Math.min(W - 1, curX + halfSlab) : curX;

        for (let canvasY = 0; canvasY < H; canvasY++) {
          const normRatio = canvasY / Math.max(1, H - 1);
          const zFloat = invertZ ? (1 - normRatio) * (D - 1) : normRatio * (D - 1);
          
          const z0 = Math.floor(zFloat);
          const z1 = Math.min(D - 1, z0 + 1);
          const zm1 = Math.max(0, z0 - 1);
          const zp2 = Math.min(D - 1, z1 + 1);
          
          const t = zFloat - z0;
          const t2 = t * t;
          const t3 = t2 * t;

          const z0Offset = z0 * slicePixels;
          const z1Offset = z1 * slicePixels;
          const zm1Offset = zm1 * slicePixels;
          const zp2Offset = zp2 * slicePixels;

          for (let y = 0; y < H; y++) {
            const yW = y * W;
            let finalRaw = 0;

            if (!isProjActive || xMin === xMax) {
              const vm1 = buffer[zm1Offset + yW + curX];
              const v0  = buffer[z0Offset + yW + curX];
              const v1  = buffer[z1Offset + yW + curX];
              const vp2 = buffer[zp2Offset + yW + curX];
              
              const a0 = -0.5 * vm1 + 1.5 * v0 - 1.5 * v1 + 0.5 * vp2;
              const a1 = vm1 - 2.5 * v0 + 2.0 * v1 - 0.5 * vp2;
              const a2 = -0.5 * vm1 + 0.5 * v1;
              const a3 = v0;

              const interpVal = a0 * t3 + a1 * t2 + a2 * t + a3;
              finalRaw = Math.round(Math.min(255, Math.max(0, interpVal)));
            } else if (projectionMode === "MIP") {
              let maxVal = 0;
              for (let x = xMin; x <= xMax; x++) {
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                const interp = v0 * (1 - t) + v1 * t;
                if (interp > maxVal) maxVal = interp;
              }
              finalRaw = Math.round(maxVal);
            } else if (projectionMode === "MINIP") {
              let minVal = 255;
              for (let x = xMin; x <= xMax; x++) {
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                const interp = v0 * (1 - t) + v1 * t;
                if (interp < minVal) minVal = interp;
              }
              finalRaw = Math.round(minVal);
            } else if (projectionMode === "AIP") {
              let sum = 0;
              const count = xMax - xMin + 1;
              for (let x = xMin; x <= xMax; x++) {
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                sum += (v0 * (1 - t) + v1 * t);
              }
              finalRaw = Math.round(sum / count);
            }

            const lutPixel = lutTable[Math.min(255, Math.max(0, finalRaw))];
            const outIdx = (canvasY * H + y) * 4;
            data[outIdx] = lutPixel;
            data[outIdx + 1] = lutPixel;
            data[outIdx + 2] = lutPixel;
            data[outIdx + 3] = 255;
          }
        }

        ctx.putImageData(sagImgData, 0, 0);

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(crosshair.y, 0); ctx.lineTo(crosshair.y, H);
        
        const zNormRatio = crosshair.z / Math.max(1, D - 1);
        const zLineY = invertZ ? (1 - zNormRatio) * H : zNormRatio * H;
        ctx.moveTo(0, zLineY); ctx.lineTo(H, zLineY);
        ctx.stroke();

        const topLabel = invertZ ? "I" : "S";
        const bottomLabel = invertZ ? "S" : "I";
        drawAnatomicalLabels(ctx, topLabel, bottomLabel, "A", "P", H, H);
      }
    }

    // 3. CORONAL RECONSTRUCTION
    const corCanvas = coronalCanvasRef.current;
    if (corCanvas) {
      corCanvas.width = W;
      corCanvas.height = H;
      const ctx = get2DContext(corCanvas);
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const corImgData = ctx.createImageData(W, H);
        const data = corImgData.data;
        const curY = Math.min(Math.max(0, crosshair.y), H - 1);
        const yMin = isProjActive ? Math.max(0, curY - halfSlab) : curY;
        const yMax = isProjActive ? Math.min(H - 1, curY + halfSlab) : curY;

        for (let canvasY = 0; canvasY < H; canvasY++) {
          const normRatio = canvasY / Math.max(1, H - 1);
          const zFloat = invertZ ? (1 - normRatio) * (D - 1) : normRatio * (D - 1);
          
          const z0 = Math.floor(zFloat);
          const z1 = Math.min(D - 1, z0 + 1);
          const zm1 = Math.max(0, z0 - 1);
          const zp2 = Math.min(D - 1, z1 + 1);

          const t = zFloat - z0;
          const t2 = t * t;
          const t3 = t2 * t;

          const z0Offset = z0 * slicePixels;
          const z1Offset = z1 * slicePixels;
          const zm1Offset = zm1 * slicePixels;
          const zp2Offset = zp2 * slicePixels;

          for (let x = 0; x < W; x++) {
            let finalRaw = 0;

            if (!isProjActive || yMin === yMax) {
              const vm1 = buffer[zm1Offset + curY * W + x];
              const v0  = buffer[z0Offset + curY * W + x];
              const v1  = buffer[z1Offset + curY * W + x];
              const vp2 = buffer[zp2Offset + curY * W + x];
              
              const a0 = -0.5 * vm1 + 1.5 * v0 - 1.5 * v1 + 0.5 * vp2;
              const a1 = vm1 - 2.5 * v0 + 2.0 * v1 - 0.5 * vp2;
              const a2 = -0.5 * vm1 + 0.5 * v1;
              const a3 = v0;

              const interpVal = a0 * t3 + a1 * t2 + a2 * t + a3;
              finalRaw = Math.round(Math.min(255, Math.max(0, interpVal)));
            } else if (projectionMode === "MIP") {
              let maxVal = 0;
              for (let y = yMin; y <= yMax; y++) {
                const yW = y * W;
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                const interp = v0 * (1 - t) + v1 * t;
                if (interp > maxVal) maxVal = interp;
              }
              finalRaw = Math.round(maxVal);
            } else if (projectionMode === "MINIP") {
              let minVal = 255;
              for (let y = yMin; y <= yMax; y++) {
                const yW = y * W;
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                const interp = v0 * (1 - t) + v1 * t;
                if (interp < minVal) minVal = interp;
              }
              finalRaw = Math.round(minVal);
            } else if (projectionMode === "AIP") {
              let sum = 0;
              const count = yMax - yMin + 1;
              for (let y = yMin; y <= yMax; y++) {
                const yW = y * W;
                const v0 = buffer[z0Offset + yW + x];
                const v1 = buffer[z1Offset + yW + x];
                sum += (v0 * (1 - t) + v1 * t);
              }
              finalRaw = Math.round(sum / count);
            }

            const lutPixel = lutTable[Math.min(255, Math.max(0, finalRaw))];
            const outIdx = (canvasY * W + x) * 4;
            data[outIdx] = lutPixel;
            data[outIdx + 1] = lutPixel;
            data[outIdx + 2] = lutPixel;
            data[outIdx + 3] = 255;
          }
        }

        const tempC = document.createElement("canvas");
        tempC.width = W; tempC.height = H;
        const tempCtx = tempC.getContext("2d");
        if (tempCtx) {
          tempCtx.putImageData(corImgData, 0, 0);
        }

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        if (obliqueAngle !== 0) {
          ctx.translate(W / 2, H / 2);
          ctx.rotate((obliqueAngle * Math.PI) / 180);
          ctx.translate(-W / 2, -H / 2);
        }
        ctx.drawImage(tempC, 0, 0, W, H);
        ctx.restore();

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(crosshair.x, 0); ctx.lineTo(crosshair.x, H);
        
        const zNormRatio = crosshair.z / Math.max(1, D - 1);
        const zLineY = invertZ ? (1 - zNormRatio) * H : zNormRatio * H;
        ctx.moveTo(0, zLineY); ctx.lineTo(W, zLineY);
        ctx.stroke();

        const topLabel = invertZ ? "I" : "S";
        const bottomLabel = invertZ ? "S" : "I";
        drawAnatomicalLabels(ctx, topLabel, bottomLabel, "R", "L", W, H);
      }
    }
  }, [crosshair, volumeMeta, projectionMode, slabThickness, obliqueAngle, invertZ, lutTable, zScale]);

  useEffect(() => {
    renderPlanes();
  }, [renderPlanes, viewMode]);

  const handleWheelScroll = useCallback((e, plane) => {
    if (e.cancelable) e.preventDefault();
    const rawDelta = Math.sign(e.deltaY);
    if (rawDelta === 0) return;

    setCrosshair(prev => {
      const { width: W, height: H, depth: D } = volumeMeta;
      if (plane === "AXIAL") {
        const newZ = Math.min(D - 1, Math.max(0, prev.z + rawDelta));
        return { ...prev, z: newZ };
      } else if (plane === "SAGITTAL") {
        const stepSize = Math.max(1, Math.round(W / Math.max(1, D)));
        const newX = Math.min(W - 1, Math.max(0, prev.x + rawDelta * stepSize));
        return { ...prev, x: newX };
      } else if (plane === "CORONAL") {
        const stepSize = Math.max(1, Math.round(H / Math.max(1, D)));
        const newY = Math.min(H - 1, Math.max(0, prev.y + rawDelta * stepSize));
        return { ...prev, y: newY };
      }
      return prev;
    });
  }, [volumeMeta]);

  const getTransformedNormalizedCoords = useCallback((clientX, clientY, canvas, plane) => {
    if (!canvas) return { normX: 0.5, normY: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const transform = viewportTransform[plane] || { zoom: 1.0, panX: 0, panY: 0 };
    const z = transform.zoom || 1.0;

    const rawX = (clientX - rect.left) / rect.width;
    const rawY = (clientY - rect.top) / rect.height;

    const normX = (rawX - 0.5) / z - (transform.panX / rect.width) + 0.5;
    const normY = (rawY - 0.5) / z - (transform.panY / rect.height) + 0.5;

    return {
      normX: Math.min(1, Math.max(0, normX)),
      normY: Math.min(1, Math.max(0, normY))
    };
  }, [viewportTransform]);

  const handleInteractionEnd = useCallback(() => {
    touchPinchDistRef.current = null;
    touchLastPosRef.current = null;
    wlDragStartRef.current = null;
  }, []);

  const handleInteraction = useCallback((e, plane, eventType) => {
    const isTouch = !!(e.touches && e.touches.length > 0);
    const touchCount = e.touches ? e.touches.length : (e.buttons ? 1 : 0);

    if (isTouch && touchCount === 2) {
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      if (eventType === "start" || !touchPinchDistRef.current) {
        touchPinchDistRef.current = dist;
        touchStartZoomRef.current = viewportTransform[plane]?.zoom || 1.0;
        touchLastPosRef.current = { x: midX, y: midY };
      } else {
        const scaleRatio = dist / touchPinchDistRef.current;
        const newZoom = Math.max(0.5, Math.min(8.0, parseFloat((touchStartZoomRef.current * scaleRatio).toFixed(2))));

        const dx = midX - touchLastPosRef.current.x;
        const dy = midY - touchLastPosRef.current.y;
        touchLastPosRef.current = { x: midX, y: midY };

        setViewportTransform(prev => ({
          ...prev,
          [plane]: {
            zoom: newZoom,
            panX: prev[plane].panX + dx,
            panY: prev[plane].panY + dy
          }
        }));
      }
      return;
    }

    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    if (eventType === "start") {
      touchPinchDistRef.current = null;
      wlDragStartRef.current = { x: clientX, y: clientY, startW: windowWidth, startC: windowCenter };
      touchLastPosRef.current = { x: clientX, y: clientY };

      const now = Date.now();
      if (lastTapRef.current.plane === plane && (now - lastTapRef.current.time) < 300) {
        const curZoom = viewportTransform[plane]?.zoom || 1.0;
        const targetZoom = curZoom > 1.2 ? 1.0 : 2.5;
        setViewportTransform(prev => ({
          ...prev,
          [plane]: { zoom: targetZoom, panX: 0, panY: 0 }
        }));
        lastTapRef.current = { time: 0, plane: null };
        return;
      }
      lastTapRef.current = { time: now, plane };
    }

    if (activeToolMode === "ZOOM_PAN" && touchLastPosRef.current && (eventType === "move" || eventType === "drag")) {
      const dx = clientX - touchLastPosRef.current.x;
      const dy = clientY - touchLastPosRef.current.y;
      touchLastPosRef.current = { x: clientX, y: clientY };

      setViewportTransform(prev => ({
        ...prev,
        [plane]: {
          ...prev[plane],
          panX: prev[plane].panX + dx,
          panY: prev[plane].panY + dy
        }
      }));
      return;
    }

    if (activeToolMode === "WL" && wlDragStartRef.current && (eventType === "move" || eventType === "drag")) {
      const dx = clientX - wlDragStartRef.current.x;
      const dy = clientY - wlDragStartRef.current.y;

      const newW = Math.max(10, Math.min(512, wlDragStartRef.current.startW + dx * 0.8));
      const newC = Math.max(0, Math.min(255, wlDragStartRef.current.startC - dy * 0.8));

      setWindowWidth(Math.round(newW));
      setWindowCenter(Math.round(newC));
      return;
    }

    const isSingleViewActive = viewMode !== "GRID";
    const isScrollingActive = activeToolMode === "SCROLL" || (isSingleViewActive && activeToolMode === "CROSSHAIR");

    if (isScrollingActive && touchLastPosRef.current && (eventType === "move" || eventType === "drag")) {
      const dy = clientY - touchLastPosRef.current.y;
      if (Math.abs(dy) >= 4) {
        const step = Math.sign(dy);
        touchLastPosRef.current = { x: clientX, y: clientY };
        setCrosshair(prev => {
          const { width: W, height: H, depth: D } = volumeMeta;
          if (plane === "AXIAL") {
            const newZ = Math.min(D - 1, Math.max(0, prev.z + step));
            return { ...prev, z: newZ };
          } else if (plane === "SAGITTAL") {
            const stepSize = Math.max(1, Math.round(W / Math.max(1, D)));
            const newX = Math.min(W - 1, Math.max(0, prev.x + step * stepSize));
            return { ...prev, x: newX };
          } else if (plane === "CORONAL") {
            const stepSize = Math.max(1, Math.round(H / Math.max(1, D)));
            const newY = Math.min(H - 1, Math.max(0, prev.y + step * stepSize));
            return { ...prev, y: newY };
          }
          return prev;
        });
      }
      return;
    }

    if (activeToolMode !== "CROSSHAIR") return;

    const canvas = e.currentTarget;
    const { normX, normY } = getTransformedNormalizedCoords(clientX, clientY, canvas, plane);
    const D = volumeMeta.depth;

    if (plane === "AXIAL") {
      setCrosshair(prev => ({
        ...prev,
        x: Math.floor(normX * volumeMeta.width),
        y: Math.floor(normY * volumeMeta.height)
      }));
    } else if (plane === "SAGITTAL") {
      const zVal = invertZ ? normY * (D - 1) : (1 - normY) * (D - 1);
      setCrosshair(prev => ({
        ...prev,
        y: Math.floor(normX * volumeMeta.height),
        z: Math.min(D - 1, Math.max(0, Math.floor(zVal)))
      }));
    } else if (plane === "CORONAL") {
      const zVal = invertZ ? normY * (D - 1) : (1 - normY) * (D - 1);
      setCrosshair(prev => ({
        ...prev,
        x: Math.floor(normX * volumeMeta.width),
        z: Math.min(D - 1, Math.max(0, Math.floor(zVal)))
      }));
    }
  }, [activeToolMode, viewMode, windowWidth, windowCenter, viewportTransform, volumeMeta, invertZ, getTransformedNormalizedCoords]);

  useEffect(() => {
    const attachNativeListeners = (canvasRef, plane) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const onTouchStartNative = (e) => {
        if (e.cancelable) e.preventDefault();
        handleInteraction(e, plane, "start");
      };

      const onTouchMoveNative = (e) => {
        if (e.cancelable) e.preventDefault();
        handleInteraction(e, plane, "move");
      };

      const onTouchEndNative = (_e) => {
        handleInteractionEnd();
      };

      const onWheelNative = (e) => {
        handleWheelScroll(e, plane);
      };

      canvas.addEventListener("touchstart", onTouchStartNative, { passive: false });
      canvas.addEventListener("touchmove", onTouchMoveNative, { passive: false });
      canvas.addEventListener("touchend", onTouchEndNative, { passive: false });
      canvas.addEventListener("wheel", onWheelNative, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", onTouchStartNative);
        canvas.removeEventListener("touchmove", onTouchMoveNative);
        canvas.removeEventListener("touchend", onTouchEndNative);
        canvas.removeEventListener("wheel", onWheelNative);
      };
    };

    const cleanupAxial = attachNativeListeners(axialCanvasRef, "AXIAL");
    const cleanupSagittal = attachNativeListeners(sagittalCanvasRef, "SAGITTAL");
    const cleanupCoronal = attachNativeListeners(coronalCanvasRef, "CORONAL");

    window.addEventListener("mouseup", handleInteractionEnd);
    window.addEventListener("touchend", handleInteractionEnd);

    return () => {
      if (cleanupAxial) cleanupAxial();
      if (cleanupSagittal) cleanupSagittal();
      if (cleanupCoronal) cleanupCoronal();
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [handleInteraction, handleWheelScroll, handleInteractionEnd]);

  const resetViewportZoom = (plane) => {
    setViewportTransform(prev => ({
      ...prev,
      [plane]: { zoom: 1.0, panX: 0, panY: 0 }
    }));
  };

  const handleSelectPreset = (key) => {
    const p = DICOM_WL_PRESETS[key];
    if (p) {
      setActivePresetKey(key);
      setWindowWidth(p.width);
      setWindowCenter(p.center);
    }
  };

  return (
    <div className={`mpr-container ${isFullscreen ? "fullscreen" : ""}`}>
      <header className="mpr-mobile-header">
        <div className="mpr-header-line-1">
          <div className="mpr-title-compact">
            <Layers size={15} className="text-cyan-400" />
            <span className="mpr-title-text">3D MPR</span>
          </div>

          <div className="mpr-select-wrapper" title="Layout View">
            <Grid size={13} className="select-icon" />
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="mpr-compact-select"
            >
              <option value="GRID">📐 3-Grid View</option>
              <option value="AXIAL">🔴 Axial View</option>
              <option value="SAGITTAL">🟢 Sagittal View</option>
              <option value="CORONAL">🔵 Coronal View</option>
            </select>
          </div>

          <div className="mpr-select-wrapper" title="Projection Mode">
            <Activity size={13} className="select-icon" />
            <select 
              value={projectionMode} 
              onChange={(e) => setProjectionMode(e.target.value)}
              className="mpr-compact-select"
            >
              <option value="OFF">🔪 Thin Slice (1mm)</option>
              <option value="MIP">⚡ MIP (Max)</option>
              <option value="MINIP">💨 MinIP (Airways)</option>
              <option value="AIP">📊 AIP (Average)</option>
            </select>
          </div>

          <div className="mpr-select-wrapper" title="Window/Level Preset">
            <Sliders size={13} className="select-icon" />
            <select 
              value={activePresetKey} 
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="mpr-compact-select"
            >
              {Object.entries(DICOM_WL_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mpr-header-line-2">
          <div className="mpr-tool-symbols">
            <button 
              className={`mpr-symbol-btn ${activeToolMode === "CROSSHAIR" ? "active" : ""}`}
              onClick={() => setActiveToolMode("CROSSHAIR")}
              title="Crosshairs Tool"
            >
              <Move size={15} />
            </button>
            <button 
              className={`mpr-symbol-btn ${activeToolMode === "SCROLL" ? "active" : ""}`}
              onClick={() => setActiveToolMode("SCROLL")}
              title="Touch Slice Scroll"
            >
              <Scroll size={15} />
            </button>
            <button 
              className={`mpr-symbol-btn ${activeToolMode === "WL" ? "active" : ""}`}
              onClick={() => setActiveToolMode("WL")}
              title="Window / Level Drag"
            >
              <Sun size={15} />
            </button>
            <button 
              className={`mpr-symbol-btn ${activeToolMode === "ZOOM_PAN" ? "active" : ""}`}
              onClick={() => setActiveToolMode("ZOOM_PAN")}
              title="Pinch Zoom & Pan"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {projectionMode !== "OFF" && (
            <div className="mpr-slab-compact">
              <SlidersHorizontal size={12} />
              <span>Slab: {slabThickness >= 500 ? "Full" : `${slabThickness}mm`}</span>
              <input 
                type="range" 
                min="2" 
                max="500" 
                step="4"
                value={slabThickness} 
                onChange={(e) => setSlabThickness(parseInt(e.target.value, 10))} 
              />
              <button 
                className={`mpr-full-chip ${slabThickness >= 500 ? "active" : ""}`}
                onClick={() => setSlabThickness(slabThickness >= 500 ? 12 : 500)}
                title="Full Volume MIP"
              >
                Full
              </button>
            </div>
          )}

          <div className="mpr-actions-compact">
            <button 
              className={`mpr-symbol-btn ${invertZ ? "active" : ""}`} 
              onClick={() => setInvertZ(!invertZ)} 
              title="Flip Head-to-Toe Z Orientation"
            >
              <ArrowUpDown size={15} />
            </button>

            <button 
              className="mpr-symbol-btn" 
              onClick={() => setObliqueAngle(a => (a + 15) % 360)} 
              title="Rotate Oblique Angle (+15°)"
            >
              <RotateCw size={15} />
            </button>

            <button 
              className="mpr-symbol-btn" 
              onClick={() => { 
                setObliqueAngle(0); 
                setProjectionMode("MIP"); 
                setSlabThickness(12); 
                setInvertZ(false); 
                setActiveToolMode("CROSSHAIR"); 
                setActivePresetKey("FULL");
                setWindowWidth(256);
                setWindowCenter(128);
                setZScale(0.85); 
                setViewportTransform({
                  AXIAL: { zoom: 1.0, panX: 0, panY: 0 },
                  SAGITTAL: { zoom: 1.0, panX: 0, panY: 0 },
                  CORONAL: { zoom: 1.0, panX: 0, panY: 0 }
                });
              }} 
              title="Reset Viewers"
            >
              <RefreshCw size={15} />
            </button>

            <button 
              className="mpr-symbol-btn" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mpr-grid mode-${viewMode.toLowerCase()}`}>
        <div className={`mpr-viewport-card axial-card ${viewMode !== "GRID" && viewMode !== "AXIAL" ? "hidden-mode" : ""} ${viewMode === "AXIAL" ? "focused-full" : ""}`}>
          <div className="viewport-overlay-label axial-overlay">
            <span className="overlay-title">Axial (Z-Plane)</span>
            <span className="overlay-meta">Slice Z: {crosshair.z + 1}/{volumeMeta.depth}</span>
            {viewportTransform.AXIAL.zoom > 1.01 && (
              <button className="reset-zoom-chip" onClick={() => resetViewportZoom("AXIAL")}>
                {viewportTransform.AXIAL.zoom}x ↺
              </button>
            )}
          </div>
          <div className="canvas-wrapper">
            <canvas 
              ref={axialCanvasRef} 
              className="mpr-viewport-element" 
              style={{
                transform: `scale(${viewportTransform.AXIAL.zoom}) translate(${viewportTransform.AXIAL.panX}px, ${viewportTransform.AXIAL.panY}px)`,
                transition: touchPinchDistRef.current ? "none" : "transform 0.08s ease-out"
              }}
              onMouseDown={(e) => handleInteraction(e, "AXIAL", "start")}
              onMouseMove={(e) => e.buttons === 1 && handleInteraction(e, "AXIAL", "drag")}
              onMouseUp={handleInteractionEnd}
              onMouseLeave={handleInteractionEnd}
            />
          </div>
        </div>

        <div className={`mpr-viewport-card sagittal-card ${viewMode !== "GRID" && viewMode !== "SAGITTAL" ? "hidden-mode" : ""} ${viewMode === "SAGITTAL" ? "focused-full" : ""}`}>
          <div className="viewport-overlay-label sagittal-overlay">
            <span className="overlay-title">Sagittal (X-Plane)</span>
            <span className="overlay-meta">Slice X: {crosshair.x + 1}/{volumeMeta.width}</span>
            {viewportTransform.SAGITTAL.zoom > 1.01 && (
              <button className="reset-zoom-chip" onClick={() => resetViewportZoom("SAGITTAL")}>
                {viewportTransform.SAGITTAL.zoom}x ↺
              </button>
            )}
          </div>
          <div className="canvas-wrapper">
            <canvas 
              ref={sagittalCanvasRef} 
              className="mpr-viewport-element" 
              style={{
                transform: `scale(${viewportTransform.SAGITTAL.zoom}) translate(${viewportTransform.SAGITTAL.panX}px, ${viewportTransform.SAGITTAL.panY}px)`,
                transition: touchPinchDistRef.current ? "none" : "transform 0.08s ease-out"
              }}
              onMouseDown={(e) => handleInteraction(e, "SAGITTAL", "start")}
              onMouseMove={(e) => e.buttons === 1 && handleInteraction(e, "SAGITTAL", "drag")}
              onMouseUp={handleInteractionEnd}
              onMouseLeave={handleInteractionEnd}
            />
          </div>
        </div>

        <div className={`mpr-viewport-card coronal-card ${viewMode !== "GRID" && viewMode !== "CORONAL" ? "hidden-mode" : ""} ${viewMode === "CORONAL" ? "focused-full" : ""}`}>
          <div className="viewport-overlay-label coronal-overlay">
            <span className="overlay-title">Coronal (Y-Plane)</span>
            <span className="overlay-meta">Slice Y: {crosshair.y + 1}/{volumeMeta.height}</span>
            {viewportTransform.CORONAL.zoom > 1.01 && (
              <button className="reset-zoom-chip" onClick={() => resetViewportZoom("CORONAL")}>
                {viewportTransform.CORONAL.zoom}x ↺
              </button>
            )}
          </div>
          <div className="canvas-wrapper">
            <canvas 
              ref={coronalCanvasRef} 
              className="mpr-viewport-element" 
              style={{
                transform: `scale(${viewportTransform.CORONAL.zoom}) translate(${viewportTransform.CORONAL.panX}px, ${viewportTransform.CORONAL.panY}px)`,
                transition: touchPinchDistRef.current ? "none" : "transform 0.08s ease-out"
              }}
              onMouseDown={(e) => handleInteraction(e, "CORONAL", "start")}
              onMouseMove={(e) => e.buttons === 1 && handleInteraction(e, "CORONAL", "drag")}
              onMouseUp={handleInteractionEnd}
              onMouseLeave={handleInteractionEnd}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mpr-loading-overlay">
          <div className="mpr-spinner" />
          <div className="mpr-loading-text">
            <span>Building 512x512 High-Definition 3D Matrix...</span>
            <div className="mpr-progress-bar">
              <div className="mpr-progress-fill" style={{ width: `${loadingProgress}%` }} />
            </div>
            <small>{loadingProgress}% Processed via Calibrated GPU LUT</small>
          </div>
        </div>
      )}
    </div>
  );
}
