// FILE: backend/routes/templatesV3.js
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pacsdb",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  connectionTimeoutMillis: 2000
});

// Comprehensive Radiology Templates Dataset (ACR / RadLex Standards)
const DEFAULT_TEMPLATES = [
  // --- CT TEMPLATES ---
  {
    id: "ct_head_noncontrast",
    modality: "CT",
    category: "Head & Brain",
    title: "CT Head Non-Contrast (Routine Brain Protocol)",
    indication: "Acute headache / Neurological deficit screening.",
    technique: "Non-contrast axial CT scan of the head from skull base to vertex at 5mm slice thickness.",
    findings: `BRAIN PARENCHYMA: Symmetrical cerebral hemispheres with normal grey-white matter differentiation. No focal area of altered parenchymal attenuation. No acute ischemic territorial infarct. No intra-axial or extra-axial hemorrhage (extradural, subdural, subarachnoid).
VENTRICLES & CISTERNS: Lateral, third, and fourth ventricles are normal in size, shape, and midline alignment. Basal cisterns and cortical sulci clear.
POSTERIOR FOSSA: Cerebellar hemispheres and brainstem demonstrate normal attenuation. No mass effect.
CALVARIUM: Calvarium intact. Paranasal sinuses and mastoid air cells clear.`,
    impression: `IMPRESSION:
1. Normal CT Head Non-Contrast study.
2. No acute intracranial hemorrhage, territorial acute ischemic stroke, or mass effect.`
  },
  {
    id: "ct_brain_angio",
    modality: "CT",
    category: "Head & Brain",
    title: "CT Brain Angiography (CTA Circle of Willis)",
    indication: "Rule out intracranial aneurysm / vascular malformation / acute vessel occlusion.",
    technique: "3D contrast-enhanced CT Angiography of the Circle of Willis and neck vessels with multiplanar MIP reconstructions.",
    findings: `CAROTID & VERTEBRAL ARTERIES: Bilateral internal carotid arteries and vertebral arteries show normal luminal opacification without significant stenosis, dissection, or occlusion.
CIRCLE OF WILLIS: A1/A2 segments of anterior cerebral arteries, M1/M2 segments of middle cerebral arteries, and P1/P2 segments of posterior cerebral arteries are patent with normal caliber.
ANEURYSM / AVM: No focal aneurysmal dilation or arteriovenous malformation identified.`,
    impression: `IMPRESSION:
1. Patent intracranial arteries (Circle of Willis) without focal aneurysm, arteriovenous malformation, or high-grade stenosis.`
  },
  {
    id: "ct_pns_coronal",
    modality: "CT",
    category: "Head & Brain",
    title: "CT Paranasal Sinuses (PNS Protocol)",
    indication: "Chronic sinusitis / nasal polyp evaluation.",
    technique: "High-resolution non-contrast CT scan of paranasal sinuses in axial and coronal bone algorithm.",
    findings: `MAXILLARY SINUSES: Clear bilateral maxillary sinuses without mucosal thickening or fluid level.
FRONTAL & ETHMOID SINUSES: Frontal sinuses and anterior/posterior ethmoid cells show normal aeration.
SPHENOID SINUS: Sphenoid sinus clear.
OSTIOMEATAL COMPLEX: Osteomeatal complexes patent bilaterally. Nasal septum is straight.`,
    impression: `IMPRESSION:
1. Clear paranasal sinuses. Patent osteomeatal units bilaterally without mucosal sinus disease.`
  },
  {
    id: "hrct_chest_pulmonary",
    modality: "CT",
    category: "Chest & Lungs",
    title: "HRCT Chest (Pulmonary Parenchymal Protocol)",
    indication: "Dyspnea / Persistent dry cough evaluation.",
    technique: "High-resolution non-contrast CT chest at 1.0mm slice thickness from apices to diaphragmatic bases.",
    findings: `LUNGS: Both lungs show normal aeration and inflation without focal consolidation, ground-glass opacity, or reticular interstitial thickening.
AIRWAYS: Trachea and main stem bronchi patent. No bronchiectasis or air trapping.
PLEURA: No pleural effusion, pleural thickening, or pneumothorax.
MEDIASTINUM: Normal mediastinal contours. No hilar or mediastinal lymphadenopathy.`,
    impression: `IMPRESSION:
1. Unremarkable HRCT Chest. No active parenchymal pulmonary lesion or pleural effusion.`
  },
  {
    id: "ct_pulmonary_angio",
    modality: "CT",
    category: "Chest & Lungs",
    title: "CT Pulmonary Angiography (CTPA for PE)",
    indication: "Acute chest pain / Dyspnea / Suspected Pulmonary Embolism.",
    technique: "Bolus-tracked contrast-enhanced CT pulmonary angiography acquiring 1mm axial sections during peak arterial enhancement.",
    findings: `PULMONARY ARTERIES: Main pulmonary trunk, right and left main pulmonary arteries, lobar, segmental, and subsegmental branches demonstrate robust contrast opacification. No intraluminal filling defect or thrombus.
RIGHT HEART: Right ventricle/left ventricle diameter ratio < 1.0. Interventricular septum bowing normal.
LUNGS: No segmental pulmonary infarction.`,
    impression: `IMPRESSION:
1. Negative for acute pulmonary embolism. No filling defect in pulmonary arterial tree.`
  },
  {
    id: "ct_abdomen_pelvis_contrast",
    modality: "CT",
    category: "Abdomen & Pelvis",
    title: "CT Abdomen & Pelvis with IV Contrast",
    indication: "Acute abdominal pain / Abdominal distension / Fever.",
    technique: "Contrast-enhanced axial CT of the abdomen and pelvis from diaphragmatic domes to pubic symphysis.",
    findings: `LIVER & BILIARY: Liver shows homogeneous attenuation without focal lesion. Intra and extrahepatic biliary channels non-dilated. Gallbladder normal.
SPLEEN & PANCREAS: Spleen and pancreas demonstrate normal enhancement and architecture.
KIDNEYS: Symmetrical nephrogram. No hydronephrosis or perinephric fluid collection.
BOWEL & PERITONEUM: Stomach, small bowel loops, and colon show normal caliber. Appendix is normal without wall thickening or periappendiceal fat stranding. No free fluid or intraperitoneal free air.`,
    impression: `IMPRESSION:
1. Unremarkable CT Abdomen & Pelvis with contrast. No acute appendicitis, diverticulitis, bowel obstruction, or free fluid.`
  },
  {
    id: "ct_kub_noncontrast",
    modality: "CT",
    category: "Abdomen & Pelvis",
    title: "CT KUB Non-Contrast (Renal Calculus Protocol)",
    indication: "Acute flank pain radiating to groin / Hematuria.",
    technique: "Non-contrast thin-section helical CT scan of kidneys, ureters, and urinary bladder.",
    findings: `KIDNEYS: Both kidneys are normal in size and position. No nephrolithiasis or hydronephrosis.
URETERS: Right and left ureters are non-dilated throughout their course. No ureteric calculus.
BLADDER: Urinary bladder is adequately distended with smooth contour. No vesical calculus.`,
    impression: `IMPRESSION:
1. No radiopaque urinary tract calculus or obstructive uropathy.`
  },

  // --- MRI TEMPLATES ---
  {
    id: "mri_brain_routine",
    modality: "MR",
    category: "Head & Brain",
    title: "MRI Brain Routine (Neuro Protocol)",
    indication: "Seizure / Headache / Neurological screening.",
    technique: "Multiplanar T1W, T2W, FLAIR, DWI, ADC, and Gradient Echo MR sequences acquired on 1.5T MRI scanner.",
    findings: `PARENCHYMA: Cerebral hemispheres show normal signal intensity. No acute restriction on DWI/ADC to suggest acute ischemic stroke. No signal alteration in basal ganglia, thalami, or brainstem.
VENTRICLES: Ventricular system and subarachnoid spaces normal for age.
FLOW VOIDS: Major intracranial vascular flow voids preserved. Orbits and mastoids clear.`,
    impression: `IMPRESSION:
1. Normal MRI Brain study. No evidence of acute ischemic stroke, hemorrhage, or mass lesion.`
  },
  {
    id: "mri_lumbar_spine",
    modality: "MR",
    category: "Spine",
    title: "MRI Lumbar Spine Non-Contrast",
    indication: "Low back pain radiating to lower limbs / Sciatica.",
    technique: "Sagittal T1W, T2W, STIR, and Axial T2W sequences of the lumbar spine from L1 to S1.",
    findings: `VERTEBRAE: Normal lumbar lordosis and vertebral body heights. Bone marrow signal intensity within normal limits.
DISCS: L1-L2, L2-L3, L3-L4, L4-L5, and L5-S1 intervertebral disc heights and hydration are preserved without focal posterior disc herniation or nerve root compression.
SPINAL CORD: Conus medullaris terminates normally at L1 level. Cauda equina nerve roots travel freely.`,
    impression: `IMPRESSION:
1. Normal MRI Lumbar Spine study. No intervertebral disc protrusion, spinal canal stenosis, or nerve root impingement.`
  },
  {
    id: "mri_knee_joint",
    modality: "MR",
    category: "Musculoskeletal",
    title: "MRI Knee Joint Non-Contrast",
    indication: "Knee pain / Joint locking post-trauma.",
    technique: "Multiplanar T1W, T2W FS, and PD FS sequences of the knee joint.",
    findings: `MENISCI: Medial and lateral menisci demonstrate normal low signal intensity without tear line extending to articular surface.
LIGAMENTS: Anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with continuous fibers. Medial and lateral collateral ligaments intact.
CARTILAGE & EFFUSION: Femorotibial and patellofemoral joint cartilage intact. No joint effusion.`,
    impression: `IMPRESSION:
1. Intact menisci, ACL, PCL, and collateral ligaments. No knee joint effusion or meniscal tear.`
  },

  // --- ULTRASOUND TEMPLATES ---
  {
    id: "us_whole_abdomen",
    modality: "US",
    category: "Abdomen & Pelvis",
    title: "Ultrasound Whole Abdomen & Pelvis",
    indication: "Abdominal discomfort / Routine health check.",
    technique: "Gray-scale real-time ultrasound examination of upper abdomen and pelvis using 3.5MHz curvilinear transducer.",
    findings: `LIVER: Normal size (13.2 cm) with homogeneous parenchymal echotexture. No focal lesion. Biliary channels non-dilated.
GALLBLADDER: Normal wall thickness without gallstones or sludge.
PANCREAS & SPLEEN: Pancreas and spleen show normal size and echogenicity.
KIDNEYS: Right (10.4 cm) and Left (10.6 cm) kidneys show normal cortical thickness and corticomedullary differentiation. No calculus or hydronephrosis.
BLADDER & PELVIS: Urinary bladder adequately filled. No free fluid in Morison's pouch or pelvis.`,
    impression: `IMPRESSION:
1. Normal Ultrasound Whole Abdomen & Pelvis study.`
  },
  {
    id: "us_fetal_anomaly_level2",
    modality: "US",
    category: "Obstetrics & Fetal",
    title: "US Fetal Anomaly Scan 18-22 Weeks (ISUOG Level II)",
    indication: "Targeted Fetal Anomaly Scan at 20 Weeks Gestation.",
    technique: "Targeted 2D, 3D, and Color Doppler Ultrasound of single intrauterine fetus.",
    findings: `BIOMETRY: BPD 48mm (20w2d), HC 178mm (20w3d), AC 154mm (20w4d), FL 32mm (20w2d). EFW 385g.
ANATOMY: Brain (Ventricles, Cerebellum, Cisterna magna normal), Spine intact, 4-chamber Heart normal (HR 146 bpm), Abdomen & Kidneys normal, Limbs (4 long bones) visualized.
PLACENTA & FLUID: Anterior placenta, Grade I. AFI 14.2 cm (Adequate). 3-vessel cord.`,
    impression: `IMPRESSION:
1. Single live fetus corresponding to 20w 3d.
2. Normal targeted Level II fetal anomaly scan. No congenital structural anomaly detected.`
  },

  // --- MAMMOGRAPHY TEMPLATES ---
  {
    id: "mg_bilateral_birads1",
    modality: "MG",
    category: "Breast",
    title: "Mammography Bilateral (BI-RADS Category 1)",
    indication: "Screening mammography.",
    technique: "Standard Bilateral Craniocaudal (CC) and Mediolateral Oblique (MLO) mammographic views.",
    findings: `BREAST DENSITY: Fibroglandular density is scattered (BI-RADS Category B).
MASSES & ARCHITECTURE: Symmetrical breast parenchyma bilaterally without focal mass, architectural distortion, or skin thickening.
CALCIFICATIONS: No suspicious microcalcifications or pleomorphic clusters.
AXILLAE: No pathological axillary lymphadenopathy.`,
    impression: `IMPRESSION:
BI-RADS CATEGORY 1: NEGATIVE.
Recommendation: Routine annual screening mammography.`
  },

  // --- PET-CT TEMPLATES ---
  {
    id: "pet_whole_body",
    modality: "PET",
    category: "Oncology",
    title: "Whole Body 18F-FDG PET-CT Oncology Evaluation",
    indication: "Staging / Restaging evaluation.",
    technique: "Whole body PET-CT scan from skull base to mid-thigh acquired 60 minutes post IV injection of 18F-FDG.",
    findings: `HEAD & NECK: Physiological FDG uptake in brain parenchyma and salivary glands. No hypermetabolic cervical lymphadenopathy.
CHEST: Lungs clear. No hypermetabolic pulmonary nodule or mediastinal lymph node (SUVmax baseline).
ABDOMEN & PELVIS: Physiological FDG activity in liver, spleen, kidneys, and urinary bladder. No hypermetabolic abdominal mass or peritoneal deposit.
BONES: Normal physiological skeletal FDG distribution without hypermetabolic osseous metastasis.`,
    impression: `IMPRESSION:
1. No evidence of hypermetabolic malignant lesion or FDG-avid metastasis on whole body PET-CT.`
  },

  // --- ECHOCARDIOGRAPHY TEMPLATES ---
  {
    id: "echo_adult_tte",
    modality: "ECHO",
    category: "Cardiac",
    title: "2D Transthoracic Echocardiogram (TTE Adult Protocol)",
    indication: "Chest pain / Exertional dyspnea / Cardiac evaluation.",
    technique: "Comprehensive 2D, M-mode, and Color Doppler Transthoracic Echocardiogram.",
    findings: `LEFT VENTRICLE: Normal LV internal dimensions (LVIDd 4.5cm, LVIDs 2.8cm). Normal wall thickness (IVSd 0.9cm, LVPWd 0.9cm). LVEF = 62% (Good LV systolic function). No regional wall motion abnormality.
VALVES: Aortic, Mitral, Tricuspid, and Pulmonary valves show normal leaflet thickness and excursion. No significant regurgitation or stenosis.
RIGHT VENTRICLE & PERICARDIUM: RV size and TAPSE (2.2cm) normal. No pericardial effusion. PASP = 22 mmHg (Normal).`,
    impression: `IMPRESSION:
1. Normal 2D Echo study with preserved LV systolic function (LVEF 62%).
2. No valvular heart disease or pericardial effusion.`
  }
];

