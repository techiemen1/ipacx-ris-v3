// FILE: backend/routes/billingV3.js
const express = require("express");
const router = express.Router();

// Mock database store for v3 invoices
let invoices = [
  {
    id: "INV-2026-00101",
    accessionNumber: "ACC-882910",
    patientName: "DESHMUKH^PRIYA",
    patientMrn: "MRN-48912",
    modality: "US",
    procedureName: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",
    sacCode: "999312",
    baseAmount: 3500.00,
    gstRate: 5,
    cgstAmount: 87.50,
    sgstAmount: 87.50,
    totalAmount: 3675.00,
    discountAmount: 0.00,
    paymentMethod: "UPI_QR",
    paymentStatus: "PAID",
    transactionRef: "UPI/6291028491/GPay",
    insuranceTpa: "N/A",
    preAuthNumber: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "INV-2026-00102",
    accessionNumber: "ACC-551920",
    patientName: "KAPOOR^ANANYA",
    patientMrn: "MRN-19203",
    modality: "US",
    procedureName: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS",
    sacCode: "999312",
    baseAmount: 2800.00,
    gstRate: 5,
    cgstAmount: 70.00,
    sgstAmount: 70.00,
    totalAmount: 2940.00,
    discountAmount: 0.00,
    paymentMethod: "INSURANCE_TPA",
    paymentStatus: "PRE_AUTHORIZED",
    transactionRef: "TPA-CLAIM-88192",
    insuranceTpa: "Star Health & Allied Insurance",
    preAuthNumber: "PA-2026-991823",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Tariff rate card with Gynecology/OBGYN & Standard Radiology Scans
const TARIFF_RATES = [
  { code: "US-OB-01", category: "Gynecology & Obstetrics", name: "Obstetric Fetal Anomaly Scan (18-22 Weeks) Level II", sacCode: "999312", baseRate: 3500, gstRate: 5, protocol: "ISUOG 20-Point Check" },
  { code: "US-OB-02", category: "Gynecology & Obstetrics", name: "NT Scan (11-13+6 Weeks) + Nasal Bone", sacCode: "999312", baseRate: 2500, gstRate: 5, protocol: "FMF UK Protocol" },
  { code: "US-GYN-03", category: "Gynecology & Obstetrics", name: "Transvaginal Ultrasound (TVS) Pelvis", sacCode: "999312", baseRate: 2200, gstRate: 5, protocol: "IOTA Simple Rules" },
  { code: "US-GYN-04", category: "Gynecology & Obstetrics", name: "Follicular Monitoring Series (3 Visits Package)", sacCode: "999312", baseRate: 3000, gstRate: 5, protocol: "ART Protocol" },
  { code: "US-OB-05", category: "Gynecology & Obstetrics", name: "Obstetric Color Doppler & Amniotic Fluid Index (AFI)", sacCode: "999312", baseRate: 2800, gstRate: 5, protocol: "Umbilical & MCA Doppler" },
  { code: "MR-BRAIN-01", category: "MRI Diagnostic", name: "MRI Brain Contrast 3.0T + MR Angiography", sacCode: "999312", baseRate: 7500, gstRate: 5, protocol: "Stroke/Epilepsy Protocol" },
  { code: "CT-CHEST-01", category: "CT Diagnostic", name: "HRCT Chest (Low Dose Radiation Protocol)", sacCode: "999312", baseRate: 4200, gstRate: 5, protocol: "AERB Dose Bounded" },
  { code: "XR-CHEST-01", category: "Digital X-Ray", name: "Chest PA View Digital Radiography", sacCode: "999312", baseRate: 600, gstRate: 0, protocol: "Standard CR" }
];

/**
 * GET /api/v3/billing/rates
 * Tariff Rate Card for Procedures
 */
router.get("/rates", (req, res) => {
  res.json({ success: true, rates: TARIFF_RATES });
});

/**
 * GET /api/v3/billing/invoices
 * Audit list of billing invoices
 */
router.get("/invoices", (req, res) => {
  res.json({ success: true, count: invoices.length, invoices });
});

/**
 * POST /api/v3/billing/create-invoice
 * Generate new diagnostic billing tax invoice
 */
router.post("/create-invoice", (req, res) => {
  try {
    const {
      accessionNumber,
      patientName,
      patientMrn,
      modality,
      procedureName,
      baseAmount,
      gstRate = 5,
      discountAmount = 0,
      paymentMethod = "UPI_QR",
      paymentStatus = "PAID",
      transactionRef = "",
      insuranceTpa = "",
      preAuthNumber = ""
    } = req.body;

    if (!accessionNumber || !patientName || !baseAmount) {
      return res.status(400).json({ success: false, message: "Missing required billing parameters" });
    }

    const netBase = Math.max(0, parseFloat(baseAmount) - parseFloat(discountAmount || 0));
    const gstPct = parseFloat(gstRate);
    const totalGst = (netBase * gstPct) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = netBase + totalGst;

    const newInvoice = {
      id: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      accessionNumber,
      patientName: patientName.toUpperCase(),
      patientMrn: patientMrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      modality: modality || "US",
      procedureName,
      sacCode: "999312",
      baseAmount: parseFloat(baseAmount),
      discountAmount: parseFloat(discountAmount || 0),
      gstRate: gstPct,
      cgstAmount: parseFloat(cgst.toFixed(2)),
      sgstAmount: parseFloat(sgst.toFixed(2)),
      totalAmount: parseFloat(grandTotal.toFixed(2)),
      paymentMethod,
      paymentStatus,
      transactionRef: transactionRef || (paymentMethod === "UPI_QR" ? `UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}/Paytm` : `TXN-${Date.now()}`),
      insuranceTpa: insuranceTpa || "N/A",
      preAuthNumber: preAuthNumber || "",
      createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);
    res.json({ success: true, message: "Invoice created successfully", invoice: newInvoice });
  } catch (err) {
    console.error("[v3 Billing API] Create invoice error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/billing/generate-upi-qr
 * Generates UPI Deep Link URI for dynamic QR rendering
 */
router.get("/generate-upi-qr", (req, res) => {
  const { amount = "3675", accession = "ACC-882910", payee = "ipacx@hdfcbank", payeeName = "iPaCX Radiology & Diagnostic Center" } = req.query;
  const upiString = `upi://pay?pa=${encodeURIComponent(payee)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=RIS-${accession}&cu=INR`;
  
  res.json({
    success: true,
    amount,
    accession,
    upiString,
    supportedApps: ["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Cred"]
  });
});

module.exports = router;
