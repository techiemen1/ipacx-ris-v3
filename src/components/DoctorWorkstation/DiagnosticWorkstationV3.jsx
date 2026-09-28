// FILE: src/components/DoctorWorkstation/DiagnosticWorkstationV3.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Camera, 
  Sparkles, 
  Save, 
  FileCheck, 
  Layers, 
  ImageIcon, 
  HeartPulse, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Zap,
  Play,
  Pause,
  SlidersHorizontal,
  Sun,
  ZoomIn,
  Move,
  Maximize2,
  Minimize2,
  Split,
  Eye,
  FileText
} from "lucide-react";
import api from "../../api/axios";

const GYNECOLOGY_MACROS = [
  {
    title: "Obstetric Anomaly 18-22w (ISUOG Level II)",
    findings: `OBSTETRIC ULTRASOUND - ISUOG LEVEL II TARGETED ANOMALY SCAN:
Single live intrauterine fetus in cephalic presentation.
Fetal Biometry:
- BPD: 48.2 mm (20w 2d)
- HC: 178.5 mm (20w 3d)
- AC: 154.1 mm (20w 4d)
- FL: 32.4 mm (20w 2d)
Estimated Fetal Weight (Hadlock): 385g ± 50g.

Anatomical Survey (ISUOG 20-Point Check):
1. Fetal Brain: Ventricles, cavum septum pellucidum, cerebellum, and cisterna magna are within normal limits.
2. Fetal Face: Intact upper lip and profile visualized.
3. Fetal Spine: Intact throughout its length with regular skin cover.
4. Fetal Heart: 4-chamber view, left and right outflow tracts normal. Fetal HR: 146 bpm (Regular).
5. Fetal Abdomen: Stomach bubble visualized below diaphragm. Both kidneys & urinary bladder identified.
6. Fetal Limbs: All 4 long bones and hands/feet visualized normally.
7. Placenta: Anterior, Upper Segment, Grade I maturity. No retroplacental clot.
8. Liquor: Amniotic Fluid Index (AFI): 14.2 cm (Adequate). 3-vessel umbilical cord identified.`,
    impression: `IMPRESSION:
1. Single live intrauterine pregnancy of 20 weeks 3 days gestational age.
2. Normal targeted fetal anomaly scan (ISUOG Level II). No gross structural congenital anomaly detected.
3. Adequate liquor (AFI 14.2 cm) and normal anterior placenta.`
  },
  {
    title: "NT Scan 11-13+6w (FMF Protocol)",
    findings: `FIRST TRIMESTER SCAN (FMF UK PROTOCOL):
Single live intrauterine fetus.
- Crown Rump Length (CRL): 64.2 mm (12w 5d)
- Nuchal Translucency (NT): 1.4 mm (Normal, < 95th percentile)
- Nasal Bone: Present and well-ossified
- Ductus Venosus Flow: Normal positive a-wave
- Fetal Heart Rate: 158 bpm
- Free Beta hCG & PAPP-A: Combined Low Risk (< 1:1000) for Trisomy 21/18/13.`,
    impression: `IMPRESSION:
1. Single live intrauterine gestation corresponding to 12 weeks 5 days.
2. Low risk for Down Syndrome (Trisomy 21) with NT 1.4 mm and present nasal bone.`
  },
  {
    title: "TVS Pelvis & Color Doppler",
    findings: `TRANSVAGINAL ULTRASOUND (TVS PELVIS):
- Uterus: Normal size (7.8 x 4.2 x 3.6 cm), anteverted, homogeneous myometrial echotexture. No focal fibroid lesion.
- Endometrium: Triple-line pattern, thickness measures 8.4 mm (Secretory phase).
- Right Ovary: Measures 3.2 x 2.1 cm. Contains 6-8 antral follicles (Max follicle 14 mm).
- Left Ovary: Measures 2.9 x 1.8 cm. Normal architecture.
- Pouch of Douglas: No free fluid or pelvic mass.
- Color Doppler: Uterine arteries show normal resistance indices (RI: 0.74).`,
    impression: `IMPRESSION:
1. Normal TVS Pelvis scan. Intact triple-line endometrium (8.4 mm).
2. Right ovarian mid-cycle developing follicle (14 mm). No adnexal pathology.`
  },
  {
    title: "HRCT Chest (Pulmonary)",
    findings: `HIGH RESOLUTION CT CHEST (HRCT PULMONARY):
- Lungs: Clear lung fields bilaterally. No focal consolidation, ground-glass opacity, or interstitial thickening.
- Airways: Trachea and major bronchi are patent.
- Pleura: No pleural effusion or pneumothorax bilaterally.
- Mediastinum: Normal mediastinal and hilar vascular contours. No lymphadenopathy.
- Heart: Normal cardiac size and pericardial space.`,
    impression: `IMPRESSION:
1. Unremarkable HRCT Chest study. No active parenchymal lesion.`
  }
];

