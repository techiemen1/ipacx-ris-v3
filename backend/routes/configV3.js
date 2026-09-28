// FILE: backend/routes/configV3.js
const express = require("express");
const router = express.Router();

// In-Memory Config Store for Hospital Branding
let hospitalConfig = {
  hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
  tagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Radiation Safety Certified",
  address: "Plot 104, Medical Center Avenue, Healthcare Hub, Maharashtra 400001",
  phone: "+91 (022) 2891-0000 | report@ipacx-imaging.com",
  gstin: "27AAAAA0000A1Z5",
  sacCode: "999312",
  logoUrl: "",
  updatedAt: new Date().toISOString()
};

/**
 * GET /api/v3/config/hospital
 * Fetch current Hospital Branding Settings
 */
router.get("/hospital", (req, res) => {
  res.json({ success: true, config: hospitalConfig });
});

/**
 * POST /api/v3/config/hospital
 * Update Hospital Branding Settings from Admin Portal
 */
router.post("/hospital", (req, res) => {
  try {
    const { hospitalName, tagline, address, phone, gstin, sacCode, logoUrl } = req.body;

    if (!hospitalName) {
      return res.status(400).json({ success: false, message: "Hospital Name is required" });
    }

    hospitalConfig = {
      hospitalName: hospitalName.trim(),
      tagline: tagline || hospitalConfig.tagline,
      address: address || hospitalConfig.address,
      phone: phone || hospitalConfig.phone,
      gstin: gstin || hospitalConfig.gstin,
      sacCode: sacCode || "999312",
      logoUrl: logoUrl || "",
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, message: "Hospital branding updated successfully", config: hospitalConfig });
  } catch (err) {
    console.error("[v3 Config API] Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
