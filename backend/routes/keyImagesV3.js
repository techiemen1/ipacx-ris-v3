// FILE: backend/routes/keyImagesV3.js
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pacsdb",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

/**
 * POST /api/v3/key-images/save
 * Deterministic Key Image Capture Endpoint with Exact Ref Binding
 */
router.post("/save", async (req, res) => {
  try {
    const {
      studyUID,
      seriesUID,
      sopInstanceUid,
      instanceId,
      sliceNumber,
      frameNumber,
      modality,
      seriesDescription,
      dataUrl,
      caption,
      windowCenter,
      windowWidth,
      zoom,
      rotation,
      annotations
    } = req.body;

    if (!studyUID || (!sopInstanceUid && !instanceId)) {
      return res.status(400).json({ success: false, message: "studyUID and sopInstanceUid are required" });
    }

    const targetInstId = sopInstanceUid || instanceId;
    const targetSlice = sliceNumber ? parseInt(sliceNumber, 10) : 1;
    const targetFrame = frameNumber ? parseInt(frameNumber, 10) : 1;

    // Insert into v3_key_images table with ON CONFLICT / RETURNING
    const insertQuery = `
      INSERT INTO v3_key_images (
        study_uid, series_uid, sop_instance_uid, slice_number, frame_number,
        modality, series_description, data_url, caption,
        window_center, window_width, zoom, rotation, annotations_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      studyUID,
      seriesUID || "unknown_series",
      targetInstId,
      targetSlice,
      targetFrame,
      modality || "CT",
      seriesDescription || "Diagnostic Viewport",
      dataUrl,
      caption || `${seriesDescription || 'Series'} | Slice ${targetSlice}`,
      windowCenter || 1.0,
      windowWidth || 1.0,
      zoom || 1.0,
      rotation || 0,
      JSON.stringify(annotations || {})
    ];

    const { rows } = await pool.query(insertQuery, values);
    const keyImage = rows[0];

    console.log(`[v3 Key Image Engine] Key image saved successfully: ID=${keyImage.id}, Slice=${keyImage.slice_number}`);

    res.json({
      success: true,
      message: "Key image saved successfully",
      data: keyImage
    });
  } catch (err) {
    console.error("[v3 Key Image Engine] Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/key-images/:studyUID
 * Fetch all attached Key Images for a Study Instance
 */
router.get("/:studyUID", async (req, res) => {
  try {
    const { studyUID } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM v3_key_images WHERE study_uid = $1 ORDER BY captured_at DESC",
      [studyUID]
    );

    res.json({
      success: true,
      studyUID,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error("[v3 Key Image Engine] Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
