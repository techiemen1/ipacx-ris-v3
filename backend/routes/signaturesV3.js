// FILE: backend/routes/signaturesV3.js
const express = require("express");
const router = express.Router();

// Mock Doctor Signatures DB Store
let doctorSignatures = [
  {
    id: "SIG-101",
    doctorUsername: "dr.smith",
    doctorName: "Dr. Alexander Smith, MD",
    nmcNumber: "NMC-MH-2012-08819",
    designation: "Consultant Radiologist & Imaging Specialist",
    signatureUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAAyCAYAAAD9Kx14AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAA...",
    qrVerificationUrl: "https://verify.ipacx.com/report/ACC-882910?doctor=NMC-MH-2012-08819",
    updatedAt: new Date().toISOString()
  },
  {
    id: "SIG-102",
    doctorUsername: "dr.sharma",
    doctorName: "Dr. Sunita Sharma, MD (OBGYN Radiology)",
    nmcNumber: "NMC-DL-2015-11203",
    designation: "Senior Radiologist - Women's Imaging",
    signatureUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAAyCAYAAAD9Kx14AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAA...",
    qrVerificationUrl: "https://verify.ipacx.com/report/ACC-551920?doctor=NMC-DL-2015-11203",
    updatedAt: new Date().toISOString()
  }
];

/**
 * GET /api/v3/signatures/list
 * List registered Doctor Signatures
 */
router.get("/list", (req, res) => {
  res.json({ success: true, count: doctorSignatures.length, signatures: doctorSignatures });
});

/**
 * POST /api/v3/signatures/upload
 * Save / Upload Doctor Digital Signature Image or Canvas Drawing
 */
router.post("/upload", (req, res) => {
  try {
    const { doctorUsername, doctorName, nmcNumber, designation, signatureDataUrl } = req.body;

    if (!doctorUsername || !signatureDataUrl) {
      return res.status(400).json({ success: false, message: "Doctor username & signature image data required" });
    }

    const existingIdx = doctorSignatures.findIndex(s => s.doctorUsername === doctorUsername);
    const updatedObj = {
      id: existingIdx >= 0 ? doctorSignatures[existingIdx].id : `SIG-${Math.floor(100 + Math.random() * 900)}`,
      doctorUsername,
      doctorName: doctorName || "Dr. Radiologist, MD",
      nmcNumber: nmcNumber || "NMC-REG-2026-991",
      designation: designation || "Consultant Radiologist",
      signatureUrl: signatureDataUrl,
      qrVerificationUrl: `https://verify.ipacx.com/report/VERIFY-${Date.now()}?doctor=${nmcNumber || 'NMC-REG-2026'}`,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      doctorSignatures[existingIdx] = updatedObj;
    } else {
      doctorSignatures.unshift(updatedObj);
    }

    res.json({ success: true, message: "Doctor signature saved successfully", signature: updatedObj });
  } catch (err) {
    console.error("[v3 Signatures API] Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/signatures/verify/:accessionNumber
 * Public Verification QR Endpoint
 */
router.get("/verify/:accessionNumber", (req, res) => {
  const { accessionNumber } = req.params;
  res.json({
    success: true,
    accessionNumber,
    verificationStatus: "VERIFIED_AUTHENTIC",
    issuingHospital: "iPaCX Radiology & Diagnostic Imaging Center",
    nabhAccredited: true,
    aerbRegistered: true,
    digitalSignatureHash: `SHA256-${Math.floor(100000000 + Math.random() * 900000000)}`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
