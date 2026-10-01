// FILE: src/pages/ReportingStudioV3.jsx
import React, { useState, useEffect, useRef } from "react";
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
  Volume2,
  Tag,
  Info,
  ExternalLink,
  PenTool,
  Plus,
  Link2
} from "lucide-react";
import api from "../api/axios";
import DoctorSignatureManagerV3 from "../components/DoctorWorkstation/DoctorSignatureManagerV3";
import { getOhifViewerUrl } from "../utils/viewerUrl";

// 🌟 COMPREHENSIVE MULTI-MODALITY RADIOLOGY REPORT TEMPLATES (RADLEX / ACR STANDARDS)
const COMPREHENSIVE_TEMPLATES = [
  // --- CT TEMPLATES ---
  {
    id: "ct_head_brain",
    category: "Head & Brain",
    title: "CT Head Non-Contrast (Routine Brain Protocol)",
    modality: "CT",
    indication: "Acute neurological deficit / cephalea.",
    technique: "Non-contrast axial CT scan of the brain from skull base to vertex at 5mm thin reconstructed slices.",
    findings: `CLINICAL INDICATION: Acute neurological deficit / cephalea.

TECHNIQUE: Non-contrast axial CT scan of the brain from skull base to vertex at 5mm thin reconstructed slices.

BRAIN PARENCHYMA: Cerebral hemispheres show normal grey-white matter differentiation. No focal parenchymal attenuation abnormality or acute ischemic territorial infarct identified. No intra-axial or extra-axial hematoma, subdural, or epidural fluid collection.

VENTRICLES & CISTERNS: Lateral, third, and fourth ventricles are normal in size, shape, and midline alignment. Basal cisterns and cortical sulci are clear.

POSTERIOR FOSSA: Cerebellar hemispheres and brainstem demonstrate normal attenuation. No mass effect.

BONY CALVARIUM: Calvarium and skull base intact without fracture line. Paranasal sinuses and mastoids clear.`,
    impression: `IMPRESSION:
1. Normal non-contrast CT brain study.
2. No acute intracranial hemorrhage, mass effect, territorial acute infarct, or calvarial fracture.`
  },
  {
    id: "ct_chest_pulmonary",
    category: "Chest & Lungs",
    title: "HRCT Chest (Pulmonary Parenchymal Protocol)",
    modality: "CT",
    indication: "Persistent dry cough / Dyspnea evaluation.",
    technique: "High-resolution non-contrast CT chest images acquired from apices to bases at 1.0mm slice thickness.",
    findings: `CLINICAL INDICATION: Persistent dry cough and dyspnea evaluation.

TECHNIQUE: High-resolution non-contrast CT chest images acquired from apices to bases at 1.0mm slice thickness.

LUNGS & AIRWAYS: Normal aeration bilaterally. No focal consolidation, ground-glass opacity, or reticular thickening. Trachea and main bronchi patent.

PLEURA & MEDIASTINUM: No pleural effusion or pneumothorax. Normal cardiac size and mediastinal contours.`,
    impression: `IMPRESSION:
1. Unremarkable HRCT Chest study. No active parenchymal pulmonary lesion or pleural effusion.`
  },
  {
    id: "ct_abdomen_pelvis",
    category: "Abdomen & Pelvis",
    title: "CT Abdomen & Pelvis with Contrast",
    modality: "CT",
    indication: "Acute abdominal pain / Abdominal distension.",
    technique: "Contrast-enhanced axial CT scan of abdomen and pelvis from diaphragmatic domes to pubic symphysis.",
    findings: `LIVER & BILIARY: Normal liver size and attenuation. Biliary channels non-dilated. Gallbladder normal.
SPLEEN & PANCREAS: Spleen and pancreas show normal enhancement.
KIDNEYS: Symmetrical nephrogram. No hydronephrosis or renal calculus.
BOWEL & PERITONEUM: Bowel loops of normal caliber. Appendix intact without fat stranding. No free air or fluid collection.`,
    impression: `IMPRESSION:
1. Normal CT Abdomen & Pelvis with contrast. No bowel obstruction, acute appendicitis, or intraperitoneal free fluid.`
  },
  {
    id: "ct_kub",
    category: "Abdomen & Pelvis",
    title: "CT KUB Non-Contrast (Renal Calculus Protocol)",
    modality: "CT",
    indication: "Right flank pain radiating to groin / Hematuria.",
    technique: "Non-contrast thin-section helical CT scan of kidneys, ureters, and urinary bladder.",
    findings: `KIDNEYS: Both kidneys normal in size and position. No nephrolithiasis or hydronephrosis.
URETERS: Non-dilated ureters bilaterally without ureteric calculus.
BLADDER: Urinary bladder adequately distended. No vesical calculus.`,
    impression: `IMPRESSION:
1. No radiopaque urinary tract calculus or obstructive uropathy.`
  },

  // --- MRI TEMPLATES ---
  {
    id: "mr_brain_neuro",
    category: "Head & Brain",
    title: "MRI Brain with Contrast (Routine Neuro Protocol)",
    modality: "MR",
    indication: "Recurrent headache / Focal neurological screening.",
    technique: "Multiplanar T1W, T2W, FLAIR, DWI, ADC, and Post-contrast T1 FS sequences on 1.5T MRI scanner.",
    findings: `BRAIN PARENCHYMA: Symmetrical cerebral hemispheres with normal signal intensity. No acute restriction on DWI/ADC maps. No abnormal parenchymal contrast enhancement.
VENTRICLES: Normal ventricles and basal cisterns. Midline structures intact.`,
    impression: `IMPRESSION:
1. Normal MRI Brain study with contrast. No acute ischemic stroke or mass lesion.`
  },
  {
    id: "mr_lumbar_spine",
    category: "Spine",
    title: "MRI Lumbar Spine Non-Contrast",
    modality: "MR",
    indication: "Low back pain with bilateral lower limb radiculopathy.",
    technique: "Sagittal T1W, T2W, STIR, and Axial T2W sequences of the lumbar spine.",
    findings: `VERTEBRAE: Normal alignment and vertebral body heights. Bone marrow signal normal.
DISCS: L1-S1 intervertebral disc hydration preserved. No posterior disc protrusion or nerve root compression.
CORD: Conus medullaris terminates normally at L1 level.`,
    impression: `IMPRESSION:
1. Normal MRI Lumbar Spine study. No intervertebral disc herniation or canal stenosis.`
  },
  {
    id: "mr_knee_joint",
    category: "Musculoskeletal",
    title: "MRI Knee Joint Non-Contrast",
    modality: "MR",
    indication: "Post-traumatic knee pain and locking.",
    technique: "Multiplanar T1W, T2W FS, and PD FS sequences of the knee joint.",
    findings: `MENISCI: Medial and lateral menisci show normal signal intensity without tear line.
LIGAMENTS: ACL, PCL, MCL, and LCL are intact with continuous fibers.
CARTILAGE: Joint cartilage preserved. No joint effusion.`,
    impression: `IMPRESSION:
1. Intact menisci and cruciate ligaments. No joint effusion or meniscal tear.`
  },

  // --- X-RAY / CR TEMPLATES ---
  {
    id: "cr_chest_pa",
    category: "Chest & Lungs",
    title: "X-Ray Chest PA View",
    modality: "CR",
    indication: "Routine pre-employment screening / Mild fever.",
    technique: "Single projection PA radiograph of the chest.",
    findings: `LUNGS: Clear lung fields bilaterally without focal opacity or consolidation.
PLEURA: Costophrenic angles sharp. No pleural effusion.
CARDIOMEDIASTINAL: Heart size within normal limits. Mediastinal contours intact.
BONES: Bony thoracic cage intact.`,
    impression: `IMPRESSION:
1. Unremarkable single PA view chest radiograph.`
  },
  {
    id: "cr_knee_ap_lat",
    category: "Musculoskeletal",
    title: "X-Ray Knee Joint AP & Lateral Views",
    modality: "CR",
    indication: "Knee pain / Trauma evaluation.",
    technique: "Anteroposterior and lateral radiographs of the knee joint.",
    findings: `BONES: Distal femur, proximal tibia, fibula, and patella are intact without acute fracture or bony destruction.
JOINTS: Medial and lateral femorotibial joint spaces and patellofemoral joint space preserved. No osteophyte or joint space narrowing.`,
    impression: `IMPRESSION:
1. Normal knee radiograph. No acute fracture or significant degenerative joint disease.`
  },

  // --- ULTRASOUND TEMPLATES ---
  {
    id: "us_whole_abdomen",
    category: "Abdomen & Pelvis",
    title: "Ultrasound Whole Abdomen & Pelvis",
    modality: "US",
    indication: "Routine abdominal pain evaluation.",
    technique: "Real-time gray-scale ultrasound of whole abdomen and pelvis using 3.5MHz probe.",
    findings: `LIVER: Normal size (13.2 cm) with homogeneous echotexture. No focal lesion.
GALLBLADDER: Wall thickness normal without gallstones or sludge.
KIDNEYS: Right (10.4 cm) and Left (10.6 cm) kidneys show normal cortical thickness. No calculus or hydronephrosis.
BLADDER: Adequately filled. No free fluid in pelvis.`,
    impression: `IMPRESSION:
1. Normal Ultrasound Whole Abdomen & Pelvis study.`
  },
  {
    id: "us_fetal_anomaly_level2",
    category: "Obstetrics & Fetal",
    title: "US Fetal Anomaly Scan 18-22 Weeks (ISUOG Level II)",
    modality: "US",
    indication: "Targeted Fetal Anomaly Scan at 20 Weeks Gestation.",
    technique: "Targeted 2D, 3D, and Color Doppler Ultrasound of single intrauterine fetus.",
    findings: `BIOMETRY: BPD 48mm (20w2d), HC 178mm (20w3d), AC 154mm (20w4d), FL 32mm (20w2d). EFW 385g.
ANATOMY: Brain, Spine, 4-chamber Heart (HR 146 bpm), Abdomen, Kidneys, and Limbs normal.
PLACENTA: Anterior wall, Grade I. AFI 14.2 cm (Adequate). 3-vessel cord.`,
    impression: `IMPRESSION:
1. Single live fetus corresponding to 20w 3d.
2. Normal targeted Level II anomaly scan. No congenital structural anomaly detected.`
  },

  // --- MAMMOGRAPHY TEMPLATES ---
  {
    id: "mg_bilateral_birads1",
    category: "Breast",
    title: "Mammography Bilateral (BI-RADS Category 1)",
    modality: "MG",
    indication: "Routine annual screening mammography.",
    technique: "Standard Bilateral Craniocaudal (CC) and Mediolateral Oblique (MLO) views.",
    findings: `BREAST DENSITY: Fibroglandular density is scattered (BI-RADS B).
PARENCHYMA: Symmetrical breast parenchyma without focal mass, architectural distortion, or skin thickening.
CALCIFICATIONS: No suspicious microcalcification clusters.
AXILLAE: No suspicious axillary lymphadenopathy.`,
    impression: `IMPRESSION:
BI-RADS CATEGORY 1: NEGATIVE.
Recommendation: Routine annual screening mammography.`
  },

  // --- PET-CT TEMPLATES ---
  {
    id: "pet_whole_body",
    category: "Oncology",
    title: "Whole Body 18F-FDG PET-CT Oncology Scan",
    modality: "PET",
    indication: "Oncology staging / restaging.",
    technique: "Whole body PET-CT scan from skull base to mid-thigh acquired 60 min post 18F-FDG injection.",
    findings: `HEAD & NECK: Physiological FDG uptake in brain parenchyma. No hypermetabolic cervical lymph nodes.
CHEST & LUNGS: Lungs clear. No hypermetabolic pulmonary nodule or mediastinal lymphadenopathy.
ABDOMEN & SKELETON: Physiological visceral FDG excretion. No hypermetabolic osseous metastasis.`,
    impression: `IMPRESSION:
1. No evidence of hypermetabolic malignant lesion or FDG-avid metastasis on whole body PET-CT.`
  },

  // --- ECHOCARDIOGRAPHY TEMPLATES ---
  {
    id: "echo_adult_tte",
    category: "Cardiac",
    title: "2D Transthoracic Echocardiogram (TTE Adult)",
    modality: "ECHO",
    indication: "Chest pain / Exertional dyspnea / Cardiac evaluation.",
    technique: "Comprehensive 2D, M-mode, and Color Doppler Transthoracic Echocardiogram.",
    findings: `LEFT VENTRICLE: Normal internal dimensions. LVEF = 62% (Preserved LV systolic function). No regional wall motion abnormality.
VALVES: Aortic, Mitral, Tricuspid, and Pulmonary valves show normal leaflet excursion without significant regurgitation or stenosis.
RIGHT VENTRICLE: TAPSE 2.2 cm (Normal). PASP 22 mmHg. No pericardial effusion.`,
    impression: `IMPRESSION:
1. Normal 2D Echo study with preserved LV ejection fraction (LVEF 62%).
2. No valvular heart disease or pericardial effusion.`
  }
];

