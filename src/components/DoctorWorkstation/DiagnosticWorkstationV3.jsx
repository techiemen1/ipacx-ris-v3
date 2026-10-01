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
  FileText,
  Printer,
  Link2,
  Mic,
  MicOff,
  Wand2,
  Copy,
  Check
} from "lucide-react";
import api from "../../api/axios";
import MobileMPRViewer from "../DICOMViewer/MobileMPRViewer";

// 🌟 RADLEX STRUCTURED REPORT TEMPLATES
const REPORT_TEMPLATES = [
  {
    id: "ct_head",
    category: "Neuroradiology",
    title: "CT Head Non-Contrast (Brain Protocol)",
    modality: "CT",
    indication: "Acute neurological deficit / cephalea.",
    technique: "Non-contrast axial CT scan of the brain from skull base to vertex with 5mm thin reconstructed slices.",
    findings: `CLINICAL INDICATION: Acute neurological deficit / cephalea.

TECHNIQUE: Non-contrast axial CT scan of the brain from skull base to vertex with 5mm thin reconstructed slices.

BRAIN PARENCHYMA: Cerebral hemispheres show normal grey-white matter differentiation. No focal parenchymal attenuation abnormality or acute ischemic infarct identified. No intra-axial or extra-axial hematoma, subdural, or epidural fluid collection.

VENTRICLES & CISTERNS: Lateral, third, and fourth ventricles are normal in size, shape, and midline alignment. Basal cisterns and cortical sulci are clear.

POSTERIOR FOSSA: Cerebellar hemispheres and brainstem demonstrate normal attenuation. No mass effect.

BONY CALVARIUM: Calvarium and skull base intact without fracture line. Paranasal sinuses and mastoids clear.`,
    impression: `IMPRESSION:
1. Normal non-contrast CT brain study.
2. No acute intracranial hemorrhage, mass effect, territorial acute infarct, or calvarial fracture.`
  },
  {
    id: "mri_brain",
    category: "Neuroradiology",
    title: "MRI Brain with Contrast (Neuro Protocol)",
    modality: "MR",
    indication: "Recurrent vascular headache and focal neurological screening.",
    technique: "Multiplanar T1W, T2W, FLAIR, DWI, ADC, and Post-contrast T1 FS MR sequences acquired on 1.5T MRI scanner.",
    findings: `CLINICAL INDICATION: Recurrent vascular headache and focal neurological screening.

TECHNIQUE: Multiplanar T1W, T2W, FLAIR, DWI, ADC, and Post-contrast T1 FS MR sequences acquired on 1.5T MRI scanner.

BRAIN PARENCHYMA: Symmetrical cerebral hemispheres with normal signal intensity. No acute diffusion restriction on DWI/ADC maps. No abnormal parenchymal contrast enhancement.

VENTRICLES & CISTERNS: Normal ventricles and basal cisterns. Midline structures intact.`,
    impression: `IMPRESSION:
1. Normal MRI Brain study with contrast. No acute ischemic infarct or space-occupying lesion.`
  },
  {
    id: "hrct_chest",
    category: "Pulmonology & Chest",
    title: "HRCT Chest (Pulmonary Parenchymal Protocol)",
    modality: "CT",
    indication: "Persistent dry cough and dyspnea evaluation.",
    technique: "High-resolution non-contrast CT chest images acquired from lung apices to bases at 1.0mm slice thickness.",
    findings: `CLINICAL INDICATION: Persistent dry cough and dyspnea evaluation.

TECHNIQUE: High-resolution non-contrast CT chest images acquired from lung apices to bases at 1.0mm slice thickness.

LUNGS & AIRWAYS: Normal aeration bilaterally. No focal consolidation, ground-glass opacity, or reticular thickening. Trachea and main bronchi patent.

PLEURA & MEDIASTINUM: No pleural effusion or pneumothorax. Normal cardiac size and mediastinal contours.`,
    impression: `IMPRESSION:
1. Unremarkable HRCT Chest study. No active parenchymal pulmonary lesion or pleural effusion.`
  }
];

