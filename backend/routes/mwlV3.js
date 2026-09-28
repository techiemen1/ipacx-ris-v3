// FILE: backend/routes/mwlV3.js
const express = require("express");
const router = express.Router();

let mwlEntries = [
  {
    id: "MWL-1001",
    accessionNumber: "ACC-882910",
    patientName: "DESHMUKH^PRIYA",
    patientMrn: "MRN-48912",
    patientDob: "1994-06-15",
    patientGender: "F",
    modality: "US",
    scheduledStationAe: "US_ROOM_OBGYN_01",
    scheduledProcedureStepId: "SPS-OB-882910",
    procedureDescription: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "11:30:00",
    referringDoctor: "Dr. Sunita Rao, MD (OBGYN)",
    status: "SCHEDULED"
  },
  {
    id: "MWL-1002",
    accessionNumber: "ACC-551920",
    patientName: "KAPOOR^ANANYA",
    patientMrn: "MRN-19203",
    patientDob: "1998-11-20",
    patientGender: "F",
    modality: "US",
    scheduledStationAe: "US_ROOM_TVS_02",
    scheduledProcedureStepId: "SPS-GYN-551920",
    procedureDescription: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "12:00:00",
    referringDoctor: "Dr. Meenakshi Sharma, DGO",
    status: "ARRIVED"
  }
];

const MODALITY_STATIONS = [
  { aeTitle: "US_ROOM_OBGYN_01", name: "Ultrasound Suite 1 (GE Voluson E10 OBGYN)", modality: "US", location: "1st Floor - Women's Imaging" },
  { aeTitle: "US_ROOM_TVS_02", name: "Ultrasound Suite 2 (Samsung Hera W10)", modality: "US", location: "1st Floor - Gynac Care" },
  { aeTitle: "CT_SCAN_SIEMENS_01", name: "CT Scanner (Siemens Somatom 128 Slice)", modality: "CT", location: "Ground Floor - Radiology Room 4" },
  { aeTitle: "MRI_GE_3T_MAIN", name: "MRI Scanner (GE SIGNA Architect 3.0T)", modality: "MR", location: "Ground Floor - MRI Bay" },
  { aeTitle: "XRAY_AGFA_CR_01", name: "Digital X-Ray (Agfa DX-D 300)", modality: "CR", location: "Ground Floor - X-Ray Room 1" }
];

/**
 * GET /api/v3/mwl/stations
 * List Available Scheduled Station AE Titles
 */
router.get("/stations", (req, res) => {
  res.json({ success: true, stations: MODALITY_STATIONS });
});

/**
 * GET /api/v3/mwl/list
 * Returns scheduled DICOM Modality Worklist items
 */
router.get("/list", (req, res) => {
  res.json({ success: true, count: mwlEntries.length, mwl: mwlEntries });
});

/**
 * POST /api/v3/mwl/schedule
 * Add/Dispatch Patient to DICOM Modality Worklist C-FIND SCP
 */
router.post("/schedule", (req, res) => {
  try {
    const {
      accessionNumber,
      patientName,
      patientMrn,
      patientDob = "1990-01-01",
      patientGender = "F",
      modality = "US",
      scheduledStationAe = "US_ROOM_OBGYN_01",
      procedureDescription,
      referringDoctor = "Dr. Default, MD"
    } = req.body;

    if (!accessionNumber || !patientName) {
      return res.status(400).json({ success: false, message: "Accession Number & Patient Name are required" });
    }

    const newMwl = {
      id: `MWL-${Math.floor(1000 + Math.random() * 9000)}`,
      accessionNumber,
      patientName: patientName.toUpperCase(),
      patientMrn: patientMrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      patientDob,
      patientGender,
      modality,
      scheduledStationAe,
      scheduledProcedureStepId: `SPS-${modality}-${accessionNumber.replace('ACC-', '')}`,
      procedureDescription: procedureDescription || "ULTRASOUND EXAMINATION",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: new Date().toLocaleTimeString(),
      referringDoctor,
      status: "SCHEDULED"
    };

    mwlEntries.unshift(newMwl);
    res.json({ success: true, message: "DICOM MWL Item dispatched to SCP server", mwl: newMwl });
  } catch (err) {
    console.error("[v3 MWL API] Schedule error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/mwl/dicom-tags/:accessionNumber
 * Formatted DICOM C-FIND Response Tag Dataset (Standard DICOM 3.0)
 */
router.get("/dicom-tags/:accessionNumber", (req, res) => {
  const { accessionNumber } = req.params;
  const entry = mwlEntries.find(e => e.accessionNumber === accessionNumber) || mwlEntries[0];

  const dicomTags = {
    "(0008,0050)": { name: "AccessionNumber", VR: "SH", value: entry.accessionNumber },
    "(0010,0010)": { name: "PatientName", VR: "PN", value: entry.patientName },
    "(0010,0020)": { name: "PatientID", VR: "LO", value: entry.patientMrn },
    "(0010,0030)": { name: "PatientBirthDate", VR: "DA", value: entry.patientDob.replace(/-/g, "") },
    "(0010,0040)": { name: "PatientSex", VR: "CS", value: entry.patientGender },
    "(0008,0060)": { name: "Modality", VR: "CS", value: entry.modality },
    "(0040,0100)": {
      name: "ScheduledProcedureStepSequence",
      VR: "SQ",
      value: [
        {
          "(0040,0001)": { name: "ScheduledStationAETitle", VR: "AE", value: entry.scheduledStationAe },
          "(0040,0002)": { name: "ScheduledProcedureStepStartDate", VR: "DA", value: entry.scheduledDate.replace(/-/g, "") },
          "(0040,0003)": { name: "ScheduledProcedureStepStartTime", VR: "TM", value: "113000" },
          "(0040,0007)": { name: "ScheduledProcedureStepDescription", VR: "LO", value: entry.procedureDescription },
          "(0040,0009)": { name: "ScheduledProcedureStepID", VR: "SH", value: entry.scheduledProcedureStepId }
        }
      ]
    },
    "(0008,0090)": { name: "ReferringPhysicianName", VR: "PN", value: entry.referringDoctor }
  };

  res.json({ success: true, accessionNumber, dicomTags });
});

module.exports = router;