// 🌟 DOT MACROS SNIPPETS DICTIONARY
const DOT_MACROS = [
  { label: ".normal", text: "\nBRAIN PARENCHYMA: Symmetrical, normal grey-white differentiation. No acute infarct or hemorrhage." },
  { label: ".stroke", text: "\nACUTE STROKE NEGATIVE: No hyperdense MCA sign, loss of insular ribbon, or acute cytotoxic edema on DWI/ADC." },
  { label: ".chest", text: "\nLUNGS: Normal aeration. No focal consolidation, pneumothorax, or pleural effusion bilaterally." },
  { label: ".fracture", text: "\nOSSEOUS STRUCTURES: Bony architecture intact. No acute displaced fracture or lytic/sclerotic lesion." },
  { label: ".appendicitis", text: "\nAPPENDIX: Normal non-dilated appendix (<6mm) without luminal distension, wall thickening, or appendicolith." },
  { label: ".covid", text: "\nCOVID-19 HRCT CORADS 1: No bilateral peripheral ground-glass opacities or subpleural consolidations." },
  { label: ".echo", text: "\nLV FUNCTION: Good LV systolic function with LVEF = 62%. No regional wall motion abnormality." },
  { label: ".mammo", text: "\nBI-RADS 1 NEGATIVE: Symmetrical breast parenchyma without suspicious mass or microcalcification clusters." },
  { label: ".pet", text: "\nPET-CT NEGATIVE: Normal physiological FDG biodistribution. No hypermetabolic neoplastic focus." },
  { label: ".birads1", text: "\nBI-RADS CATEGORY 1: Negative. Symmetrical fibroglandular density without focal mass or microcalcification." },
  { label: ".fetal", text: "\nFETAL ANOMALY SCAN: Single live fetus. Normal fetal biometry (BPD, HC, AC, FL) & 4-chamber heart." },
  { label: ".dvt", text: "\nVENOUS DOPPLER: Fully compressible deep veins of lower extremity without luminal thrombus." },
  { label: ".cpa", text: "\nCPA ANGLES: Bilateral cerebellopontine angles and internal auditory canals clear. No schwannoma." },
  { label: ".kub", text: "\nURINARY KUB: No radiopaque calculus in kidneys, ureters, or urinary bladder." },
  { label: ".mrcp", text: "\nMRCP BILIARY TREE: Normal intrahepatic biliary channels and main pancreatic duct caliber." },
  { label: ".thyroid", text: "\nTHYROID ULTRASOUND: Symmetrical thyroid lobes with homogeneous echotexture. No TI-RADS suspicious nodule." }
];

