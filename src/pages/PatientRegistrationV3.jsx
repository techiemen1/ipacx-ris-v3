// FILE: src/pages/PatientRegistrationV3.jsx
import React, { useState } from "react";
import { UserPlus, Calendar, FileText, CheckCircle2, Search, Activity, ShieldCheck, HeartPulse, Stethoscope, AlertTriangle, QrCode } from "lucide-react";

const OBGYN_PROCEDURES = [
  { code: "US-OB-01", name: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II", protocol: "ISUOG 20-Point Protocol", price: 3500 },
  { code: "US-OB-02", name: "NT SCAN (11-13+6 WEEKS) + NASAL BONE & DUCTUS VENOSUS", protocol: "FMF UK Standard", price: 2500 },
  { code: "US-GYN-03", name: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS", protocol: "IOTA Simple Rules", price: 2200 },
  { code: "US-GYN-04", name: "FOLLICULAR MONITORING SERIES (3 VISITS PACKAGE)", protocol: "ART / IVF Tracking", price: 3000 },
  { code: "US-OB-05", name: "OBSTETRIC COLOR DOPPLER & AMNIOTIC FLUID INDEX (AFI)", protocol: "Umbilical & MCA Doppler", price: 2800 },
  { code: "MR-BRAIN-01", name: "MRI BRAIN CONTRAST 3.0T + ANGIOGRAPHY", protocol: "Stroke/Epilepsy", price: 7500 },
  { code: "CT-CHEST-01", name: "HRCT CHEST (LOW DOSE RADIATION)", protocol: "AERB Bounded", price: 4200 },
  { code: "XR-CHEST-01", name: "CHEST PA VIEW DIGITAL RADIOGRAPHY", protocol: "Standard CR", price: 600 }
];

const SCHEMES = [
  { id: "CASH", name: "Self Pay (Cash / UPI / Card)" },
  { id: "PMJAY", name: "Ayushman Bharat (PM-JAY Scheme)" },
  { id: "CGHS", name: "Central Government Health Scheme (CGHS)" },
  { id: "ECHS", name: "Ex-Servicemen Contributory Health Scheme (ECHS)" },
  { id: "TPA", name: "Private Health Insurance / TPA Pre-Auth" }
];

const REFERRING_DOCTORS = [
  { name: "Dr. Sunita Rao, MD (OBGYN)", nmcNo: "NMC-MH-2012-08819", clinic: "Care Women's Clinic" },
  { name: "Dr. Meenakshi Sharma, DGO", nmcNo: "NMC-DL-2015-11203", clinic: "Apex Maternity Hospital" },
  { name: "Dr. A. K. Sharma, MD (Radiology)", nmcNo: "NMC-KA-2008-00912", clinic: "City Imaging Center" },
  { name: "Dr. Rajesh Gupta, MS (Surgery)", nmcNo: "NMC-UP-2010-44910", clinic: "Gupta Nursing Home" }
];

const PatientRegistrationV3 = () => {
  const [patientData, setPatientData] = useState({
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    abhaNumber: "91-8842-1920-4491",
    abhaAddress: "priya.deshmukh@abdm",
    patientName: "DESHMUKH^PRIYA",
    dob: "1994-06-15",
    gender: "F",
    phone: "+91 98201 44910",
    email: "priya.d@gmail.com",
    category: "OPD",
    scheme: "CASH",
    tpaName: "",
    preAuthNo: "",
    modality: "US",
    selectedProcedure: OBGYN_PROCEDURES[0],
    accessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
    referringPhysician: REFERRING_DOCTORS[0].name,
    scheduledStation: "US_ROOM_OBGYN_01",
    statEmergency: false
  });

  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [abhaVerified, setAbhaVerified] = useState(true);
  const [registeredList, setRegisteredList] = useState([
    {
      mrn: "MRN-48912",
      abhaNumber: "91-8842-1920-4491",
      patientName: "DESHMUKH^PRIYA",
      modality: "US",
      studyDescription: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",
      accessionNumber: "ACC-882910",
      registeredAt: "10:15 AM",
      scheme: "CASH",
      statEmergency: false
    },
    {
      mrn: "MRN-19203",
      abhaNumber: "91-1192-3301-8821",
      patientName: "KAPOOR^ANANYA",
      modality: "US",
      studyDescription: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS",
      accessionNumber: "ACC-551920",
      registeredAt: "09:45 AM",
      scheme: "TPA",
      statEmergency: true
    }
  ]);

  const [successMsg, setSuccessMsg] = useState("");

  const handleAbhaVerify = () => {
    setAbhaVerified(true);
    setShowAbhaModal(false);
    setSuccessMsg("✅ ABHA Health ID 91-8842-1920-4491 verified with NHA ABDM Registry!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = {
      mrn: patientData.mrn,
      abhaNumber: patientData.abhaNumber,
      patientName: patientData.patientName.toUpperCase(),
      modality: patientData.modality,
      studyDescription: patientData.selectedProcedure.name,
      accessionNumber: patientData.accessionNumber,
      registeredAt: new Date().toLocaleTimeString(),
      scheme: patientData.scheme,
      statEmergency: patientData.statEmergency
    };

    setRegisteredList([newEntry, ...registeredList]);
    setSuccessMsg(`✅ Patient ${patientData.patientName} registered! MWL dispatched to ${patientData.scheduledStation}`);
    setTimeout(() => setSuccessMsg(""), 4000);

    // Reset for next patient
    setPatientData({
      ...patientData,
      mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      accessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      patientName: "",
      statEmergency: false
    });
  };

  return (
    <div className="patient-reg-v3-container p-3 md:p-4 bg-slate-950 text-slate-100 min-h-screen space-y-3 font-sans">
      {/* Ultra-Compact Header */}
      <header className="bg-slate-900/80 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
            <UserPlus size={16} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-white tracking-tight font-heading flex items-center gap-2">
              EHR Patient Registration & ABDM ABHA Portal
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              NABH & ABDM M1/M2 Compliant • Gynecology, Obstetrics & Standard Radiology Worklists
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAbhaModal(true)}
          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>{abhaVerified ? "ABHA Verified (91-8842...)" : "Verify ABHA Health ID"}</span>
        </button>
      </header>

      {successMsg && (
        <div className="p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Form */}
        <div className="lg:col-span-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3 backdrop-blur-xl">
          <h2 className="text-xs font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <FileText size={15} className="text-cyan-400" /> Patient Demographics, Scheme & Exam Request
            </span>
            <span className="text-[10px] font-mono text-slate-400">ABDM Registry v2.0</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {/* ABHA & MRN Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">ABHA Health ID (14-Digit)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patientData.abhaNumber}
                    onChange={(e) => setPatientData({ ...patientData, abhaNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Medical Record No. (MRN)</label>
                <input
                  type="text"
                  readOnly
                  value={patientData.mrn}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-purple-400 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Accession Number (DICOM)</label>
                <input
                  type="text"
                  readOnly
                  value={patientData.accessionNumber}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Patient Full Name (LAST^FIRST DICOM Format)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DESHMUKH^PRIYA"
                  value={patientData.patientName}
                  onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Date of Birth & Gender</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={patientData.dob}
                    onChange={(e) => setPatientData({ ...patientData, dob: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2.5 text-white focus:outline-none"
                  />
                  <select
                    value={patientData.gender}
                    onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2.5 text-white font-bold"
                  >
                    <option value="F">F</option>
                    <option value="M">M</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Procedure Protocol Selection (Gynecology Highlight) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <HeartPulse size={14} /> Diagnostic Exam & Protocol Selection (Gynecology & Radiology)
                </label>
                <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  ISUOG & FMF Certified Protocols
                </span>
              </div>

              <select
                value={patientData.selectedProcedure.code}
                onChange={(e) => {
                  const proc = OBGYN_PROCEDURES.find(p => p.code === e.target.value) || OBGYN_PROCEDURES[0];
                  setPatientData({
                    ...patientData,
                    selectedProcedure: proc,
                    modality: proc.code.substring(0, 2) === "US" ? "US" : proc.code.substring(0, 2)
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
              >
                {OBGYN_PROCEDURES.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.name} — ₹{p.price} ({p.protocol})
                  </option>
                ))}
              </select>

              <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 pt-1">
                <span>Selected Protocol: <strong className="text-white">{patientData.selectedProcedure.protocol}</strong></span>
                <span>Base Rate: <strong className="text-emerald-400">₹{patientData.selectedProcedure.price}</strong></span>
              </div>
            </div>

            {/* Scheme & Referrer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Payment Scheme / Sponsorship</label>
                <select
                  value={patientData.scheme}
                  onChange={(e) => setPatientData({ ...patientData, scheme: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                >
                  {SCHEMES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Referring Physician (NMC Verified)</label>
                <select
                  value={patientData.referringPhysician}
                  onChange={(e) => setPatientData({ ...patientData, referringPhysician: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                >
                  {REFERRING_DOCTORS.map((d, i) => (
                    <option key={i} value={d.name}>{d.name} — {d.clinic}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Emergency STAT Toggle & Submit */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={patientData.statEmergency}
                  onChange={(e) => setPatientData({ ...patientData, statEmergency: e.target.checked })}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle size={14} /> Flag as Emergency STAT Priority
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <UserPlus size={16} /> Register Patient & Dispatch MWL
              </button>
            </div>
          </form>
        </div>

        {/* Live Queue */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" /> Today's Scheduled MWL Queue ({registeredList.length})
              </span>
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {registeredList.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl bg-slate-900/80 border text-xs space-y-2 ${item.statEmergency ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800'}`}>
                  <div className="font-extrabold text-white flex justify-between items-center">
                    <span>{item.patientName}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">{item.modality}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                    <span>MRN: {item.mrn}</span>
                    <span>Acc: {item.accessionNumber}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium">{item.studyDescription}</div>

                  <div className="pt-2 border-t border-slate-800/60 flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>ABHA: {item.abhaNumber}</span>
                    <span className="text-emerald-400">Scheme: {item.scheme}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ABHA Verification Modal */}
      {showAbhaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-cyan-400" /> NHA ABDM ABHA Verification
            </h3>
            <p className="text-xs text-slate-400">Verify 14-digit ABHA ID or Scan Patient Ayushman Health Card QR</p>

            <div className="space-y-3">
              <input
                type="text"
                defaultValue="91-8842-1920-4491"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-cyan-300 font-mono text-xs font-bold"
              />
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
                <QrCode size={48} className="mx-auto text-cyan-400" />
                <span className="text-[11px] text-slate-400 block">ABDM Patient QR Scanner Active</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowAbhaModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAbhaVerify}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30"
              >
                Verify & Associate ABHA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistrationV3;
