// FILE: src/pages/MobileLiteViewerV3.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ChevronLeft, Layers, Camera, SlidersHorizontal, Activity } from "lucide-react";

const MobileLiteViewerV3 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studyUID = searchParams.get("study") || searchParams.get("study_uid") || searchParams.get("studyUID");

  const [seriesList, setSeriesList] = useState([]);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Progressive Buffer Map & RAF Throttling for Android Memory Stability
  const imageCacheRef = useRef(new Map());
  const rafPendingRef = useRef(false);
  const touchLastY = useRef(0);

  const currentIndexRef = useRef(currentIndex);
  const activeSeriesRef = useRef(null);

  const activeSeries = seriesList[activeSeriesIndex] || { instances: [] };
  const currentInstances = activeSeries.instances || [];
  const currentInstance = currentInstances[currentIndex];

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activeSeriesRef.current = activeSeries; }, [activeSeries]);

  useEffect(() => {
    if (studyUID) fetchStudyData();
  }, [studyUID]);

  const fetchStudyData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v3/pacs/mobile-study/${encodeURIComponent(studyUID)}`).catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.series)) {
        setSeriesList(res.data.series);
      }
    } catch (e) {
      console.error("Mobile study fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Progressive Bounded Preloading (±5 slices around active index)
  useEffect(() => {
    if (!currentInstances || currentInstances.length === 0) return;
    const windowSize = 5;
    const start = Math.max(0, currentIndex - windowSize);
    const end = Math.min(currentInstances.length - 1, currentIndex + windowSize);

    for (let i = start; i <= end; i++) {
      const inst = currentInstances[i];
      if (!inst) continue;
      const url = inst.preview_url || `/api/v3/pacs/instance-preview/${inst.id || inst.instance_id}`;
      if (!imageCacheRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        imageCacheRef.current.set(url, img);
      }
    }
  }, [currentIndex, currentInstances]);

  // RequestAnimationFrame Touch Drag Throttling (30 FPS Max Ceiling)
  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;
    const dy = currentY - touchLastY.current;
    touchLastY.current = currentY;

    if (rafPendingRef.current) return;
    rafPendingRef.current = true;

    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      const threshold = 12;
      if (dy <= -threshold) {
        if (currentIndexRef.current < currentInstances.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (dy >= threshold) {
        if (currentIndexRef.current > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    });
  };

  const captureSnapshot = async () => {
    const slice = currentIndexRef.current;
    const series = activeSeriesRef.current;
    const instance = currentInstances[slice];

    if (!series || !instance) return;

    const seriesDesc = series.series_description || "Series";
    const totalCount = currentInstances.length || series.total_slices || 1;
    const caption = `${seriesDesc} | Slice ${slice + 1}/${totalCount}`;

    const payload = {
      studyUID,
      seriesUID: series.series_id || series.series_instance_uid,
      sopInstanceUid: instance.id || instance.instance_id,
      sliceNumber: slice + 1,
      modality: series.modality || "CT",
      seriesDescription: seriesDesc,
      dataUrl: instance.preview_url || `/api/v3/pacs/instance-preview/${instance.id || instance.instance_id}`,
      caption
    };

    try {
      await api.post("/api/v3/key-images/save", payload);
      alert(`✅ Key Image Captured!\n${caption}`);
    } catch (e) {
      alert("Capture error: " + e.message);
    }
  };

  return (
    <div 
      className="lite-v3-container bg-slate-950 text-white min-h-screen flex flex-col select-none touch-none"
      onTouchStart={(e) => { touchLastY.current = e.touches[0].clientY; }}
      onTouchMove={handleTouchMove}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs font-bold text-slate-200">
          Mobile Viewer v3 • Slice {currentIndex + 1}/{currentInstances.length || 1}
        </span>
        <button onClick={captureSnapshot} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-600/30">
          <Camera size={14} /> Capture
        </button>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        {currentInstance ? (
          <img
            src={currentInstance.preview_url || `/api/v3/pacs/instance-preview/${currentInstance.id || currentInstance.instance_id}`}
            alt="DICOM Frame"
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        ) : (
          <div className="text-slate-500 text-xs flex items-center gap-2">
            <Activity className="animate-spin" size={16} /> Loading DICOM Frame...
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLiteViewerV3;