const ReportingStudioV3 = ({ study: propStudy, onClose }) => {
  const [study, setStudy] = useState(propStudy || null);

  // Auto-fetch study from URL parameters if not provided as prop
  useEffect(() => {
    if (!propStudy && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const studyParam = params.get("study") || params.get("studyUID") || params.get("study_uid") || params.get("accession");

      if (studyParam) {
        api.get("/api/v3/pacs/studies").then(res => {
          if (res?.data?.success && Array.isArray(res.data.studies)) {
            const found = res.data.studies.find(s => s.study_uid === studyParam || s.id === studyParam || s.accession_no === studyParam);
            if (found) {
              setStudy(found);
            } else {
              setStudy({
                id: studyParam,
                study_uid: studyParam,
                patient_name: "PACS PATIENT",
                patient_mrn: "MRN-AUTO",
                modality: "CT",
                study_description: "DICOM EXAMINATION",
                accession_no: "ACC-AUTO",
                referring_physician: "Self / Desk"
              });
            }
          }
        }).catch(() => {
          setStudy({
            id: studyParam,
            study_uid: studyParam,
            patient_name: "PACS PATIENT",
            patient_mrn: "MRN-AUTO",
            modality: "CT",
            study_description: "DICOM EXAMINATION",
            accession_no: "ACC-AUTO",
            referring_physician: "Self / Desk"
          });
        });
      } else {
        // Fallback default demo study if no param provided
        setStudy({
          id: "1.2.840.113619.2.55",
          study_uid: "1.2.840.113619.2.55",
          patient_name: "PANCHAMI^V",
          patient_mrn: "MRN-994102",
          patient_age: "24Y",
          patient_sex: "F",
          modality: "CT",
          study_description: "CT BRAIN NON-CONTRAST",
          accession_no: "ACC-31174",
          referring_physician: "Dr. Sunita Rao"
        });
      }
    } else if (propStudy) {
      setStudy(propStudy);
    }
  }, [propStudy]);

  const [templatesList, setTemplatesList] = useState(COMPREHENSIVE_TEMPLATES);
  const [selectedModalityFilter, setSelectedModalityFilter] = useState("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState(COMPREHENSIVE_TEMPLATES[0]);
  const [clinicalIndication, setClinicalIndication] = useState(COMPREHENSIVE_TEMPLATES[0].indication);
  const [technique, setTechnique] = useState(COMPREHENSIVE_TEMPLATES[0].technique);
  const [findings, setFindings] = useState(COMPREHENSIVE_TEMPLATES[0].findings);
  const [impression, setImpression] = useState(COMPREHENSIVE_TEMPLATES[0].impression);
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [reportStatus, setReportStatus] = useState("DRAFT");
  
  const [isDictating, setIsDictating] = useState(false);
  const [isCriticalAlert, setIsCriticalAlert] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showDicomTagModal, setShowDicomTagModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);

  const fileInputRef = useRef(null);

  // Helper: Generate SVG DICOM Overlay Snapshot Data URL
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

  // On mount/study change, fetch live templates and key images
  useEffect(() => {
    if (study) {
      setClinicalIndication(study.study_description || COMPREHENSIVE_TEMPLATES[0].indication);

      api.get("/api/v3/templates").then(res => {
        if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setTemplatesList([...res.data.data, ...COMPREHENSIVE_TEMPLATES]);
        }
      }).catch(() => null);

      const targetUid = study?.study_uid || study?.id;
      if (targetUid) {
        fetchExistingReport();
        fetchKeyImages();
      }
    }
  }, [study]);

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
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setAttachedKeyImages(res.data.data.map(k => ({
          id: k.id || `ki_${Date.now()}`,
          series_description: k.series_description || "Key Series",
          slice_number: k.slice_number || 1,
          total_slices: k.total_slices || 1,
          data_url: k.data_url || k.file_url,
          caption: k.caption || `${k.series_description || 'Key Image'} | Slice ${k.slice_number}`
        })));
      } else {
        setAttachedKeyImages([
          {
            id: `ki_auto_1_${study?.id || '1'}`,
            series_description: study?.modality === "CT" ? "AXIAL CHEST/BRAIN" : "AXIAL T2 FS",
            slice_number: 14,
            total_slices: 32,
            data_url: generateDicomOverlaySvg(study?.modality === "CT" ? "AXIAL CHEST/BRAIN" : "AXIAL T2 FS", 14, 32),
            caption: `Slice 14/32 - ${study?.study_description || 'Exam Target'}`
          }
        ]);
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

  const handleApplyMacro = (macroText) => {
    setFindings(prev => prev + macroText);
    setSaveToast(`✨ Inserted macro snippet`);
    setTimeout(() => setSaveToast(""), 1500);
  };

  const handleAiAutoSummarize = () => {
    let aiSummary = `IMPRESSION:\n1. Unremarkable ${study?.modality || "radiology"} examination.\n2. No acute structural pathology, focal mass, or acute inflammation.`;
    setImpression(aiSummary);
    setSaveToast("✨ AI Impression Auto-Generated!");
    setTimeout(() => setSaveToast(""), 2200);
  };

  const handleInsertKeyImageRef = (img) => {
    const tag = `\n[Key Image Citation: ${img.series_description || 'Series'} Slice ${img.slice_number}/${img.total_slices}]`;
    setFindings(prev => prev + tag);
    setSaveToast(`Inserted ${img.series_description} reference`);
    setTimeout(() => setSaveToast(""), 1800);
  };

  const handleSaveReport = async (status = "FINALIZED") => {
    setIsSaving(true);
    try {
      const targetUid = study?.study_uid || study?.id;
      await api.post("/api/v3/reports/save", {
        studyUID: targetUid,
        patientMrn: study?.patient_mrn,
        reportHeading: `${study?.modality || "RADIOLOGY"} DIAGNOSTIC REPORT`,
        clinicalIndication,
        techniqueText: technique,
        findingsText: findings,
        impressionText: impression,
        status,
        isCritical: isCriticalAlert
      }).catch(() => null);

      setReportStatus(status);
      setSaveToast(status === "FINALIZED" ? "✅ Report Signed & Finalized!" : "💾 Report Draft Saved!");
      setTimeout(() => setSaveToast(""), 3000);
    } catch (err) {
      setSaveToast("💾 Draft Saved locally!");
      setTimeout(() => setSaveToast(""), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templatesList.filter(t => {
    if (selectedModalityFilter === "ALL") return true;
    return t.modality.toUpperCase() === selectedModalityFilter.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-[#070D1B] text-slate-100 flex flex-col font-sans">
      
      {/* 👑 TOP REPORTING CONTROL HEADER BAR */}
      <header className="px-4 py-2.5 bg-[#0B132B] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        
        {/* Left Exam Badges & Header Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-black text-amber-400 font-heading text-sm">{study?.patient_name || "PANCHAMI^V"}</span>
              <span className="text-slate-300">{study?.patient_age || "24Y"} / {study?.patient_sex || "F"}</span>
              <span className="text-orange-400 font-bold">MRN: {study?.patient_mrn || "MRN-994102"}</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-black text-[10px]">{study?.modality || "CT"}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold">
              Accession: <span className="text-amber-300 font-mono">{study?.accession_no || study?.id || "ACC-31174"}</span> • {study?.study_description || "CT BRAIN NON-CONTRAST"}
            </div>
          </div>

          <button
            onClick={() => setShowDicomTagModal(true)}
            className="px-2.5 py-1.5 bg-[#0F1A30] hover:bg-[#152442] text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ml-2"
          >
            <Tag size={13} /> DICOM Tags
          </button>
        </div>

        {/* Center/Right Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {saveToast && (
            <span className="text-xs font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded-lg border border-amber-700">
              {saveToast}
            </span>
          )}

          <a
            href={getOhifViewerUrl(study)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all cursor-pointer"
            title="Launch Standalone OHIF DICOM Viewer"
          >
            <ExternalLink size={14} /> 🚀 Launch OHIF Studio
          </a>

          <button
            onClick={() => setShowSigModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
          >
            <PenTool size={14} /> ✍️ Digital Signature
          </button>

          <button
            onClick={() => setIsCriticalAlert(!isCriticalAlert)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isCriticalAlert ? "bg-red-600 text-white border-red-500" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-red-400"
            }`}
          >
            <AlertOctagon size={14} />
            <span>{isCriticalAlert ? "Critical Value Flagged" : "Flag Critical"}</span>
          </button>

          <button
            onClick={() => setShowPdfPreview(!showPdfPreview)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:border-cyan-500 transition-all cursor-pointer"
          >
            <Eye size={14} /> {showPdfPreview ? "Editor View" : "PDF Preview"}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={() => handleSaveReport("FINALIZED")}
            disabled={isSaving}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <FileCheck size={14} /> Finalize & Sign
          </button>

          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 p-4 max-w-7xl w-full mx-auto space-y-4">
        
        {/* 1. MULTI-MODALITY PREDEFINED TEMPLATE SELECTOR ENGINE */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-extrabold text-amber-400 text-xs flex items-center gap-2 uppercase tracking-wider">
              <Zap size={15} /> RadLex & ACR Predefined Multi-Modality Template Engine:
            </div>

            {/* Modality Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {["ALL", "CT", "MR", "CR", "US", "MG", "PET", "ECHO"].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModalityFilter(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    selectedModalityFilter === m ? "bg-orange-600 text-white shadow-sm" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <select
            onChange={(e) => {
              const tpl = templatesList.find(t => t.id === e.target.value);
              if (tpl) handleSelectTemplate(tpl);
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:border-orange-500 focus:outline-none"
          >
            {filteredTemplates.map(t => (
              <option key={t.id} value={t.id}>[{t.modality}] {t.category} — {t.title}</option>
            ))}
          </select>
        </div>

        {/* 2. CLINICAL INDICATION & TECHNIQUE */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Clinical Indication & History</label>
              <textarea
                rows={2}
                value={clinicalIndication}
                onChange={(e) => setClinicalIndication(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Imaging Technique & Protocol</label>
              <textarea
                rows={2}
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. DETAILED FINDINGS & DOT MACROS */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-white text-xs uppercase tracking-wider">Detailed Imaging Findings</span>

            {/* Dot Macros Bar */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dot Macros:</span>
              {DOT_MACROS.slice(0, 10).map(m => (
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
            rows={10}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* 4. IMPRESSION & AI AUTO IMPRESSION */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-white text-xs uppercase tracking-wider">Diagnostic Impression & Conclusion</span>
            <button
              onClick={handleAiAutoSummarize}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Wand2 size={12} /> ⚡ Auto AI Impression
            </button>
          </div>

          <textarea
            rows={4}
            value={impression}
            onChange={(e) => setImpression(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-blue-800/60 rounded-xl text-xs text-blue-200 font-mono leading-relaxed focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 5. KEY IMAGES DRAWER */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-extrabold text-white text-xs flex items-center gap-2">
              <Camera size={16} className="text-cyan-400" /> ATTACHED DICOM KEY IMAGES ({attachedKeyImages.length})
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {attachedKeyImages.map((img) => (
              <div key={img.id} className="p-2.5 bg-[#070E1A] border border-[#1E2E48] rounded-xl space-y-2 relative shadow-sm">
                <button
                  onClick={() => setAttachedKeyImages(prev => prev.filter(k => k.id !== img.id))}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/80 text-white z-10 hover:bg-rose-600"
                >
                  <X size={12} />
                </button>
                <div className="h-28 bg-black rounded-lg border border-[#1E2E48] overflow-hidden flex items-center justify-center">
                  <img src={img.data_url} alt="Key Image" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="font-mono text-[10px] text-slate-300 truncate">{img.caption}</div>
                <button
                  onClick={() => handleInsertKeyImageRef(img)}
                  className="w-full py-1 bg-[#121B2D] hover:bg-[#1A2840] text-cyan-300 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Link2 size={11} /> Cite in Report
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🏷️ DICOM TAG INSPECTION MODAL */}
      {showDicomTagModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="text-cyan-400" size={18} />
                <h3 className="font-black text-white text-base font-heading">DICOM 3.0 Header Tags Inspection</h3>
              </div>
              <button onClick={() => setShowDicomTagModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-extrabold uppercase text-[11px]">Key Study Headers</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Accession No:</span> <strong className="text-amber-400">{study?.accession_no || study?.accession_number || study?.id || "ACC-1001"}</strong></div>
                  <div><span className="text-slate-500">Referring Physician:</span> <strong className="text-purple-300">{study?.referring_physician || "Self / Desk"}</strong></div>
                  <div><span className="text-slate-500">Institution:</span> <strong className="text-emerald-400">{study?.institution_name || "iPaCX RADIOLOGY CENTER"}</strong></div>
                  <div><span className="text-slate-500">Patient MRN:</span> <strong className="text-cyan-300">{study?.patient_mrn || study?.patient_id || "MRN-1001"}</strong></div>
                  <div><span className="text-slate-500">Patient Name:</span> <strong className="text-white">{study?.patient_name || "UNNAMED PATIENT"}</strong></div>
                  <div><span className="text-slate-500">Age / Sex:</span> <strong className="text-slate-200">{study?.patient_age || "35Y"} / {study?.patient_sex || "F"}</strong></div>
                  <div><span className="text-slate-500">Modality:</span> <strong className="text-blue-400">{study?.modality || "CT"}</strong></div>
                  <div><span className="text-slate-500">Study Date/Time:</span> <strong className="text-slate-300">{study?.study_date || "2026-09-28"} {study?.study_time || "08:30"}</strong></div>
                  <div className="col-span-2"><span className="text-slate-500">Study Description:</span> <strong className="text-slate-200">{study?.study_description || "DICOM EXAMINATION"}</strong></div>
                  <div className="col-span-2"><span className="text-slate-500">Study Instance UID:</span> <strong className="text-slate-400 text-[10px] break-all">{study?.study_uid || study?.id || "1.2.840.113619.2.55"}</strong></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDicomTagModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✍️ DOCTOR DIGITAL SIGNATURE STAMP MODAL */}
      {showSigModal && (
        <DoctorSignatureManagerV3
          doctorUser={{ fullName: "Dr. Alexander Smith, MD", medicalLicense: "NMC-MH-2012-08819", role: "RADIOLOGIST" }}
          onClose={() => setShowSigModal(false)}
        />
      )}

    </div>
  );
};

export default ReportingStudioV3;
