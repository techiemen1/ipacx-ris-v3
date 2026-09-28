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

router.get("/study-series-instances/:studyUID", async (req, res) => {
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
    console.error("[v3 PACS API] Study series instances error:", err.message);
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

    const result = await hybridGateway.fetchHybridInstanceBuffer(studyUID, seriesUID, instanceId, frame);
    if (result && result.buffer) {
      res.setHeader("Content-Type", result.contentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(result.buffer);
    }
    res.status(404).send("Preview unavailable");
  } catch (err) {
    console.error("[v3 PACS API] Instance preview error:", err.message);
    res.status(500).send("Internal preview error");
  }
});

/**
 * GET /api/v3/pacs/studies
 * Live Patient Studies Query from Orthanc PACS & DB
 */
router.get("/studies", async (req, res) => {
  try {
    const liveStudies = await hybridGateway.fetchLiveOrthancStudies();
    res.json({
      success: true,
      count: liveStudies.length,
      studies: liveStudies
    });
  } catch (err) {
    console.error("[v3 PACS API] Live studies fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/pacs/cfind
 * Execute DICOM C-FIND SCU query to a registered DICOM node via Orthanc
 */
router.post("/cfind", async (req, res) => {
  try {
    const { nodeId, patientName, patientMrn, accession, modality } = req.body;
    const results = await hybridGateway.queryRemoteDicomNode(nodeId, {
      patientName,
      patientMrn,
      accession,
      modality
    });

    res.json({
      success: true,
      nodeId: nodeId || "ALL",
      count: results.length,
      results
    });
  } catch (err) {
    console.error("[v3 PACS API] C-FIND error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/pacs/cmove
 * Execute DICOM C-MOVE SCU retrieve from registered DICOM node
 */
router.post("/cmove", async (req, res) => {
  try {
    const { queryId, answerIndex, nodeId, studyUID } = req.body;
    const result = await hybridGateway.retrieveStudyFromNode({
      queryId,
      answerIndex,
      nodeId,
      studyUID
    });

    res.json({
      success: true,
      message: "C-MOVE retrieve initiated successfully",
      details: result
    });
  } catch (err) {
    console.error("[v3 PACS API] C-MOVE error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/pacs/dicom-nodes
 * Registered DICOM Nodes List
 */
router.get("/dicom-nodes", async (req, res) => {
  try {
    const nodes = await hybridGateway.fetchOrthancModalities();
    res.json({
      success: true,
      count: nodes.length,
      nodes
    });
  } catch (err) {
    console.error("[v3 PACS API] DICOM nodes error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/pacs/dicom-nodes
 * Register a new DICOM Modality Node
 */
router.post("/dicom-nodes", async (req, res) => {
  try {
    const { name, aet, host, port } = req.body;
    if (!aet || !host) {
      return res.status(400).json({ success: false, message: "AET and Host are required" });
    }
    const result = await hybridGateway.addOrthancModality(name, aet, host, port);
    res.json({
      success: true,
      message: "DICOM node registered successfully",
      node: result
    });
  } catch (err) {
    console.error("[v3 PACS API] Add DICOM node error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;



