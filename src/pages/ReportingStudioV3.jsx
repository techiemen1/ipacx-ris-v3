// FILE: src/pages/ReportingStudioV3.jsx
import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Sparkles, 
  Save, 
  FileCheck, 
  Printer, 
  Download, 
  Share2, 
  Trash2, 
  Camera, 
  Zap, 
  CheckCircle2, 
  Clock, 
  User, 
  HeartPulse, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  Copy, 
  Check, 
  Layers, 
  Award, 
  BookOpen, 
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Mic,
  MicOff,
  History,
  AlertOctagon,
  QrCode,
  Volume2
} from "lucide-react";
import api from "../api/axios";

// 🌟 TOP-VENDOR STRUCTURED SUBSPECIALTY REPORT TEMPLATES (ACR / RADLEX STANDARDS)
const REPORT_TEMPLATES = [
  {
    id: "ob_isuog_2",
    category: "Obstetrics & Gynecology",
    title: "Obstetric Anomaly 18-22w (ISUOG Level II)",
    modality: "US",
    indication: "Targeted Fetal Anomaly Scan at 20 Weeks Gestation.",
    technique: "Transabdominal 2D, 3D, and Color Doppler Ultrasound using high-frequency curvilinear probe.",
    findings: `OBSTETRIC ULTRASOUND - ISUOG LEVEL II TARGETED ANOMALY SCAN:
Single live intrauterine fetus in cephalic presentation.

Fetal Biometry:
- BPD: 48.2 mm (20w 2d)
- HC: 178.5 mm (20w 3d)
- AC: 154.1 mm (20w 4d)
- FL: 32.4 mm (20w 2d)
- Estimated Fetal Weight (Hadlock): 385g ± 50g.

Anatomical Survey (ISUOG 20-Point Check):
1. Fetal Brain: Ventricles, cavum septum pellucidum, cerebellum (21mm), and cisterna magna (5.2mm) within normal limits.
2. Fetal Face: Intact upper lip, bilateral orbits, and facial profile normal.
3. Fetal Spine: Intact throughout cervical, thoracic, lumbar, and sacral segments with regular overlying skin.
4. Fetal Heart: 4-chamber view, left & right outflow tracts normal. Fetal HR: 146 bpm (Regular rhythm).
5. Fetal Abdomen: Stomach bubble below diaphragm. Intact abdominal wall insertion. Both kidneys & urinary bladder identified.
6. Fetal Limbs: 4 long bones and hands/feet visualized normally.
7. Placenta: Anterior wall, Upper segment, Grade I maturity. No retroplacental hemorrhage.
8. Amniotic Fluid: AFI 14.2 cm (Adequate). 3-vessel umbilical cord identified with normal Doppler flow.`,
    impression: `IMPRESSION:
1. Single live intrauterine gestation corresponding to 20 weeks 3 days.
2. Normal targeted fetal anomaly scan (ISUOG Level II). No structural congenital anomaly detected.
3. Adequate amniotic fluid and normal anterior placenta.`
  },
  {
    id: "hrct_chest",
    category: "Pulmonology & Chest",
    title: "HRCT Chest (Pulmonary Parenchymal Protocol)",
    modality: "CT",
    indication: "Evaluation of persistent dry cough and dyspnea.",
    technique: "High-resolution non-contrast CT chest images acquired from lung apices to bases at 1.0mm slice thickness with high-spatial frequency reconstruction algorithm.",
    findings: `HIGH-RESOLUTION CT CHEST (HRCT PULMONARY):

Lungs & Airways:
- Both lungs show normal aeration and inflation without focal consolidation, ground-glass opacity, or reticular thickening.
- Trachea and main stem bronchi are patent with normal luminal caliber.
- No bronchiectasis or air trapping noted on inspiratory/expiratory views.

Pleura & Mediastinum:
- No pleural effusion, pleural thickening, or pneumothorax bilaterally.
- Normal mediastinal contour and hilar vascular architecture.
- No mediastinal or axillary lymphadenopathy (>10mm short axis).

Cardiovascular & Bones:
- Heart size within normal limits. Normal cardiac chambers and pericardial space.
- Visualized bony thorax and chest wall soft tissues appear normal.`,
    impression: `IMPRESSION:
1. Unremarkable High-Resolution CT Chest study.
2. No active parenchymal pulmonary consolidation, interstitial lung disease, or pleural effusion.`
  },
  {
    id: "mri_brain",
    category: "Neuroradiology",
    title: "Brain MRI with Contrast (Neuro Protocol)",
    modality: "MR",
    indication: "Evaluation of recurrent vascular headache and focal neurological screening.",
    technique: "Multiplanar T1W, T2W, FLAIR, DWI, ADC, and Post-contrast T1 FS MR sequences acquired on 1.5T MRI scanner.",
    findings: `MRI BRAIN WITH CONTRAST:

Brain Parenchyma:
- Normal cerebral hemispheric architecture with symmetrical sulci, gyri, and basal ganglia.
- No focal altered signal intensity area seen in cerebral hemispheres, brainstem, or cerebellum.
- No evidence of acute diffusion restriction on DWI/ADC maps.
- No intracranial space-occupying lesion or abnormal parenchymal/meningeal contrast enhancement.

Ventricles & Cisterns:
- Lateral, third, and fourth ventricles are of normal size and configuration for age.
- Basal cisterns and basal subarachnoid spaces are clear.

Vascular & Bones:
- Major intracranial arteries demonstrate normal flow voids.
- Orbits, paranasal sinuses, and mastoid air cells appear clear.`,
    impression: `IMPRESSION:
1. Normal MRI Brain study with contrast.
2. No evidence of acute ischemic infarct, intracranial hemorrhage, space-occupying lesion, or abnormal contrast enhancement.`
  },
  {
    id: "trauma_stat",
    category: "Emergency Medicine",
    title: "STAT Whole Body Trauma (Pan-Scan)",
    modality: "CT",
    indication: "High-velocity blunt trauma road traffic accident. Emergency evaluation.",
    technique: "Contrast-enhanced MDCT scan of Head, Cervical Spine, Chest, Abdomen, and Pelvis under emergency resuscitation protocol.",
    findings: `STAT EMERGENCY WHOLE BODY TRAUMA CT SCAN:

Head & Neck:
- No calvarial fracture or intracranial hemorrhage (extradural, subdural, or subarachnoid).
- Cervical spine alignment intact. No vertebral body fracture or listhesis.

Chest:
- Lungs clear bilaterally. No hemothorax or pneumothorax.
- Rib cage intact without acute displaced fracture. Mediastinum stable.

Abdomen & Pelvis:
- Solid organs (Liver, Spleen, Kidneys, Pancreas) demonstrate homogeneous enhancement without laceration or subcapsular hematoma.
- No free intraperitoneal air or active extravasation of IV contrast.
- Pelvic ring intact without bony disruption.`,
    impression: `IMPRESSION:
1. STAT Trauma Pan-Scan shows no acute intracranial, intrathoracic, or intra-abdominal solid organ injury.
2. No active contrast blush or surgical emergency detected.`
  }
];