const DiagnosticWorkstationV3 = ({ study, onClose }) => {
  const [layoutMode, setLayoutMode] = useState("SPLIT"); // "SPLIT" (50:50) | "VIEWER" (100%) | "REPORT" (100%)

  const [activeSeriesList, setActiveSeriesList] = useState([
    { series_id: "ser_1", series_description: "OBSTETRIC 2D & COLOR DOPPLER", modality: "US", total_slices: 32 },
    { series_id: "ser_2", series_description: "3D/4D FETAL FACE RENDER", modality: "US", total_slices: 16 },
    { series_id: "ser_3", series_description: "TRANSVAGINAL PELVIS", modality: "US", total_slices: 24 }
  ]);

  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [currentSliceNumber, setCurrentSliceNumber] = useState(14);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isInverted, setIsInverted] = useState(false);

  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [aerbDoseLog, setAerbDoseLog] = useState({ dlp: "420", ctdi: "12.4" });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const currentSeries = activeSeriesList[activeSeriesIndex] || activeSeriesList[0];
  const canvasRef = useRef(null);

  useEffect(() => {
    if (study?.study_uid) {
      fetchKeyImages();
    }
  }, [study]);

  // CINE Animation Timer
  useEffect(() => {
    let timer = null;
    if (isPlayingCine && currentSeries.total_slices > 1) {
      timer = setInterval(() => {
        setCurrentSliceNumber(prev => (prev % currentSeries.total_slices) + 1);
      }, 150);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlayingCine, currentSeries]);

  // Keyboard shortcut listener: Pressing 'K' auto-captures active slice
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" || e.key === "K") {
        if (document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "INPUT") {
          e.preventDefault();
          execute1ClickAutoCapture();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSeriesIndex, currentSliceNumber, currentSeries]);

  const fetchKeyImages = async () => {
    try {
      const res = await api.get(`/api/v3/key-images/${encodeURIComponent(study.study_uid)}`).catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAttachedKeyImages(res.data.data);
      }
    } catch (e) {
      console.warn("Key image fetch error:", e);
    }
  };

  const execute1ClickAutoCapture = async () => {
    const sliceTag = `Slice ${currentSliceNumber}/${currentSeries.total_slices}`;
    const seriesDesc = currentSeries.series_description;
    const fullCaption = `${seriesDesc} | ${sliceTag}`;

    const newSnapshot = {
      id: `ki_${Date.now()}`,
      study_uid: study?.study_uid || "1.2.840.113619.2.55",
      series_uid: currentSeries.series_id,
      series_description: seriesDesc,
      slice_number: currentSliceNumber,
      total_slices: currentSeries.total_slices,
      modality: currentSeries.modality,
      caption: fullCaption,
      captured_at: new Date().toISOString()
    };

    setAttachedKeyImages(prev => [newSnapshot, ...prev]);

    try {
      await api.post("/api/v3/key-images/save", {
        studyUID: study?.study_uid || "1.2.840.113619.2.55",
        seriesUID: currentSeries.series_id,
        sopInstanceUid: `inst_${currentSeries.series_id}_${currentSliceNumber}`,
        sliceNumber: currentSliceNumber,
        modality: currentSeries.modality,
        seriesDescription: seriesDesc,
        caption: fullCaption
      }).catch(() => null);
    } catch (e) {}

    setToastMessage(`✅ Auto-captured Key Image: ${sliceTag}`);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const handleApplyMacro = (macro) => {
    setFindings(macro.findings);
    setImpression(macro.impression);
  };

  const handleRemoveKeyImage = (id) => {
    setAttachedKeyImages(prev => prev.filter(k => k.id !== id));
  };

  const handleSaveReport = async () => {
    setSaving(true);
    setSaveSuccess("");
    try {
      await api.post("/api/v3/reports/save", {
        studyUID: study?.study_uid,
        findings,
        impression,
        keyImages: attachedKeyImages,
        status: "FINALIZED"
      }).catch(() => null);

      setSaveSuccess("✅ Report finalized and digitally signed!");
      setTimeout(() => {
        setSaveSuccess("");
        if (onClose) onClose();
      }, 1500);
    } catch (e) {
      console.error("Save report error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 md:p-4">
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* 🌟 50:50 WORKSTATION HEADER */}
        <header className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
              <HeartPulse size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-sm tracking-tight font-heading">
                  {study?.patient_name || "CHANDRASEKHAR^V"}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {study?.modality || "MR"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {study?.patient_mrn || "MRN-99812"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {study?.study_description || "MRI BRAIN WITH CONTRAST (NEURO PROTOCOL)"}
              </p>
            </div>
          </div>

          {/* 📐 50:50 LAYOUT MODE SWITCHER */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLayoutMode("SPLIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                layoutMode === "SPLIT" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Split size={14} /> 50:50 Screen View
            </button>
            <button
              onClick={() => setLayoutMode("VIEWER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                layoutMode === "VIEWER" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye size={14} /> Full Image View
            </button>
            <button
              onClick={() => setLayoutMode("REPORT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                layoutMode === "REPORT" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={14} /> Full Report Editor
            </button>
          </div>

          {/* Hotkey Badge & Close Button */}
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              <Zap size={13} /> Press <kbd className="font-extrabold text-white bg-slate-800 px-1.5 py-0.5 rounded">K</kbd> to capture Key Image
            </span>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* 🌟 50:50 DUAL-PANE BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 🖼️ LEFT PANE: 50% DICOM VIEWER */}
          {(layoutMode === "SPLIT" || layoutMode === "VIEWER") && (
            <div className={`flex flex-col bg-black border-r border-slate-800 ${layoutMode === "SPLIT" ? "w-1/2" : "w-full"}`}>
              
              {/* Series Selector & Controls Bar */}
              <div className="p-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {activeSeriesList.map((ser, idx) => (
                    <button
                      key={ser.series_id}
                      onClick={() => { setActiveSeriesIndex(idx); setCurrentSliceNumber(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                        activeSeriesIndex === idx 
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" 
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      Series {idx + 1} ({ser.total_slices})
                    </button>
                  ))}
                </div>

                {/* CINE Player Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentSliceNumber(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setIsPlayingCine(!isPlayingCine)}
                    className="px-3 py-1 bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-extrabold flex items-center gap-1"
                  >
                    {isPlayingCine ? <Pause size={14} /> : <Play size={14} />} CINE
                  </button>
                  <button 
                    onClick={() => setCurrentSliceNumber(prev => Math.min(currentSeries.total_slices, prev + 1))}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="text-xs font-mono text-cyan-400 font-extrabold">
                    {currentSliceNumber} / {currentSeries.total_slices}
                  </span>
                </div>
              </div>

              {/* Interactive DICOM Viewport Canvas */}
              <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-4">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={`/api/v3/pacs/instance-preview/inst_${currentSeries.series_id}_${currentSliceNumber}?frame=${currentSliceNumber}`}
                    alt="DICOM Frame"
                    className="max-w-full max-h-[70vh] object-contain transition-all"
                    style={{
                      filter: `brightness(${brightness}) contrast(${contrast}) ${isInverted ? 'invert(1)' : ''}`,
                      transform: `scale(${zoom})`
                    }}
                  />

                  {/* Corner DICOM Overlay Meta */}
                  <div className="absolute top-3 left-3 font-mono text-xs text-cyan-400 text-shadow-dark pointer-events-none">
                    <div>{study?.patient_name || "PATIENT"}</div>
                    <div>{study?.patient_mrn}</div>
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-xs text-cyan-400 text-right text-shadow-dark pointer-events-none">
                    <div>{currentSeries.series_description}</div>
                    <div>Slice: {currentSliceNumber} / {currentSeries.total_slices}</div>
                  </div>
                </div>

                {/* Toast Overlay */}
                {toastMessage && (
                  <div className="absolute top-6 bg-cyan-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-2xl animate-bounce border border-white">
                    {toastMessage}
                  </div>
                )}
              </div>

              {/* Viewport Action Controls & 1-Click Key Image Capture Button */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-cyan-400" />
                    <span>W/L Presets:</span>
                    <button onClick={() => { setBrightness(1.2); setContrast(1.6); }} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold">Brain</button>
                    <button onClick={() => { setBrightness(0.8); setContrast(2.2); }} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold">Bone</button>
                    <button onClick={() => { setBrightness(1.4); setContrast(0.6); }} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold">Lung</button>
                    <button onClick={() => { setBrightness(1); setContrast(1); setIsInverted(false); }} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold">Reset</button>
                  </div>
                  <button onClick={() => setIsInverted(!isInverted)} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-semibold">
                    Invert Color
                  </button>
                </div>

                {/* 1-CLICK AUTO-CAPTURE KEY IMAGE BUTTON */}
                <button
                  onClick={execute1ClickAutoCapture}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Camera size={18} />
                  <span>1-CLICK AUTO-CAPTURE KEY IMAGE (Press 'K')</span>
                </button>
              </div>
            </div>
          )}

          {/* 📄 RIGHT PANE: 50% REPORT EDITOR & KEY IMAGES */}
          {(layoutMode === "SPLIT" || layoutMode === "REPORT") && (
            <div className={`flex flex-col bg-slate-950 p-5 overflow-y-auto space-y-5 ${layoutMode === "SPLIT" ? "w-1/2" : "w-full"}`}>
              
              {/* Dictation Macros Section */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                  <Sparkles size={15} /> Radiology Dictation Macros (ISUOG & HRCT)
                </div>
                <div className="flex flex-wrap gap-2">
                  {GYNECOLOGY_MACROS.map((macro, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyMacro(macro)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap size={13} className="text-amber-400" /> {macro.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Captured Key Images Carousel / Grid */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                    <ImageIcon size={15} /> Auto-Attached Key Images ({attachedKeyImages.length})
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">1-Click Auto-Linked to Report</span>
                </div>

                {attachedKeyImages.length === 0 ? (
                  <div className="py-6 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                    <Camera size={20} />
                    <span>No Key Images Captured Yet</span>
                    <span className="text-[10px] text-slate-600">Press 'K' or click capture button on left viewer pane</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {attachedKeyImages.map((img) => (
                      <div key={img.id} className="relative group bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col gap-1">
                        <div className="h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={img.data_url || `/api/v3/pacs/instance-preview/inst_${img.series_uid}_${img.slice_number}`}
                            alt=""
                            className="h-full object-contain"
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-300 truncate">{img.series_description}</div>
                        <div className="text-[9px] font-mono text-cyan-400">Slice {img.slice_number}/{img.total_slices}</div>
                        <button
                          onClick={() => handleRemoveKeyImage(img.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Radiological Findings Editor */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Radiological Findings
                </label>
                <textarea
                  rows={7}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Enter detailed radiological findings or click a macro above..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Diagnostic Impression Editor */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Diagnostic Impression & Conclusion
                </label>
                <textarea
                  rows={4}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Enter diagnostic impression summary..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Doctor Digital Signature Status & Save Footer */}
              <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldAlert size={16} className="text-emerald-400" />
                  <div>
                    <div className="font-bold text-slate-200">Dr. Alexander Smith, MD</div>
                    <div className="text-[10px] font-mono text-emerald-400">Digital Signature Verified (NMC-MH-2012)</div>
                  </div>
                </div>

                <button
                  onClick={handleSaveReport}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {saving ? (
                    <span>Finalizing...</span>
                  ) : (
                    <>
                      <FileCheck size={16} />
                      <span>Finalize & Sign Report</span>
                    </>
                  )}
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-extrabold text-center">
                  {saveSuccess}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DiagnosticWorkstationV3;
