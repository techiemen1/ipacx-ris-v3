// FILE: src/components/DoctorWorkstation/DiagnosticWorkstationV3.jsx
import React, { useState, useEffect } from "react";
import { X, Camera, Sparkles, Save, FileCheck, Layers, Image as ImageIcon } from "lucide-react";
import api from "../../api/axios";

const DiagnosticWorkstationV3 = ({ study, onClose }) => {
  const [activeSeriesList, setActiveSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [targetSliceNum, setTargetSliceNum] = useState("1");
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (study?.study_uid) {
      fetchSeriesAndKeyImages();
    }
  }, [study]);

  const fetchSeriesAndKeyImages = async () => {
    try {
      // Mock / Real API for study series
      const mockSeries = [
        { series_id: "ser_1", series_description: "T2 AXIAL BRAIN", modality: "MR", total_slices: 32 },
        { series_id: "ser_2", series_description: "T1 SAGITTAL BRAIN", modality: "MR", total_slices: 28 },
        { series_id: "ser_3", series_description: "FLAIR AXIAL", modality: "MR", total_slices: 32 }
      ];
      setActiveSeriesList(mockSeries);
      if (mockSeries.length > 0) setSelectedSeriesId(mockSeries[0].series_id);

      // Fetch attached key images from API
      const res = await api.get(`/api/v3/key-images/${encodeURIComponent(study.study_uid)}`).catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAttachedKeyImages(res.data.data);
      }
    } catch (e) {
      console.warn("Series fetch error:", e);
    }
  };

  const handle1ClickKeyImageCapture = async () => {
    const seriesObj = activeSeriesList.find(s => String(s.series_id) === String(selectedSeriesId)) || activeSeriesList[0];
    const slice = parseInt(targetSliceNum || "1", 10);
    const sDesc = seriesObj?.series_description || "Diagnostic Series";

    const payload = {
      studyUID: study.study_uid,
      seriesUID: seriesObj?.series_id || "ser_1",
      sopInstanceUid: `sop_${Date.now()}`,
      sliceNumber: slice,
      modality: seriesObj?.modality || "MR",
      seriesDescription: sDesc,
      dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
      caption: `${sDesc} | Slice ${slice}/${seriesObj?.total_slices || 30}`
    };

    try {
      const res = await api.post("/api/v3/key-images/save", payload);
      if (res?.data?.success && res?.data?.data) {
        setAttachedKeyImages(prev => [res.data.data, ...prev]);
      }
    } catch (e) {
      console.error("1-Click key image capture error:", e);
    }
  };

  const handleGenerateAIImpression = async () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setImpression(`AI IMPRESSION DRAFT:\n1. No acute intra-cranial hemorrhage or mass effect detected.\n2. Ventricles and sulci are within normal limits for age.\n3. Key images attached verify unremarkable T2/FLAIR signal intensity.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck size={20} className="text-cyan-400" />
              Diagnostic Workstation Studio — {study?.patient_name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">MRN: {study?.patient_mrn} • Modality: {study?.modality} • {study?.study_description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Split Screen Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-hidden">
          {/* Left: Key Image Selection & Viewer Controls */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Layers size={16} className="text-cyan-400" /> Key Image Selection Controls
              </span>
              <button
                onClick={handle1ClickKeyImageCapture}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
              >
                <Camera size={14} /> 1-Click Key Image
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Target Series</label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {activeSeriesList.map(s => (
                    <option key={s.series_id} value={s.series_id}>{s.series_description} ({s.total_slices} Slices)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Target Slice Number</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={targetSliceNum}
                  onChange={(e) => setTargetSliceNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Attached Key Image Gallery */}
            <div className="flex-1 border border-slate-800/80 rounded-xl p-3 bg-slate-950/80 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-cyan-400" /> Attached Key Images ({attachedKeyImages.length})
              </div>

              {attachedKeyImages.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8">No Key Images Attached Yet</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {attachedKeyImages.map((img, idx) => (
                    <div key={img.id || idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="font-bold text-white truncate">{img.series_description || "Key Image"}</div>
                      <div className="text-slate-400 font-mono text-[10px]">Slice {img.slice_number}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Radiology Report Findings & AI Assistant */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <FileCheck size={16} className="text-cyan-400" /> Diagnostic Report & AI Studio
              </span>
              <button
                onClick={handleGenerateAIImpression}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
              >
                <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} /> AI Impression Draft
              </button>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Radiological Findings</label>
              <textarea
                rows={4}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Enter radiological findings or use voice dictation..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Impression & Conclusion</label>
              <textarea
                rows={4}
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                placeholder="Final impression..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 mt-auto">
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Close
              </button>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30">
                <Save size={14} /> Finalize Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWorkstationV3;
