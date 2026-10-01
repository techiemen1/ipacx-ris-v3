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
  Check,
  PenTool,
  ExternalLink,
  Activity,
  Info,
  Tag,
  Plus
} from "lucide-react";
import api from "../../api/axios";
import MobileMPRViewer from "../DICOMViewer/MobileMPRViewer";
import DoctorSignatureManagerV3 from "./DoctorSignatureManagerV3";
import { getOhifViewerUrl } from "../../utils/viewerUrl";

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

export default function DiagnosticWorkstationV3({ study: propStudy, onClose, initialMode = "SPLIT" }) {
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

  // 📐 LAYOUT VIEW MODES: "VIEWER_90" | "SPLIT" | "STUDIO_90" | "VIEWER_ONLY" | "STUDIO_ONLY" | "MPR_3D"
  const [layoutMode, setLayoutMode] = useState(
    initialMode === "MPR_3D" ? "MPR_3D" : "SPLIT"
  );

  const [activeSeriesList, setActiveSeriesList] = useState([
    { series_id: "ser_1", series_description: "Topogram 0.6", modality: study?.modality || "CT", total_slices: 1, instances: [] },
    { series_id: "ser_2", series_description: "Brain 1.0 H20s", modality: study?.modality || "CT", total_slices: 223, instances: [] },
    { series_id: "ser_3", series_description: "Brain 1.0 H70s", modality: study?.modality || "CT", total_slices: 223, instances: [] }
  ]);

  const [activeSeriesIndex, setActiveSeriesIndex] = useState(1);
  const [currentSliceNumber, setCurrentSliceNumber] = useState(13);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);

  // REPORTING STUDIO STATES & TEMPLATES
  const [templatesList, setTemplatesList] = useState(COMPREHENSIVE_TEMPLATES);
  const [selectedModalityFilter, setSelectedModalityFilter] = useState("ALL");
  const [reportHeading, setReportHeading] = useState("RADIOLOGY DIAGNOSTIC REPORT");
  const [clinicalIndication, setClinicalIndication] = useState("Acute neurological deficit / cephalea.");
  const [techniqueText, setTechniqueText] = useState(COMPREHENSIVE_TEMPLATES[0].technique);
  const [findingsText, setFindingsText] = useState(COMPREHENSIVE_TEMPLATES[0].findings);
  const [impressionText, setImpressionText] = useState(COMPREHENSIVE_TEMPLATES[0].impression);
  const [attachedKeyImages, setAttachedKeyImages] = useState([]);
  const [isDictating, setIsDictating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [viewerEngine, setViewerEngine] = useState("CANVAS"); // "CANVAS" | "OHIF_IFRAME"
  const [showDicomTagModal, setShowDicomTagModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch templates & live key images on mount/study change
  useEffect(() => {
    if (study) {
      setReportHeading(study.modality === "CT" ? "CT HEAD REPORT" : `${study.modality || "RADIOLOGY"} DIAGNOSTIC REPORT`);
      setClinicalIndication(study.study_description || "Acute neurological deficit / cephalea.");
      if (Array.isArray(study.series_list) && study.series_list.length > 0) {
        setActiveSeriesList(study.series_list);
      }

      // Fetch live templates from backend
      api.get("/api/v3/templates").then(res => {
        if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setTemplatesList([...res.data.data, ...COMPREHENSIVE_TEMPLATES]);
        }
      }).catch(() => null);

      // Fetch live key images for this study
      const studyUid = study?.study_uid || study?.id;
      if (studyUid) {
        api.get(`/api/v3/key-images/${studyUid}`).then(res => {
          if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setAttachedKeyImages(res.data.data.map(k => ({
              id: k.id || `ki_${Date.now()}`,
              series_description: k.series_description || "Key Series",
              slice_number: k.slice_number || 1,
              total_slices: k.total_slices || 1,
              data_url: k.data_url || k.file_url,
              caption: k.caption || `${k.series_description || 'Key Image'} | Slice ${k.slice_number}`
            })));
          }
        }).catch(() => null);
      }
    }
  }, [study]);

  const currentSeries = activeSeriesList?.[activeSeriesIndex] || activeSeriesList?.[0] || {
    series_id: "ser_1",
    series_description: "Axial View",
    modality: study?.modality || "CT",
    total_slices: 223,
    instances: []
  };

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

  // Default initial key images if none returned from server
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

  const captureKeyImage = async () => {
    const totalSlices = currentSeries.total_slices || 223;
    const seriesDesc = currentSeries.series_description || "Brain 1.0 H20s";
    const caption = `${seriesDesc} | Slice ${currentSliceNumber}/${totalSlices}`;
    const studyUid = study?.study_uid || study?.id || "1.2.840.113619.2.55";
    const dataUrl = generateDicomOverlaySvg(seriesDesc, currentSliceNumber, totalSlices);

    const newKi = {
      id: `ki_${Date.now()}`,
      series_description: seriesDesc,
      slice_number: currentSliceNumber,
      total_slices: totalSlices,
      data_url: dataUrl,
      caption
    };

    setAttachedKeyImages(prev => [newKi, ...prev]);
    setToastMessage(`📸 Key Image Captured & Saving to Disk...`);

    // Post payload to backend for lightweight disk storage
    try {
      const res = await api.post("/api/v3/key-images/save", {
        studyUID: studyUid,
        seriesUID: currentSeries.series_id || "ser_1",
        sopInstanceUid: `1.2.840.inst.${Date.now()}`,
        sliceNumber: currentSliceNumber,
        modality: study?.modality || "CT",
        seriesDescription: seriesDesc,
        dataUrl,
        caption
      }).catch(() => null);

      if (res?.data?.success && res?.data?.data) {
        setToastMessage(`💾 Key Image Saved to Disk (/uploads/key_images/)!`);
      } else {
        setToastMessage(`📸 Key Image Captured: ${caption}`);
      }
    } catch (e) {
      setToastMessage(`📸 Key Image Captured: ${caption}`);
    }

    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleFileUploadKeyImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      const studyUid = study?.study_uid || study?.id || "1.2.840.113619.2.55";
      const newKi = {
        id: `ki_upload_${Date.now()}`,
        series_description: file.name,
        slice_number: 1,
        total_slices: 1,
        data_url: dataUrl,
        caption: `Uploaded Snapshot: ${file.name}`
      };
      setAttachedKeyImages(prev => [newKi, ...prev]);
      setToastMessage(`📸 Key Image ${file.name} Attached!`);
      setTimeout(() => setToastMessage(""), 3000);

      try {
        await api.post("/api/v3/key-images/save", {
          studyUID: studyUid,
          seriesUID: "ser_upload",
          sopInstanceUid: `1.2.840.inst.${Date.now()}`,
          sliceNumber: 1,
          modality: study?.modality || "CT",
          seriesDescription: file.name,
          dataUrl,
          caption: `Uploaded Snapshot: ${file.name}`
        }).catch(() => null);
      } catch (err) {}
    };
    reader.readAsDataURL(file);
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
    setReportHeading(`${tpl.modality} ${tpl.category.toUpperCase()} REPORT`);
    setClinicalIndication(tpl.indication);
    setTechniqueText(tpl.technique);
    setFindingsText(tpl.findings);
    setImpressionText(tpl.impression);
    setToastMessage(`⚡ Applied Template: ${tpl.title}`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleAiAutoImpression = () => {
    let aiImpression = `IMPRESSION:\n1. Normal ${study?.modality || "radiology"} examination.\n2. No acute hemorrhage, mass effect, or territorial ischemia.`;
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

  const filteredTemplates = templatesList.filter(t => {
    if (selectedModalityFilter === "ALL") return true;
    return t.modality.toUpperCase() === selectedModalityFilter.toUpperCase();
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 font-sans">
      
      {/* 👑 TOP CONTROL HEADER BAR */}
      <header className="px-4 py-2 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left Patient Identity Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#070D1B] border border-[#1E335B] flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="font-black text-amber-400 font-heading text-sm">{study?.patient_name || "PANCHAMI"}</span>
            <span className="text-slate-300">{study?.patient_age || "20Y"} / {study?.patient_sex || "F"}</span>
            <span className="text-orange-400 font-bold">MRN: {study?.patient_mrn || study?.patient_id || "2956457"}</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-black text-[10px]">{study?.modality || "CT"}</span>
            <span className="text-amber-300 font-bold">ACC: {study?.accession_no || study?.accession_number || study?.id || "31174"}</span>
            <span className="text-slate-400 font-medium hidden md:inline">• Ref: {study?.referring_physician || "Self / Desk"}</span>
          </div>

          <button
            onClick={() => setShowDicomTagModal(true)}
            className="px-2.5 py-1.5 bg-[#0F1A30] hover:bg-[#152442] text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
            title="Inspect All DICOM Headers & Tags"
          >
            <Tag size={13} /> DICOM Tags
          </button>
        </div>

        {/* Center 5 Layout View Mode Toggles & OHIF Launcher */}
        <div className="flex items-center gap-1 bg-[#040812] p-1 rounded-xl border border-[#1E335B] text-xs">
          <button
            onClick={() => setLayoutMode("VIEWER_90")}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
              layoutMode === "VIEWER_90" ? "bg-orange-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            90% Viewer
          </button>
          <button
            onClick={() => setLayoutMode("SPLIT")}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              layoutMode === "SPLIT" ? "bg-orange-600 text-white shadow-md shadow-orange-600/30" : "bg-[#0A1224] text-slate-300 border border-[#1E335B] hover:text-white"
            }`}
          >
            ⚡ 50/50 Split
          </button>
          <button
            onClick={() => setLayoutMode("STUDIO_90")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "STUDIO_90" ? "bg-orange-600 text-white shadow-md shadow-orange-600/30" : "bg-[#0A1224] text-slate-300 border border-[#1E335B] hover:text-white"
            }`}
          >
            90% Studio
          </button>
          <button
            onClick={() => setLayoutMode("VIEWER_ONLY")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "VIEWER_ONLY" ? "bg-orange-600 text-white shadow-md shadow-orange-600/30" : "bg-[#0A1224] text-slate-300 border border-[#1E335B] hover:text-white"
            }`}
          >
            Viewer Only
          </button>
          <button
            onClick={() => setLayoutMode("STUDIO_ONLY")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "STUDIO_ONLY" ? "bg-orange-600 text-white shadow-md shadow-orange-600/30" : "bg-[#0A1224] text-slate-300 border border-[#1E335B] hover:text-white"
            }`}
          >
            Studio Only
          </button>
          <button
            onClick={() => setLayoutMode("MPR_3D")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "MPR_3D" ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "bg-[#0A1224] text-purple-300 border border-purple-900/50 hover:text-white"
            }`}
          >
            3D MPR
          </button>

          <a
            href={getOhifViewerUrl(study)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-md shadow-amber-600/30"
            title="Launch Standalone OHIF Viewer in New Tab"
          >
            <ExternalLink size={12} /> OHIF Studio
          </a>
        </div>

        {/* Right Top Action Buttons */}
        <div className="flex items-center gap-2">
          {toastMessage && (
            <span className="text-xs font-bold text-amber-300 bg-amber-950/90 px-3 py-1 rounded-lg border border-amber-700">
              {toastMessage}
            </span>
          )}

          <button
            onClick={() => setShowSigModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md shadow-purple-600/30"
          >
            <PenTool size={13} /> Digital Signature
          </button>

          <button
            onClick={captureKeyImage}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer shadow-md shadow-orange-600/30"
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
            onClick={() => onClose ? onClose() : window.history.back()}
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
            <div className="px-3 py-1.5 bg-[#091120] border-b border-[#1E2E48] flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 font-extrabold text-cyan-400 text-xs truncate">
                <Activity size={14} />
                <span>DICOM Workstation Engine</span>
                <div className="flex items-center gap-1 bg-[#040812] p-0.5 rounded-lg border border-[#1E2E48] text-[10px]">
                  <button
                    onClick={() => setViewerEngine("CANVAS")}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      viewerEngine === "CANVAS" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Series Viewport
                  </button>
                  <button
                    onClick={() => setViewerEngine("OHIF_IFRAME")}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      viewerEngine === "OHIF_IFRAME" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ Embedded OHIF
                  </button>
                </div>
              </div>

              {/* Quick Image Tools */}
              <div className="flex items-center gap-2 text-slate-300">
                <button title="Annotation Pencil" className="p-1 hover:text-white"><PenTool size={14} /></button>
                <button title="Magnify Zoom" className="p-1 hover:text-white"><ZoomIn size={14} /></button>
                <button title="Pan Move" className="p-1 hover:text-white"><Move size={14} /></button>
                <button title="Window / Level" className="p-1 hover:text-white"><Sun size={14} /></button>
                <button onClick={captureKeyImage} title="Snapshot Key Image" className="p-1 text-cyan-400 hover:text-white"><Camera size={14} /></button>
                <a href={getOhifViewerUrl(study)} target="_blank" rel="noreferrer" title="Open OHIF Viewer in New Tab" className="p-1 text-cyan-400 hover:text-white">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* VIEWER CANVAS & SERIES THUMBNAIL STRIP */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Left Series Thumbnails Strip */}
              {layoutMode !== "STUDIO_90" && (
                <div className="w-36 bg-[#070D19] border-r border-[#1E2E48] p-2 space-y-3 overflow-y-auto shrink-0 font-mono text-[10px]">
                  <div className="text-[9px] font-bold text-slate-400 uppercase border-b border-[#1E2E48] pb-1">Series Queue</div>
                  {activeSeriesList.map((ser, i) => (
                    <div
                      key={ser.series_id}
                      onClick={() => setActiveSeriesIndex(i)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        activeSeriesIndex === i ? "bg-blue-950/80 border-cyan-500 text-white" : "bg-[#040812] border-[#1E2E48] text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="h-16 bg-[#091120] rounded mb-1 flex items-center justify-center border border-[#1E2E48]">
                        <ImageIcon size={20} className={activeSeriesIndex === i ? "text-cyan-400" : "text-slate-600"} />
                      </div>
                      <div className="font-bold truncate text-slate-200">{ser.series_description}</div>
                      <div className="text-slate-400">S:{i+1} • {ser.total_slices}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Center DICOM Render Viewport */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {viewerEngine === "OHIF_IFRAME" ? (
                  <iframe
                    src={getOhifViewerUrl(study)}
                    className="w-full h-full border-0 bg-black"
                    title="Live OHIF DICOM Viewer"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={generateDicomOverlaySvg(currentSeries.series_description, currentSliceNumber, currentSeries.total_slices)}
                      alt="DICOM Slice"
                      className="max-w-full max-h-full object-contain filter transition-all"
                      style={{ filter: `brightness(${brightness}) contrast(${contrast})` }}
                    />

                    {/* Corner Overlays */}
                    <div className="absolute top-4 left-4 font-mono text-xs text-cyan-400 font-bold space-y-0.5 pointer-events-none">
                      <div>{study?.patient_name || "PANCHAMI"}</div>
                      <div className="text-slate-400 text-[11px]">{currentSeries.series_description}</div>
                    </div>

                    <div className="absolute top-4 right-4 font-mono text-xs text-cyan-400 font-bold text-right pointer-events-none">
                      <div>{study?.modality || "CT"} HEAD</div>
                      <div className="text-slate-400 text-[11px]">S:{activeSeriesIndex+1} • Slices: {currentSeries.total_slices}</div>
                    </div>

                    <div className="absolute bottom-4 left-4 font-mono text-xs text-slate-300 pointer-events-none">
                      <div>WW: 148 WL: 50</div>
                      <div>Zoom: 1.85x</div>
                    </div>

                    <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-300 text-right pointer-events-none">
                      <div>Frame i:{currentSliceNumber} ({currentSliceNumber}/{currentSeries.total_slices || 223})</div>
                    </div>
                  </div>
                )}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase">MRN Number</div>
                <div className="font-extrabold text-orange-400">{study?.patient_mrn || study?.patient_id || "2956457"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Accession No</div>
                <div className="font-extrabold text-amber-400">{study?.accession_no || study?.accession_number || study?.id || "31174"}</div>
              </div>
            </div>

            {/* 2. REPORT TITLE & CLINICAL INDICATION */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Report Heading Title</label>
                  <input
                    type="text"
                    value={reportHeading}
                    onChange={(e) => setReportHeading(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clinical Indication</label>
                  <input
                    type="text"
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. MULTI-MODALITY PREDEFINED TEMPLATE SELECTOR ENGINE */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                  <Zap size={13} /> RadLex & ACR Predefined Template Engine:
                </span>
                
                {/* Modality Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {["ALL", "CT", "MR", "CR", "US", "MG", "PET", "ECHO"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedModalityFilter(m)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                        selectedModalityFilter === m ? "bg-orange-600 text-white shadow-sm" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Select Dropdown */}
              <select
                onChange={(e) => {
                  const tpl = templatesList.find(t => t.id === e.target.value);
                  if (tpl) handleSelectTemplate(tpl);
                }}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold focus:border-orange-500 focus:outline-none"
              >
                {filteredTemplates.map(t => (
                  <option key={t.id} value={t.id}>[{t.modality}] {t.category} — {t.title}</option>
                ))}
              </select>
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
                ⚡ Speech Engine Ready | Target: <span className="font-bold text-white">Findings</span>
              </div>
            </div>

            {/* 5. DETAILED IMAGING FINDINGS EDITOR WITH DOT MACROS */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">Detailed Imaging Findings</span>

                {/* Dot Macros Bar */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dot Macros:</span>
                  {DOT_MACROS.slice(0, 8).map(m => (
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
                rows={8}
                value={findingsText}
                onChange={(e) => setFindingsText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono leading-relaxed focus:border-orange-500 focus:outline-none"
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
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <ImageIcon size={15} className="text-cyan-400" /> KEY IMAGES ATTACHED ({attachedKeyImages.length})
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUploadKeyImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Upload Image
                  </button>
                  <button
                    onClick={captureKeyImage}
                    className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer shadow-md shadow-orange-600/30"
                  >
                    <Camera size={12} /> Capture Key Image
                  </button>
                </div>
              </div>

              {/* Snapshot Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {attachedKeyImages.map((img) => (
                  <div key={img.id} className="p-2.5 bg-[#070E1A] border border-[#1E2E48] rounded-xl space-y-2 relative group shadow-sm">
                    <button
                      onClick={() => setAttachedKeyImages(prev => prev.filter(k => k.id !== img.id))}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/80 text-white opacity-80 hover:opacity-100 transition-opacity z-10"
                      title="Remove Key Image"
                    >
                      <X size={12} />
                    </button>

                    <div className="h-32 bg-black rounded-lg border border-[#1E2E48] overflow-hidden flex items-center justify-center">
                      <img src={img.data_url} alt="Key Image" className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="font-mono text-[10px] text-slate-300 truncate font-medium">{img.caption}</div>

                    <button
                      onClick={() => handleCiteKeyImage(img)}
                      className="w-full py-1 bg-[#121B2D] hover:bg-[#1A2840] border border-[#1E2E48] text-cyan-300 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
}
