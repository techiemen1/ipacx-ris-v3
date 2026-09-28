// FILE: backend/routes/pacsV3.js
const express = require("express");
const router = express.Router();
const hybridGateway = require("../services/hybridGateway");

/**
 * GET /api/v3/pacs/mobile-study/:studyUID
 * Mobile-Optimized DICOM Study Payload with Complete Series & Instances
 */
router.get("/mobile-study/:studyUID", async (req, res) => {
  try {
    const { studyUID } = req.params;
    const seriesList = await hybridGateway.fetchHybridSeriesAndInstances(studyUID);

    res.json({
      success: true,
      studyUID,
      seriesCount: seriesList.length,
      series: seriesList
    });
  } catch (err) {
    console.error("[v3 PACS API] Study fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/pacs/instance-preview/:instanceId
 * Fast Rendered JPEG/PNG Slice Buffer Preview
 */
router.get("/instance-preview/:instanceId", async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { studyUID, seriesUID, frame } = req.query;

    const buffer = await hybridGateway.fetchHybridInstanceBuffer(studyUID, seriesUID, instanceId, frame);
    if (buffer && buffer.length > 500) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(buffer);
    }
    res.status(404).send("Preview unavailable");
  } catch (err) {
    console.error("[v3 PACS API] Preview error:", err.message);
    res.status(500).send("Error rendering DICOM frame");
  }
});

module.exports = router;