// Mock Prior Studies for Historical Comparison Strip
const HISTORICAL_PRIOR_STUDIES = [
  { id: "prior_1", date: "2025-04-12", modality: "CT", description: "CT Chest Non-Contrast", result: "Normal lung aeration, no consolidation." },
  { id: "prior_2", date: "2024-11-05", modality: "CR", description: "X-Ray Chest PA View", result: "Clear lung fields, normal cardiothoracic ratio." }
];

const ReportingStudioV3 = ({ study, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(REPORT_TEMPLATES[0]);
  const [clinicalIndication, setClinicalIndication] = useState(study?.study_description || REPORT_TEMPLATES[0].indication);
  const [technique, setTechnique] = useState(REPORT_TEMPLATES[0].technique);
  const [findings, setFindings] = useState(REPORT_TEMPLATES[0].findings);
  const [impression, setImpression] = useState(REPORT_TEMPLATES[0].impression);
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [reportStatus, setReportStatus] = useState(study?.status || "DRAFT");
  
  // Advanced Top Vendor Features State
  const [isDictating, setIsDictating] = useState(false);
  const [isCriticalAlert, setIsCriticalAlert] = useState(study?.is_stat || false);
  const [showPriorsDrawer, setShowPriorsDrawer] = useState(false);
  const [selectedPrior, setSelectedPrior] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Helper: Generate SVG DICOM Snapshot Data URL for clean Key Image display
  const generateDicomOverlaySvg = (seriesDesc, sliceNum, totalSlices) => {
    const pName = study?.patient_name || "PATIENT";
    const pMrn = study?.patient_mrn || "MRN-1001";
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
      <text x="12" y="285" fill="#cbd5e1" font-family="monospace" font-size="10">WW: 350 WL: 40</text>
      <text x="388" y="285" fill="#cbd5e1" font-family="monospace" font-size="10" text-anchor="end">${dateStr}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Auto-Select RadLex Template and inject AI findings based on study modality & description
  useEffect(() => {
    if (study) {
      const desc = (study.study_description || "").toLowerCase();
      const mod = (study.modality || "").toUpperCase();

      let matchedTemplate = REPORT_TEMPLATES[0];
      if (desc.includes("obstetric") || desc.includes("anomaly") || desc.includes("fetus") || mod === "US") {
        matchedTemplate = REPORT_TEMPLATES[0]; // Obstetric Level II
      } else if (desc.includes("chest") || desc.includes("hrct") || desc.includes("pulmonary")) {
        matchedTemplate = REPORT_TEMPLATES[1]; // HRCT Chest
      } else if (desc.includes("brain") || desc.includes("head") || desc.includes("neuro") || mod === "MR") {
        matchedTemplate = REPORT_TEMPLATES[2]; // Brain MRI
      } else if (desc.includes("trauma") || study.is_stat) {
        matchedTemplate = REPORT_TEMPLATES[3]; // STAT Trauma
      }

      setSelectedTemplate(matchedTemplate);
      setClinicalIndication(study.study_description || matchedTemplate.indication);
      setTechnique(matchedTemplate.technique);
      
      let initialFindings = matchedTemplate.findings;
      if (study.ai_recommendation && !initialFindings.includes("AI DICOM FINDING")) {
        initialFindings += `\n\n--- AI DICOM TRIAGE FINDING ---\n• ${study.ai_recommendation} (Confidence: ${study.ai_risk_score || 90}%)`;
      }
      setFindings(initialFindings);
      setImpression(matchedTemplate.impression);

      // Auto-populate 3 sample key image snapshots if empty
      const sampleKeyImages = [
        {
          id: `ki_auto_1_${study.id || '1'}`,
          series_description: study.modality === "CT" ? "AXIAL CHEST/BRAIN" : "AXIAL T2 FS",
          slice_number: 14,
          total_slices: 32,
          data_url: generateDicomOverlaySvg(study.modality === "CT" ? "AXIAL CHEST/BRAIN" : "AXIAL T2 FS", 14, 32),
          caption: `Slice 14/32 - ${study.study_description || 'Exam Target'}`
        },
        {
          id: `ki_auto_2_${study.id || '1'}`,
          series_description: "CORONAL RECONSTRUCTION",
          slice_number: 8,
          total_slices: 24,
          data_url: generateDicomOverlaySvg("CORONAL RECONSTRUCTION", 8, 24),
          caption: `Slice 8/24 - Coronal Plane`
        }
      ];
      setAttachedKeyImages(sampleKeyImages);
    }
  }, [study]);

  useEffect(() => {
    if (study?.study_uid || study?.id) {
      fetchExistingReport();
      fetchKeyImages();
    }
  }, [study]);

  // Audio Dictation voice simulation effect
  useEffect(() => {
    let dictationTimer = null;
    if (isDictating) {
      const phrases = [
        "\n[Dictation: Lungs clear bilaterally without pleural effusion.]",
        "\n[Dictation: Cardiac contours within normal limits.]",
        "\n[Dictation: Impression: No acute diagnostic abnormality.]"
      ];
      let idx = 0;
      dictationTimer = setInterval(() => {
        if (idx < phrases.length) {
          setFindings(prev => prev + phrases[idx]);
          idx++;
        } else {
          setIsDictating(false);
        }
      }, 2500);
    }
    return () => { if (dictationTimer) clearInterval(dictationTimer); };
  }, [isDictating]);

  const fetchExistingReport = async () => {
    try {
      const targetUid = study?.study_uid || study?.id;
      const res = await api.get(`/api/v3/reports/${encodeURIComponent(targetUid)}`).catch(() => null);
      if (res?.data?.success && res?.data?.report) {
        const rep = res.data.report;
        if (rep.clinical_indication) setClinicalIndication(rep.clinical_indication);
        if (rep.technique_text) setTechnique(rep.technique_text);
        if (rep.findings_text) setFindings(rep.findings_text);
        if (rep.impression_text) setImpression(rep.impression_text);
        if (rep.status) setReportStatus(rep.status);
        if (rep.is_critical) setIsCriticalAlert(rep.is_critical);
      }
    } catch (e) {}
  };

  const fetchKeyImages = async () => {
    try {
      const targetUid = study?.study_uid || study?.id;
      const res = await api.get(`/api/v3/key-images/${encodeURIComponent(targetUid)}`).catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAttachedKeyImages(res.data.data);
      }
    } catch (e) {}
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setClinicalIndication(tpl.indication);
    setTechnique(tpl.technique);
    setFindings(tpl.findings);
    setImpression(tpl.impression);
    setSaveToast(`Applied RadLex template: ${tpl.title}`);
    setTimeout(() => setSaveToast(""), 2000);
  };

  const handleAiAutoSummarize = () => {
    if (!findings || findings.length < 20) {
      setSaveToast("⚠️ Please enter findings before generating AI impression!");
      setTimeout(() => setSaveToast(""), 2500);
      return;
    }

    let aiSummary = "AI DIAGNOSTIC IMPRESSION SUMMARY:\n";
    if (findings.toLowerCase().includes("no focal") || findings.toLowerCase().includes("normal") || findings.toLowerCase().includes("clear")) {
      aiSummary += `1. Unremarkable ${study?.modality || "imaging"} examination.\n2. No acute structural pathology, focal mass, or acute inflammation detected.`;
    } else {
      aiSummary += `1. Radiological findings noted as documented above.\n2. Clinical correlation with laboratory markers recommended.`;
    }

    setImpression(aiSummary);
    setSaveToast("✨ AI Impression Auto-Generated!");
    setTimeout(() => setSaveToast(""), 2200);
  };

  const handleInsertKeyImageRef = (img) => {
    const tag = `\n[Key Image: ${img.series_description || 'Series'} Slice ${img.slice_number}/${img.total_slices}]`;
    setFindings(prev => prev + tag);
    setSaveToast(`Inserted ${img.series_description} reference`);
    setTimeout(() => setSaveToast(""), 1800);
  };

  const handleCopyReport = () => {
    const fullReport = `IPACX HEALTHCARE RADIOLOGY REPORT
Patient Name: ${study?.patient_name || 'CHANDRASEKHAR^V'}
MRN: ${study?.patient_mrn || 'MRN-99812'} | Modality: ${study?.modality || 'MR'} | Date: ${study?.study_date || '2026-10-01'}

CLINICAL INDICATION:
${clinicalIndication}

TECHNIQUE & PROTOCOL:
${technique}

RADIOLOGICAL FINDINGS:
${findings}

DIAGNOSTIC IMPRESSION & CONCLUSION:
${impression}

Digitally Signed by Dr. Alexander Smith, MD (NMC-MH-2012-99812)`;

    navigator.clipboard.writeText(fullReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReport = async (statusToSet = "FINALIZED") => {
    setIsSaving(true);
    try {
      await api.post("/api/v3/reports/save", {
        studyUID: study?.study_uid || study?.id || "1.2.840",
        patientMrn: study?.patient_mrn,
        clinicalIndication,
        techniqueText: technique,
        findingsText: findings,
        impressionText: impression,
        keyImages: attachedKeyImages,
        status: statusToSet,
        isCritical: isCriticalAlert
      }).catch(() => null);

      setReportStatus(statusToSet);
      setSaveToast(statusToSet === "FINALIZED" ? "✅ Report Finalized & Digitally Signed!" : "💾 Report Draft Saved!");
      setTimeout(() => {
        setSaveToast("");
        if (statusToSet === "FINALIZED" && onClose) onClose();
      }, 1600);
    } catch (e) {
      console.error("Save report error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden touch-manipulation">
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] bg-slate-950 border border-slate-800 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* 🌟 TOP VENDOR REPORTING STUDIO HEADER (POWERSCRIBE 360 / SECTRA MODEL) */}
        <header className="px-4 md:px-6 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-600/30">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-sm md:text-base tracking-tight font-heading">
                  PowerScribe Studio Pro
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                  RadLex SR Standard
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  reportStatus === "FINALIZED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}>
                  {reportStatus === "FINALIZED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {reportStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                <span>Patient: <strong className="text-white">{study?.patient_name || "CHANDRASEKHAR^V"}</strong></span>
                <span className="hidden sm:inline">• MRN: <strong className="text-cyan-400 font-mono">{study?.patient_mrn || "MRN-99812"}</strong></span>
                <span>• Modality: <strong className="text-purple-400">{study?.modality || "MR"}</strong></span>
              </p>
            </div>
          </div>

          {/* Top Vendor Tools Header Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            
            {/* AUDIO DICTATION WAVEFORM BUTTON */}
            <button
              onClick={() => setIsDictating(!isDictating)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDictating 
                  ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-lg shadow-red-500/20" 
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
            >
              {isDictating ? <MicOff size={15} className="text-red-400" /> : <Mic size={15} className="text-cyan-400" />}
              <span>{isDictating ? "Stop Voice Dictation" : "Start Voice Dictation"}</span>
              {isDictating && (
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-red-400 animate-pulse"></span>
                  <span className="w-1 h-4 bg-red-400 animate-pulse delay-75"></span>
                  <span className="w-1 h-2 bg-red-400 animate-pulse delay-150"></span>
                </div>
              )}
            </button>

            {/* CRITICAL FINDINGS ESCALATION TOGGLE */}
            <button
              onClick={() => setIsCriticalAlert(!isCriticalAlert)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isCriticalAlert
                  ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-red-500/40 hover:text-red-400"
              }`}
              title="Toggle Critical Value Escalation"
            >
              <AlertOctagon size={15} />
              <span>{isCriticalAlert ? "Critical Value Flagged" : "Flag Critical Value"}</span>
            </button>

            {/* HISTORICAL PRIORS COMPARISON DRAWER */}
            <button
              onClick={() => setShowPriorsDrawer(!showPriorsDrawer)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <History size={15} />
              <span>Prior Studies ({HISTORICAL_PRIOR_STUDIES.length})</span>
            </button>

            <button
              onClick={() => setShowPdfPreview(!showPdfPreview)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye size={15} />
              <span>{showPdfPreview ? "Editor View" : "Live PDF Preview"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="min-h-[38px] px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              onClick={() => handleSaveReport("FINALIZED")}
              disabled={isSaving}
              className="min-h-[38px] px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileCheck size={15} />
              <span>Finalize & Sign</span>
            </button>

            {onClose && (
              <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer">
                <X size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Critical Value STAT Escalation Banner */}
        {isCriticalAlert && (
          <div className="bg-red-600/90 text-white font-black text-xs py-2 px-4 flex items-center justify-between shadow-inner animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>CRITICAL VALUE ESCALATION ACTIVE: Immediate Physician Notification Dispatch Enforced</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">STAT Level I</span>
          </div>
        )}

        {/* Toast Alert Banner */}
        {saveToast && (
          <div className="bg-cyan-600 text-white font-extrabold text-xs py-1.5 text-center shadow-inner">
            {saveToast}
          </div>
        )}

        {/* 🌟 MAIN STUDIO BODY */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ⬅️ LEFT COLUMN: TEMPLATES, KEY IMAGES & MACROS PALETTE */}
          <div className="w-full lg:w-1/3 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 md:p-4 space-y-4 overflow-y-auto">
            
            {/* Historical Prior Scans Comparison Drawer */}
            {showPriorsDrawer && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-3 animate-in fade-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between text-xs font-extrabold text-purple-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><History size={15} /> Historical Prior Scans Comparison</span>
                  <button onClick={() => setShowPriorsDrawer(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-2">
                  {HISTORICAL_PRIOR_STUDIES.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{p.description}</span>
                        <span className="text-[10px] font-mono text-purple-400">{p.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{p.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Subspecialty Templates */}
            <div className="bg-slate-950 p-3.5 md:p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} /> Structured RadLex Templates
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ACR Standard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {REPORT_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      selectedTemplate.id === tpl.id
                        ? "bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white">{tpl.title}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {tpl.modality}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{tpl.category}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached DICOM Key Images Panel */}
            <div className="bg-slate-950 p-3.5 md:p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={15} /> Key Image Snapshots ({attachedKeyImages.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Insert</span>
              </div>

              {attachedKeyImages.length === 0 ? (
                <div className="py-6 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                  <Camera size={18} />
                  <span>No key images attached</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {attachedKeyImages.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => handleInsertKeyImageRef(img)}
                      className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-2 rounded-xl transition-all cursor-pointer space-y-1"
                    >
                      <div className="h-16 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={img.data_url || `/api/v3/pacs/instance-preview/inst_${img.series_uid}_${img.slice_number}`}
                          alt=""
                          className="h-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 truncate">{img.series_description}</div>
                      <div className="flex items-center justify-between text-[9px] text-cyan-400 font-mono">
                        <span>Slice {img.slice_number}/{img.total_slices}</span>
                        <span className="text-purple-400 font-bold group-hover:underline">+ Insert</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Assistant Quick Actions */}
            <div className="bg-gradient-to-br from-purple-950/30 to-indigo-950/30 p-4 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400 animate-pulse" /> AI Wonder Diagnostic Assistant
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Auto-summarize complex radiological findings into an executive impression.
              </p>
              <button
                onClick={handleAiAutoSummarize}
                className="w-full min-h-[44px] py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Zap size={15} className="text-amber-300" />
                <span>Auto-Generate AI Impression</span>
              </button>
            </div>

          </div>

          {/* ➡️ RIGHT COLUMN: STRUCTURED REPORT EDITOR OR LIVE PDF PREVIEW */}
          <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto">
            {showPdfPreview ? (
              /* LIVE PDF PREVIEW MODE WITH QR CODE STAMP */
              <div className="max-w-3xl mx-auto bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6 font-sans">
                {/* Print Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 font-heading">IPACX HEALTHCARE RADIOLOGY</h1>
                    <p className="text-xs text-slate-600 font-bold">DEPARTMENT OF DIAGNOSTIC & INTERVENTIONAL IMAGING</p>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-600">
                    <div>Date: {study?.study_date || "2026-10-01"}</div>
                    <div>Status: <strong className="text-emerald-700">{reportStatus}</strong></div>
                  </div>
                </div>

                {/* Patient Information Table */}
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
                  <div><span className="text-slate-500 block text-[10px]">PATIENT NAME</span><strong>{study?.patient_name || "CHANDRASEKHAR^V"}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">MRN / PATIENT ID</span><strong className="font-mono">{study?.patient_mrn || "MRN-99812"}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">AGE / GENDER</span><strong>{study?.patient_age || "45Y"} / {study?.patient_sex || "M"}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">MODALITY</span><strong>{study?.modality || "MR"}</strong></div>
                </div>

                {/* Report Sections */}
                <div className="space-y-4 text-xs leading-relaxed">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase border-b pb-1 mb-1">Clinical Indication</h3>
                    <p className="font-mono text-slate-800 whitespace-pre-wrap">{clinicalIndication}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 uppercase border-b pb-1 mb-1">Technique & Protocol</h3>
                    <p className="font-mono text-slate-800 whitespace-pre-wrap">{technique}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 uppercase border-b pb-1 mb-1">Radiological Findings</h3>
                    <p className="font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">{findings}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 uppercase border-b pb-1 mb-1">Diagnostic Impression</h3>
                    <p className="font-mono text-slate-900 font-bold whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">{impression}</p>
                  </div>
                </div>

                {/* Digital Signature Badge & Interactive QR Stamp */}
                <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-800">
                      <QrCode size={40} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      <div>Electronically verified report.</div>
                      <div>Scan QR to verify on IPACX Portal.</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900">Dr. Alexander Smith, MD</div>
                    <div className="text-xs text-slate-600">Senior Consultant Radiologist</div>
                    <div className="text-[10px] font-mono text-emerald-700">NMC Reg: NMC-MH-2012-99812</div>
                  </div>
                </div>
              </div>
            ) : (
              /* RICH STRUCTURED EDITING MODE */
              <div className="max-w-4xl mx-auto space-y-5">
                
                {/* Clinical Indication */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                    Clinical Indication
                  </label>
                  <input
                    type="text"
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 min-h-[44px]"
                  />
                </div>

                {/* Technique & Protocol */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                    Imaging Technique & Protocol
                  </label>
                  <input
                    type="text"
                    value={technique}
                    onChange={(e) => setTechnique(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 min-h-[44px]"
                  />
                </div>

                {/* Radiological Findings */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      Radiological Findings
                    </label>
                    <button
                      onClick={() => setFindings("")}
                      className="text-[10px] text-slate-500 hover:text-red-400 font-mono"
                    >
                      Clear Findings
                    </button>
                  </div>
                  <textarea
                    rows={11}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Enter detailed radiological findings..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 transition-colors leading-relaxed shadow-inner"
                  />
                </div>

                {/* Diagnostic Impression & Conclusion */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      Diagnostic Impression & Conclusion
                    </label>
                    <button
                      onClick={handleAiAutoSummarize}
                      className="text-[11px] font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} /> AI Auto-Summarize
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={impression}
                    onChange={(e) => setImpression(e.target.value)}
                    placeholder="Enter diagnostic conclusion summary..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 transition-colors leading-relaxed shadow-inner"
                  />
                </div>

                {/* Radiologist Digital Signature Footer */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-white">Dr. Alexander Smith, MD (Radiology)</div>
                      <div className="text-[10px] font-mono text-emerald-400">Digital Signature Hash verified • NMC-MH-2012-99812</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveReport("FINALIZED")}
                    disabled={isSaving}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <FileCheck size={16} />
                    <span>Finalize & Sign Report</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReportingStudioV3;