// In-memory templates store
let memoryTemplates = [...DEFAULT_TEMPLATES];

/**
 * GET /api/v3/templates
 * Fetch radiology templates filtered by modality or category
 */
router.get("/", async (req, res) => {
  try {
    const { modality, category } = req.query;
    let list = memoryTemplates;

    if (modality) {
      const mod = String(modality).toUpperCase();
      list = list.filter(t => t.modality.toUpperCase() === mod);
    }
    if (category) {
      list = list.filter(t => t.category.toLowerCase().includes(String(category).toLowerCase()));
    }

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/templates/save
 * Create or Update a Radiology Template
 */
router.post("/save", async (req, res) => {
  try {
    const { id, title, modality, category, indication, technique, findings, impression } = req.body;
    if (!title || !modality) {
      return res.status(400).json({ success: false, message: "Title and Modality are required" });
    }

    const templateId = id || `tmpl_${Date.now()}`;
    const newTmpl = {
      id: templateId,
      title,
      modality: String(modality).toUpperCase(),
      category: category || "General",
      indication: indication || "",
      technique: technique || "",
      findings: findings || "",
      impression: impression || ""
    };

    const existingIdx = memoryTemplates.findIndex(t => t.id === templateId);
    if (existingIdx >= 0) {
      memoryTemplates[existingIdx] = newTmpl;
    } else {
      memoryTemplates.unshift(newTmpl);
    }

    res.json({
      success: true,
      message: "Radiology Template saved successfully",
      data: newTmpl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v3/templates/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    memoryTemplates = memoryTemplates.filter(t => t.id !== id);
    res.json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
