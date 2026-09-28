// FILE: backend/services/templateEngineV3.js
/**
 * Modality Pre-Defined Structured Templates & Radiologist Macros
 */
const MODALITY_TEMPLATES = {
  MR_BRAIN: {
    id: "tmpl_mr_brain",
    name: "MRI Brain (Routine Neuro Protocol)",
    modality: "MR",
    findings: `TECHNIQUE: Multiplanar, multisequence MRI of the brain was performed including T1, T2, FLAIR, and DWI sequences.

FINDINGS:
- Brain Parenchyma: Normal grey-white matter differentiation. No acute cortical restriction on DWI to suggest acute ischemia.
- Ventricles & Spaces: Ventricular system and sulci are within normal limits for age. No midline shift.
- Posterior Fossa: Cerebellum and brainstem demonstrate normal signal intensity.
- Extra-axial: No extra-axial collection or hemorrhage.
- Orbits & Paranasal Sinuses: Visualized orbits and paranasal sinuses are clear.`,
    impression: `1. Unremarkable MRI Brain examination with no evidence of acute intra-cranial ischemia, acute hemorrhage, or focal mass lesion.`
  },
  CT_CHEST_HRCT: {
    id: "tmpl_ct_chest",
    name: "CT Chest HRCT (Pulmonary Protocol)",
    modality: "CT",
    findings: `TECHNIQUE: High-Resolution CT of the chest was performed without intravenous contrast.

FINDINGS:
- Lungs & Airways: Lungs are clear without focal consolidation, pleural effusion, or pneumothorax. Trachea and main bronchi are patent.
- Mediastinum: Mediastinal and hilar contours are normal. No lymphadenopathy.
- Heart & Great Vessels: Cardiac chambers and thoracic aorta are within normal limits.
- Osseous Structures: Visualized thoracic bones reveal no acute fracture or destructive osseous lesion.`,
    impression: `1. Clear HRCT Chest with no pulmonary consolidation, pleural effusion, or lymphadenopathy.`
  },
  CR_CHEST_PA: {
    id: "tmpl_cr_chest",
    name: "X-Ray Chest PA View",
    modality: "CR",
    findings: `TECHNIQUE: Single projection PA radiograph of the chest.

FINDINGS:
- Lungs: Clear lung fields bilaterally without focal consolidation or opacity.
- Pleura: Costophrenic angles are sharp. No pleural effusion.
- Cardiomediastinal: Heart size is within normal limits. Mediastinal contours are normal.
- Bones: Thoracic cage intact.`,
    impression: `1. Unremarkable single PA view radiograph of the chest.`
  }
};

const RADIOLOGY_MACROS = [
  { id: "mac_1", title: "Normal Brain T2/FLAIR", text: "Normal T2/FLAIR signal intensity throughout cerebral hemispheres with no acute ischemia or focal lesion." },
  { id: "mac_2", title: "No Acute Hemorrhage", text: "No evidence of intra-axial or extra-axial hemorrhage, mass effect, or midline shift." },
  { id: "mac_3", title: "Clear Lungs & Pleura", text: "Lungs are well expanded and clear bilaterally. No pleural effusion or pneumothorax." },
  { id: "mac_4", title: "STAT Critical Alert", text: "🚨 CRITICAL FINDING: STAT verbal communication delivered to referring physician." }
];

function getTemplatesByModality(modality) {
  const mod = String(modality || "").toUpperCase();
  return Object.values(MODALITY_TEMPLATES).filter(t => t.modality === mod);
}

module.exports = {
  MODALITY_TEMPLATES,
  RADIOLOGY_MACROS,
  getTemplatesByModality
};
