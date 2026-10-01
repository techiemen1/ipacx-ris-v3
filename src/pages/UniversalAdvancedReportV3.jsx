// FILE: src/pages/UniversalAdvancedReportV3.jsx
import React, { useState } from "react";
import { Printer, Download, QrCode, ShieldCheck, CheckCircle2, HeartPulse, FileText, Activity, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const UniversalAdvancedReportV3 = () => {
  const [searchParams] = useSearchParams();
  const accessionParam = searchParams.get("accession") || "ACC-882910";

  const [reportData, setReportData] = useState({
    hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
    hospitalTagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Radiation Safety Certified",
    hospitalAddress: "Plot 104, Medical Center Avenue, Healthcare Hub, Maharashtra 400001",
    hospitalPhone: "+91 (022) 2891-0000 | report@ipacx-imaging.com",

    // Patient Info
    patientName: "DESHMUKH, PRIYA",
    mrn: "MRN-48912",
    accessionNumber: accessionParam,
    abhaNumber: "91-8842-1920-4491",
    age: "30 Years",
    gender: "Female",
    examDate: "2026-09-28 10:15 AM",
    modality: "ULTRASOUND (US)",
    referringDoctor: "Dr. Sunita Rao, MD (OBGYN)",
    procedureName: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",

    // Clinical Findings
    findingsText: `OBSTETRIC ULTRASOUND - ISUOG LEVEL II TARGETED ANOMALY SCAN:
Single live intrauterine fetus in cephalic presentation.

Fetal Biometry:
- BPD: 48.2 mm (20w 2d)
- HC: 178.5 mm (20w 3d)
- AC: 154.1 mm (20w 4d)
- FL: 32.4 mm (20w 2d)
Estimated Fetal Weight (Hadlock): 385g ± 50g.

Anatomical Survey (ISUOG 20-Point Check):
1. Fetal Brain: Ventricles, cavum septum pellucidum, cerebellum, and cisterna magna are within normal limits.
2. Fetal Face: Intact upper lip and profile visualized.
3. Fetal Spine: Intact throughout its length with regular skin cover.
4. Fetal Heart: 4-chamber view, left and right outflow tracts normal. Fetal HR: 146 bpm (Regular).
5. Fetal Abdomen: Stomach bubble visualized below diaphragm. Both kidneys & urinary bladder identified.
6. Fetal Limbs: All 4 long bones and hands/feet visualized normally.
7. Placenta: Anterior, Upper Segment, Grade I maturity. No retroplacental clot.
8. Liquor: Amniotic Fluid Index (AFI): 14.2 cm (Adequate). 3-vessel umbilical cord identified.`,

    impressionText: `IMPRESSION:
1. Single live intrauterine pregnancy of 20 weeks 3 days gestational age.
2. Normal targeted fetal anomaly scan (ISUOG Level II). No gross structural congenital anomaly detected.
3. Adequate liquor (AFI 14.2 cm) and normal anterior placenta.`,

    // Doctor & Signature
    reportedBy: "Dr. Alexander Smith, MD",
    qualifications: "MD (Radiodiagnosis), Fellowship in Fetal Medicine (UK)",
    nmcNumber: "NMC-MH-2012-08819",
    designation: "Consultant Radiologist & Imaging Specialist",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10 40 Q 50 10 90 40 T 170 30 T 190 50' stroke='%200284c7' stroke-width='3' fill='none'/><text x='20' y='50' font-family='serif' font-size='14' font-style='italic' fill='%200369a1'>Dr. A. Smith</text></svg>",
    qrVerificationUrl: `https://verify.ipacx.com/report/${accessionParam}?doctor=NMC-MH-2012-08819`
  });

  return (
    <div className="report-viewer-container bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
      {/* Top Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Worklist
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Printer size={16} /> Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* 📄 PUBLICATION-GRADE PRINTABLE REPORT SHEET */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-3xl shadow-2xl space-y-6 print:shadow-none print:p-0">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">{reportData.hospitalName}</h1>
            <p className="text-[11px] text-cyan-700 font-bold mt-0.5">{reportData.hospitalTagline}</p>
            <p className="text-[10px] text-slate-500 mt-1">{reportData.hospitalAddress} • {reportData.hospitalPhone}</p>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-extrabold tracking-wider uppercase font-mono">
              NABH & AERB VERIFIED
            </span>
            <span className="text-[9px] text-slate-400 font-mono">ABDM Health ID Integration</span>
          </div>
        </div>

        {/* Patient Demographics Table Box */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Patient Name</span>
            <strong className="text-slate-900 text-sm font-sans font-black">{reportData.patientName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">MRN / Patient ID</span>
            <strong className="text-purple-700">{reportData.mrn}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Accession Number</span>
            <strong className="text-cyan-700">{reportData.accessionNumber}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Age / Gender</span>
            <strong className="text-slate-800">{reportData.age} / {reportData.gender}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Exam Date & Time</span>
            <span className="text-slate-700">{reportData.examDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Modality</span>
            <strong className="text-emerald-700">{reportData.modality}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Referring Doctor</span>
            <span className="text-slate-800 font-sans font-semibold">{reportData.referringPhysician || reportData.referringDoctor}</span>
          </div>
        </div>

        {/* Exam Title */}
        <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs font-black uppercase text-center font-sans tracking-wide">
          {reportData.procedureName}
        </div>

        {/* Findings Body */}
        <div className="space-y-2 text-xs font-mono leading-relaxed text-slate-800 whitespace-pre-line border-b border-slate-200 pb-4">
          <div className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
            Radiological Findings
          </div>
          {reportData.findingsText}
        </div>

        {/* Impression Box */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-1.5 text-xs font-mono text-slate-900 whitespace-pre-line">
          <div className="font-sans font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            Diagnostic Impression & Conclusion
          </div>
          <div className="font-bold">{reportData.impressionText}</div>
        </div>

        {/* 🖼️ ATTACHED KEY DICOM IMAGES GRID ON REPORT SHEET */}
        {reportData.keyImages && reportData.keyImages.length > 0 && (
          <div className="pt-2 border-t border-slate-300 space-y-2">
            <div className="font-sans font-black text-xs text-slate-900 uppercase tracking-wider">
              Attached Key DICOM Images ({reportData.keyImages.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reportData.keyImages.map((img, idx) => (
                <div key={img.id || idx} className="border border-slate-300 rounded-lg p-2 bg-slate-50 flex flex-col items-center gap-1 text-center">
                  <div className="h-28 w-full bg-black rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={img.data_url || `/api/v3/pacs/instance-preview/inst_${img.series_uid}_${img.slice_number}`}
                      alt=""
                      className="h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-900 font-sans truncate max-w-full">{img.series_description || "DICOM Frame"}</div>
                  <div className="text-[9px] font-mono text-cyan-800">Slice {img.slice_number || 1}/{img.total_slices || 24}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Digital Signature & Verification Stamp Footer */}
        <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end">
          {/* Left: Dynamic Verification QR Code */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border-2 border-slate-900 rounded-xl shadow-sm">
              <QrCode size={56} className="text-slate-900" />
            </div>
            <div className="text-[9px] font-mono text-slate-600">
              <span className="font-bold block text-slate-900">VERIFIED RADIOLOGY REPORT</span>
              <span>Scan QR to verify report hash</span>
              <span className="block text-cyan-800">NMC Reg: {reportData.nmcNumber}</span>
            </div>
          </div>

          {/* Right: Doctor Signature Stamp */}
          <div className="text-right space-y-1">
            <div className="inline-block p-1">
              <img src={reportData.signatureUrl} alt="Doctor Digital Signature" className="max-h-12 ml-auto object-contain" />
            </div>
            <div className="font-sans">
              <div className="font-black text-sm text-slate-900">{reportData.reportedBy}</div>
              <div className="text-[11px] text-slate-600 font-semibold">{reportData.qualifications}</div>
              <div className="text-[10px] text-cyan-800 font-mono font-bold">NMC Registration No: {reportData.nmcNumber}</div>
              <div className="text-[10px] text-slate-500 italic">{reportData.designation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalAdvancedReportV3;
