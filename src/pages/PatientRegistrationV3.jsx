// FILE: src/pages/PatientRegistrationV3.jsx
import React, { useState } from "react";
import { UserPlus, Calendar, FileText, CheckCircle2, Search, Activity } from "lucide-react";

const PatientRegistrationV3 = () => {
  const [patientData, setPatientData] = useState({
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    patientName: "",
    dob: "",
    gender: "M",
    phone: "",
    email: "",
    modality: "MR",
    studyDescription: "MRI BRAIN WITH CONTRAST",
    accessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
    referringPhysician: "Dr. A. K. Sharma, MD"
  });

  const [registeredList, setRegisteredList] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { ...patientData, registeredAt: new Date().toLocaleTimeString() };
    setRegisteredList([newEntry, ...registeredList]);
    setSuccessMsg(`✅ Patient ${patientData.patientName} (${patientData.mrn}) successfully registered & MWL scheduled!`);
    setTimeout(() => setSuccessMsg(""), 4000);

    // Reset form for next patient
    setPatientData({
      mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: "",
      dob: "",
      gender: "M",
      phone: "",
      email: "",
      modality: "CT",
      studyDescription: "CT CHEST HRCT",
      accessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      referringPhysician: "Dr. A. K. Sharma, MD"
    });
  };

  return (
    <div className="patient-reg-v3-container p-6 bg-slate-950 text-slate-100 min-h-screen">
      <header className="pb-6 border-b border-slate-800 mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <span className="p-2 rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
            <UserPlus size={24} />
          </span>
          EHR Patient Registration & DICOM MWL Scheduler
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Create Patient EHR records, generate Accession Numbers, and broadcast DICOM Modality Worklists</p>
      </header>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 glow-emerald">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText size={18} className="text-cyan-400" /> Patient Demographics & Exam Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Medical Record Number (MRN)</label>
                <input
                  type="text"
                  readOnly
                  value={patientData.mrn}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Accession Number (DICOM)</label>
                <input
                  type="text"
                  readOnly
                  value={patientData.accessionNumber}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-purple-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Patient Full Name (DICOM Format: LAST^FIRST)</label>
              <input
                type="text"
                required
                placeholder="e.g. KUMAR^RAMESH"
                value={patientData.patientName}
                onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={patientData.dob}
                  onChange={(e) => setPatientData({ ...patientData, dob: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Gender</label>
                <select
                  value={patientData.gender}
                  onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Modality</label>
                <select
                  value={patientData.modality}
                  onChange={(e) => setPatientData({ ...patientData, modality: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="MR">MRI (MR)</option>
                  <option value="CT">Computed Tomography (CT)</option>
                  <option value="CR">Digital Radiography (CR)</option>
                  <option value="US">Ultrasound (US)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Requested Examination Description</label>
              <input
                type="text"
                required
                value={patientData.studyDescription}
                onChange={(e) => setPatientData({ ...patientData, studyDescription: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <UserPlus size={16} /> Register & Schedule MWL
              </button>
            </div>
          </form>
        </div>

        {/* Registered Queue */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity size={18} className="text-cyan-400" /> Today's Scheduled MWL Queue ({registeredList.length})
          </h2>

          <div className="space-y-3 overflow-y-auto flex-1">
            {registeredList.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-12 font-medium">No patients scheduled in queue</div>
            ) : (
              registeredList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="font-extrabold text-white flex justify-between">
                    <span>{item.patientName}</span>
                    <span className="text-cyan-400 font-mono">{item.modality}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">MRN: {item.mrn} • Acc: {item.accessionNumber}</div>
                  <div className="text-[11px] text-slate-300 font-medium truncate">{item.studyDescription}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationV3;
