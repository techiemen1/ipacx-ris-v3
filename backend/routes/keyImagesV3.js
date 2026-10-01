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
  connectionTimeoutMillis: 2000
});

// In-memory fallback key image store when PostgreSQL is offline or uninitialized
const memoryKeyImageStore = new Map();

/**
 * DICOM Key Object Selection (KOS) Standard SOP Class UID
 * Standard: PS 3.16 Key Object Selection Document (1.2.840.10008.5.1.4.1.1.88.59)
 */
const DICOM_KOS_SOP_CLASS_UID = "1.2.840.10008.5.1.4.1.1.88.59";

/**
 * POST /api/v3/key-images/save
 * Standardized DICOM Key Image / KOS Object Capture Endpoint
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
      keyImageReason,
      windowCenter,
      windowWidth,
      zoom,
      rotation,
      annotations,
      measurements
    } = req.body;

    if (!studyUID || (!sopInstanceUid && !instanceId)) {
      return res.status(400).json({ success: false, message: "studyUID and sopInstanceUid are required" });
    }

    const targetInstId = sopInstanceUid || instanceId;
    const targetSeriesUid = seriesUID || "unknown_series";
    const targetSlice = sliceNumber ? parseInt(sliceNumber, 10) : 1;
    const targetFrame = frameNumber ? parseInt(frameNumber, 10) : 1;
    const targetReason = keyImageReason || "Key Image Bookmark for Clinical Report";

    const kosMetadata = {
      kosSopClassUid: DICOM_KOS_SOP_CLASS_UID,
      referencedStudyInstanceUid: studyUID,
      referencedSeriesInstanceUid: targetSeriesUid,
      referencedSopInstanceUid: targetInstId,
      frameNumber: targetFrame,
      sliceNumber: targetSlice,
      keyImageReason: targetReason,
      capturedAt: new Date().toISOString()
    };

    let keyImageObj = null;

    try {
      // 1. Attempt PostgreSQL persistent storage
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
        targetSeriesUid,
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
        JSON.stringify({ ...annotations, ...measurements, kosMetadata })
      ];

      const { rows } = await pool.query(insertQuery, values);
      keyImageObj = { ...rows[0], kosMetadata };
    } catch (dbErr) {
      console.warn("[v3 Key Image Engine] DB store offline. Using memory cache fallback:", dbErr.message);
      
      keyImageObj = {
        id: `ki_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        study_uid: studyUID,
        series_uid: targetSeriesUid,
        sop_instance_uid: targetInstId,
        slice_number: targetSlice,
        frame_number: targetFrame,
        modality: modality || "CT",
        series_description: seriesDescription || "Diagnostic Viewport",
        data_url: dataUrl,
        caption: caption || `${seriesDescription || 'Series'} | Slice ${targetSlice}`,
        window_center: windowCenter || 1.0,
        window_width: windowWidth || 1.0,
        zoom: zoom || 1.0,
        rotation: rotation || 0,
        annotations_json: { ...annotations, ...measurements, kosMetadata },
        captured_at: new Date().toISOString(),
        kosMetadata
      };

      if (!memoryKeyImageStore.has(studyUID)) {
        memoryKeyImageStore.set(studyUID, []);
      }
      memoryKeyImageStore.get(studyUID).unshift(keyImageObj);
    }

    console.log(`✅ [v3 Key Image Engine] Standardized KOS Image Saved: Study=${studyUID}, Slice=${targetSlice}`);

    res.json({
      success: true,
      message: "Standardized DICOM Key Image saved successfully",
      data: keyImageObj
    });
  } catch (err) {
    console.error("[v3 Key Image Engine] Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/key-images/:studyUID
 * Fetch all attached DICOM Key / KOS Images for a Study Instance
 */
router.get("/:studyUID", async (req, res) => {
  try {
    const { studyUID } = req.params;
    let list = [];

    try {
      const { rows } = await pool.query(
        "SELECT * FROM v3_key_images WHERE study_uid = $1 ORDER BY captured_at DESC",
        [studyUID]
      );
      list = rows;
    } catch (dbErr) {
      console.warn("[v3 Key Image Engine] DB fetch offline. Returning memory cache:", dbErr.message);
      list = memoryKeyImageStore.get(studyUID) || [];
    }

    res.json({
      success: true,
      studyUID,
      count: list.length,
      data: list
    });
  } catch (err) {
    console.error("[v3 Key Image Engine] Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