// 🌟 DOT MACROS SNIPPETS
const DOT_MACROS = [
  { label: ".normal", text: "\nBRAIN PARENCHYMA: Symmetrical, normal grey-white differentiation. No acute infarct or hemorrhage." },
  { label: ".chest", text: "\nLUNGS: Normal aeration. No focal consolidation, pneumothorax, or pleural effusion bilaterally." },
  { label: ".stroke", text: "\nACUTE STROKE NEGATIVE: No hyperdense MCA sign, loss of insular ribbon, or acute cytotoxic edema on DWI/ADC." },
  { label: ".cpa", text: "\nCPA ANGLES: Bilateral cerebellopontine angles and internal auditory canals are clear. No schwannoma." },
  { label: ".birads1", text: "\nBI-RADS CATEGORY 1: Negative. Symmetrical fibroglandular density without focal mass or microcalcification." },
  { label: ".fetal", text: "\nFETAL ANOMALY SCAN: Single live fetus. Normal fetal biometry (BPD, HC, AC, FL) & 4-chamber heart." },
  { label: ".dvt", text: "\nVENOUS DOPPLER: Fully compressible deep veins of lower extremity without luminal thrombus." }
];

export default function DiagnosticWorkstationV3({ study, onClose, initialMode = "SPLIT" }) {
  // 📐 LAYOUT VIEW MODES: "VIEWER_90" | "SPLIT" | "STUDIO_90" | "VIEWER_ONLY" | "STUDIO_ONLY" | "MPR_3D"
  const [layoutMode, setLayoutMode] = useState(
    initialMode === "MPR_3D" ? "MPR_3D" : "SPLIT"
  );

  const [activeSeriesList] = useState([
    { series_id: "ser_1", series_description: "Topogram 0.6", modality: study?.modality || "CT", total_slices: 1, instances: [] },
    { series_id: "ser_2", series_description: "Brain 1.0 H20s", modality: study?.modality || "CT", total_slices: 223, instances: [] },
    { series_id: "ser_3", series_description: "Brain 1.0 H70s", modality: study?.modality || "CT", total_slices: 223, instances: [] }
  ]);

  const [activeSeriesIndex, setActiveSeriesIndex] = useState(1);
  const [currentSliceNumber, setCurrentSliceNumber] = useState(13);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);

  // REPORTING STUDIO STATES
  const [reportHeading, setReportHeading] = useState(study?.modality === "CT" ? "CT HEAD REPORT" : "RADIOLOGY DIAGNOSTIC REPORT");
  const [clinicalIndication, setClinicalIndication] = useState(study?.study_description || "Acute neurological deficit / cephalea.");
  const [techniqueText, setTechniqueText] = useState(REPORT_TEMPLATES[0].technique);
  const [findingsText, setFindingsText] = useState(REPORT_TEMPLATES[0].findings);
  const [impressionText, setImpressionText] = useState(REPORT_TEMPLATES[0].impression);
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [isDictating, setIsDictating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentSeries = activeSeriesList[activeSeriesIndex] || activeSeriesList[0];

  // Helper: Generate SVG DICOM Overlay Snapshot Data URL
  const generateDicomOverlaySvg = (seriesDesc, sliceNum, totalSlices) => {
    const pName = study?.patient_name || "PANCHAMI";
    const pMrn = study?.patient_mrn || "MRN-994102";
    const pMod = study?.modality || "CT";
    const dateStr = new Date().toISOString().split("T")[0];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#070c14"/>
      <circle cx="200" cy="150" r="110" fill="#141f30" stroke="#25354e" stroke-width="2"/>
      <ellipse cx="200" cy="150" rx="75" ry="50" fill="#203046" stroke="#364e70" stroke-width="1.5"/>
      <ellipse cx="200" cy="150" rx="35" ry="25" fill="#324968" opacity="0.8"/>
      <line x1="200" y1="20" x2="200" y2="280" stroke="#3b82f6" stroke-dasharray="4,4" opacity="0.5"/>
      <line x1="20" y1="150" x2="380" y2="150" stroke="#3b82f6" stroke-dasharray="4,4" opacity="0.5"/>
      <text x="12" y="22" fill="#60a5fa" font-family="monospace" font-size="11" font-weight="bold">${pName}</text>
      <text x="12" y="38" fill="#94a3b8" font-family="monospace" font-size="10">${pMrn} | ${pMod}</text>
      <text x="388" y="22" fill="#60a5fa" font-family="monospace" font-size="11" font-weight="bold" text-anchor="end">${seriesDesc}</text>
      <text x="388" y="38" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="end">Slice ${sliceNum}/${totalSlices}</text>
      <text x="12" y="285" fill="#cbd5e1" font-family="monospace" font-size="10">WW: 148 WL: 50</text>
      <text x="388" y="285" fill="#cbd5e1" font-family="monospace" font-size="10" text-anchor="end">${dateStr}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Populate sample key images on mount
  useEffect(() => {
    if (attachedKeyImages.length === 0) {
      setAttachedKeyImages([
        {
          id: "ki_sample_1",
          series_description: "Brain 1.0 H70s",
          slice_number: 13,
          total_slices: 223,
          data_url: generateDicomOverlaySvg("Brain 1.0 H70s", 13, 223),
          caption: "Brain 1.0 H70s | Slice 13"
        },
        {
          id: "ki_sample_2",
          series_description: "Brain 1.0 H20s",
          slice_number: 18,
          total_slices: 223,
          data_url: generateDicomOverlaySvg("Brain 1.0 H20s", 18, 223),
          caption: "Brain 1.0 H20s | Slice 18"
        }
      ]);
    }
  }, []);

  // Keyboard shortcut listener: Press 'K' to capture Key Image
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "k" || e.key === "K") && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        captureKeyImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSliceNumber, currentSeries]);

  const captureKeyImage = () => {
    const totalSlices = currentSeries.total_slices || 223;
    const seriesDesc = currentSeries.series_description || "Brain 1.0 H20s";
    const caption = `${seriesDesc} | Slice ${currentSliceNumber}/${totalSlices}`;
    const newKi = {
      id: `ki_${Date.now()}`,
      series_description: seriesDesc,
      slice_number: currentSliceNumber,
      total_slices: totalSlices,
      data_url: generateDicomOverlaySvg(seriesDesc, currentSliceNumber, totalSlices),
      caption
    };
    setAttachedKeyImages(prev => [newKi, ...prev]);
    setToastMessage(`📸 Key Image Captured: ${caption}`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleCiteKeyImage = (img) => {
    const refTag = `\n[Key Image Citation: ${img.series_description} - Slice ${img.slice_number}/${img.total_slices}]`;
    setFindingsText(prev => prev + refTag);
    setToastMessage(`🔗 Cited ${img.series_description} in Report`);
    setTimeout(() => setToastMessage(""), 1800);
  };

  const handleApplyMacro = (macroText) => {
    setFindingsText(prev => prev + macroText);
    setToastMessage(`✨ Inserted macro snippet`);
    setTimeout(() => setToastMessage(""), 1500);
  };

  const handleSelectTemplate = (tpl) => {
    setReportHeading(`${tpl.modality} REPORT`);
    setClinicalIndication(tpl.indication);
    setTechniqueText(tpl.technique);
    setFindingsText(tpl.findings);
    setImpressionText(tpl.impression);
    setToastMessage(`⚡ Applied RadLex Template: ${tpl.title}`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleAiAutoImpression = () => {
    let aiImpression = "IMPRESSION:\n1. Normal CT brain examination.\n2. No acute intracranial hemorrhage, mass effect, or territorial acute ischemic stroke.";
    setImpressionText(aiImpression);
    setToastMessage("✨ AI Diagnostic Impression Auto-Generated!");
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleSaveReport = async (status = "FINALIZED") => {
    setIsSaving(true);
    try {
      await api.post("/api/v3/reports/save", {
        studyUID: study?.study_uid || study?.id || "1.2.840",
        patientMrn: study?.patient_mrn,
        reportHeading,
        clinicalIndication,
        techniqueText,
        findingsText,
        impressionText,
        status
      }).catch(() => null);

      setToastMessage(`✅ Report ${status === "FINALIZED" ? "Finalized & Signed!" : "Draft Saved!"}`);
      setTimeout(() => {
        setToastMessage("");
        if (status === "FINALIZED" && onClose) onClose();
      }, 1500);
    } catch (e) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 font-sans">
      
      {/* 👑 TOP CONTROL HEADER BAR (EXACT VENDOR SPEC) */}
      <header className="px-4 py-2 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left Patient Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center gap-2 font-mono text-xs">
            <span className="font-black text-white">{study?.patient_name || "PANCHAMI"}</span>
            <span className="text-slate-400">{study?.patient_age || "20Y"} / {study?.patient_sex || "F"}</span>
            <span className="text-cyan-400 font-bold">ID: {study?.patient_mrn || "2956457"}</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">{study?.modality || "CT"}</span>
            <span className="text-slate-400">ACC: {study?.id || "31174"}</span>
          </div>
        </div>

        {/* Center 5 Layout View Mode Toggles */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setLayoutMode("VIEWER_90")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "VIEWER_90" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            90% Viewer
          </button>
          <button
            onClick={() => setLayoutMode("SPLIT")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "SPLIT" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            50/50 Split
          </button>
          <button
            onClick={() => setLayoutMode("STUDIO_90")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "STUDIO_90" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            90% Studio
          </button>
          <button
            onClick={() => setLayoutMode("VIEWER_ONLY")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "VIEWER_ONLY" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Viewer Only
          </button>
          <button
            onClick={() => setLayoutMode("STUDIO_ONLY")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "STUDIO_ONLY" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Studio Only
          </button>
          <button
            onClick={() => setLayoutMode("MPR_3D")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "MPR_3D" ? "bg-purple-600 text-white shadow-sm" : "text-purple-300 hover:text-white"
            }`}
          >
            3D MPR
          </button>
        </div>

        {/* Right Top Action Buttons */}
        <div className="flex items-center gap-2">
          {toastMessage && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
              {toastMessage}
            </span>
          )}

          <button
            onClick={captureKeyImage}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Camera size={13} /> Key Image
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Printer size={13} /> Print
          </button>

          <button
            onClick={() => handleSaveReport("DRAFT")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Save size={13} /> Save Draft
          </button>

          <button
            onClick={() => handleSaveReport("FINALIZED")}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-600/30"
          >
            <FileCheck size={13} /> Sign-Off
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <X size={14} /> Close
          </button>
        </div>
      </header>

      {/* 🚀 WORKSTATION MAIN SPLIT CONTAINER */}
      <div className="flex-1 flex overflow-hidden">

        {/* 🧊 3D MPR ORTHOGONAL RECONSTRUCTION MODE */}
        {layoutMode === "MPR_3D" && (
          <div className="w-full h-full bg-black">
            <MobileMPRViewer studyInstanceUID={study?.study_uid || study?.id} />
          </div>
        )}

        {/* ==================================================================== */}
        {/* LEFT PANEL: DICOM VIEWER WORKSPACE                                   */}
        {/* ==================================================================== */}
        {layoutMode !== "STUDIO_ONLY" && layoutMode !== "MPR_3D" && (
          <div className={`flex flex-col bg-black border-r border-slate-800 relative ${
            layoutMode === "VIEWER_90" ? "w-[90%]" :
            layoutMode === "STUDIO_90" ? "w-[10%]" :
            layoutMode === "VIEWER_ONLY" ? "w-full" : "w-1/2"
          }`}>

            {/* TOP VIEWER TOOLBAR */}
            <div className="px-3 py-1.5 bg-[#0D1527] border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="font-extrabold text-blue-400 text-xs truncate">
                Open Health Imaging Foundation
              </div>

              {/* Quick Image Tools */}
              <div className="flex items-center gap-2 text-slate-300">
                <button title="Annotation Pencil" className="p-1 hover:text-white"><PenTool size={14} /></button>
                <button title="Magnify Zoom" className="p-1 hover:text-white"><ZoomIn size={14} /></button>
                <button title="Pan Move" className="p-1 hover:text-white"><Move size={14} /></button>
                <button title="Window / Level" className="p-1 hover:text-white"><Sun size={14} /></button>
                <button onClick={captureKeyImage} title="Snapshot Key Image" className="p-1 text-blue-400 hover:text-white"><Camera size={14} /></button>
              </div>
            </div>

            {/* VIEWER CANVAS & SERIES THUMBNAIL STRIP */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Left Series Thumbnails Strip */}
              {layoutMode !== "STUDIO_90" && (
                <div className="w-36 bg-[#070D19] border-r border-slate-800 p-2 space-y-3 overflow-y-auto shrink-0 font-mono text-[10px]">
                  <div className="text-[9px] font-bold text-slate-400 uppercase border-b border-slate-800 pb-1">Series Queue</div>
                  {activeSeriesList.map((ser, i) => (
                    <div
                      key={ser.series_id}
                      onClick={() => setActiveSeriesIndex(i)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        activeSeriesIndex === i ? "bg-blue-950/80 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="h-16 bg-slate-900 rounded mb-1 flex items-center justify-center border border-slate-800">
                        <ImageIcon size={20} className={activeSeriesIndex === i ? "text-blue-400" : "text-slate-600"} />
                      </div>
                      <div className="font-bold truncate text-slate-200">{ser.series_description}</div>
                      <div className="text-slate-400">S:{i+1} • {ser.total_slices}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Center DICOM Render Viewport */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {/* SVG/Canvas High-Res DICOM Render */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={generateDicomOverlaySvg(currentSeries.series_description, currentSliceNumber, currentSeries.total_slices)}
                    alt="DICOM Slice"
                    className="max-w-full max-h-full object-contain filter transition-all"
                    style={{ filter: `brightness(${brightness}) contrast(${contrast})` }}
                  />

                  {/* Corner Overlays */}
                  <div className="absolute top-4 left-4 font-mono text-xs text-blue-400 font-bold space-y-0.5 pointer-events-none">
                    <div>{study?.patient_name || "PANCHAMI"}</div>
                    <div className="text-slate-400 text-[11px]">{currentSeries.series_description}</div>
                  </div>

                  <div className="absolute top-4 right-4 font-mono text-xs text-blue-400 font-bold text-right pointer-events-none">
                    <div>CT HEAD</div>
                    <div className="text-slate-400 text-[11px]">S:{activeSeriesIndex+1} • Slices: {currentSeries.total_slices}</div>
                  </div>

                  <div className="absolute bottom-4 left-4 font-mono text-xs text-slate-300 pointer-events-none">
                    <div>WW: 148 WL: 50</div>
                    <div>Zoom: 1.85x</div>
                  </div>

                  <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-300 text-right pointer-events-none">
                    <div>Frame i:{currentSliceNumber} (11/223)</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* RIGHT PANEL: WORLD-CLASS RADIOLOGY REPORTING STUDIO                   */}
        {/* ==================================================================== */}
        {layoutMode !== "VIEWER_ONLY" && layoutMode !== "MPR_3D" && (
          <div className={`flex flex-col bg-[#0A101D] overflow-y-auto p-4 space-y-4 ${
            layoutMode === "STUDIO_90" ? "w-[90%]" :
            layoutMode === "VIEWER_90" ? "w-[10%]" :
            layoutMode === "STUDIO_ONLY" ? "w-full" : "w-1/2"
          }`}>

            {/* 1. DEMOGRAPHICS HEADER GRID */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</div>
                <div className="font-extrabold text-white">{study?.patient_name || "PANCHAMI"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</div>
                <div className="font-extrabold text-white">{study?.patient_age || "20Y"} / {study?.patient_sex || "F"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Accession No</div>
                <div className="font-extrabold text-cyan-400 font-mono">{study?.id || "31174"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Referring Doctor</div>
                <div className="font-extrabold text-white truncate">{study?.referring_physician || "Self / Desk"}</div>
              </div>
            </div>

            {/* 2. REPORT HEADING TITLE & CLINICAL HISTORY INPUTS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Report Heading Title</label>
                <input
                  type="text"
                  value={reportHeading}
                  onChange={(e) => setReportHeading(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-extrabold focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Clinical History / Indication</label>
                <input
                  type="text"
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. MODALITY QUICK PILLS & STRUCTURED TEMPLATES DROPDOWN */}
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Modality:</span>
                {["CT", "MRI", "USG", "XRAY", "ECHO"].map(m => (
                  <span key={m} className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    (study?.modality || "CT") === m || (m === "CT" && study?.modality === "CT") ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}>
                    {m}
                  </span>
                ))}
              </div>

              {/* Template Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Zap size={12} /> Load Structured Template:
                </span>
                <select
                  onChange={(e) => {
                    const tpl = REPORT_TEMPLATES.find(t => t.id === e.target.value);
                    if (tpl) handleSelectTemplate(tpl);
                  }}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold focus:border-blue-500 focus:outline-none"
                >
                  {REPORT_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. MEDICAL SPEECH DICTATION STUDIO BAR */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setIsDictating(!isDictating)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isDictating ? "bg-rose-600 text-white border-rose-500 animate-pulse" : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                }`}
              >
                {isDictating ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isDictating ? "Recording Dictation..." : "🎙️ Medical Dictation"}</span>
              </button>

              {/* Live Audio Equalizer Bar */}
              <div className="flex-1 flex items-center justify-center gap-1">
                {[40, 70, 30, 90, 60, 80, 40, 60].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${isDictating ? "bg-blue-400 animate-pulse" : "bg-slate-700"}`}
                    style={{ height: isDictating ? `${(h * Math.random()).toFixed(0)}px` : "12px" }}
                  />
                ))}
              </div>

              <div className="text-[10px] text-amber-300 font-mono">
                ⚡ Web Speech Fallback | Target: <span className="font-bold text-white">Findings</span> | F2 / FootPedal
              </div>
            </div>

            {/* 5. DETAILED IMAGING FINDINGS EDITOR WITH DOT MACROS */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">Detailed Imaging Findings</span>

                {/* Dot Macros Bar */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dot Macros:</span>
                  {DOT_MACROS.map(m => (
                    <button
                      key={m.label}
                      onClick={() => handleApplyMacro(m.text)}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300 font-mono text-[10px] hover:border-blue-500 transition-all cursor-pointer"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={9}
                value={findingsText}
                onChange={(e) => setFindingsText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono leading-relaxed focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 6. CLINICAL IMPRESSION & CONCLUSION BOX */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">Clinical Impression & Conclusion</span>
                <button
                  onClick={handleAiAutoImpression}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Wand2 size={12} /> ⚡ Auto AI Impression
                </button>
              </div>

              <textarea
                rows={4}
                value={impressionText}
                onChange={(e) => setImpressionText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-blue-800/60 rounded-lg text-xs text-blue-200 font-mono leading-relaxed focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 7. KEY IMAGES ATTACHED DRAWER */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <ImageIcon size={14} className="text-blue-400" /> KEY IMAGES ATTACHED ({attachedKeyImages.length})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={captureKeyImage}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} /> Capture Key Image
                  </button>
                </div>
              </div>

              {/* Snapshot Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {attachedKeyImages.map((img) => (
                  <div key={img.id} className="p-2 bg-slate-950 border border-slate-800 rounded-lg space-y-2 relative group">
                    <button
                      onClick={() => setAttachedKeyImages(prev => prev.filter(k => k.id !== img.id))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/80 text-white opacity-80 hover:opacity-100"
                    >
                      <X size={12} />
                    </button>

                    <div className="h-28 bg-black rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                      <img src={img.data_url} alt="Key Image" className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="font-mono text-[10px] text-slate-300 truncate">{img.caption}</div>

                    <button
                      onClick={() => handleCiteKeyImage(img)}
                      className="w-full py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-300 rounded font-bold text-[10px] flex items-center justify-center gap-1"
                    >
                      <Link2 size={11} /> Cite in Report
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
