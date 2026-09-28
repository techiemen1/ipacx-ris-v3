// FILE: backend/routes/reportsV3.js
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const aiReportAssistant = require("../services/aiReportAssistant");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pacsdb",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

/**
 * POST /api/v3/reports/ai-draft
 * Triggers AI Radiology Impression Generation
 */
router.post("/ai-draft", async (req, res) => {
  try {
    const { modality, studyDescription, findingsText, patientAge, patientGender } = req.body;
    const result = await aiReportAssistant.generateRadiologyImpression({
      modality, studyDescription, findingsText, patientAge, patientGender
    });
    res.json(result);
  } catch (err) {
    console.error("[v3 Reports API] AI draft error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/reports/save
 * Save / Finalize Radiology Report
 */
router.post("/save", async (req, res) => {
  try {
    const { studyUID, patientMrn, findingsText, impressionText, keyImageIds, status } = req.body;

    if (!studyUID) {
      return res.status(400).json({ success: false, message: "studyUID is required" });
    }

    const query = `
      INSERT INTO v3_reports (study_uid, patient_mrn, findings_text, impression_text, key_image_ids, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (study_uid) DO UPDATE SET
        findings_text = EXCLUDED.findings_text,
        impression_text = EXCLUDED.impression_text,
        key_image_ids = EXCLUDED.key_image_ids,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      studyUID,
      patientMrn || "N/A",
      findingsText || "",
      impressionText || "",
      keyImageIds || [],
      status || "DRAFT"
    ]);

    res.json({ success: true, message: "Report saved successfully", data: rows[0] });
  } catch (err) {
    console.error("[v3 Reports API] Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/reports/:studyUID
 * Fetch Report by StudyInstanceUID
 */
router.get("/:studyUID", async (req, res) => {
  try {
    const { studyUID } = req.params;
    const { rows } = await pool.query("SELECT * FROM v3_reports WHERE study_uid = $1 LIMIT 1", [studyUID]);
    res.json({ success: true, report: rows[0] || null });
  } catch (err) {
    console.error("[v3 Reports API] Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
