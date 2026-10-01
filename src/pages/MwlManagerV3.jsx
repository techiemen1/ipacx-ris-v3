// FILE: src/pages/MwlManagerV3.jsx
import React, { useState } from "react";
import { Activity, Server, Radio, FileCode, CheckCircle2, RefreshCw, Send, Search, Cpu } from "lucide-react";

const STATIONS = [
  { aeTitle: "US_ROOM_OBGYN_01", name: "Ultrasound Suite 1 (GE Voluson E10 OBGYN)", modality: "US", location: "1st Floor - Women's Imaging" },
  { aeTitle: "US_ROOM_TVS_02", name: "Ultrasound Suite 2 (Samsung Hera W10)", modality: "US", location: "1st Floor - Gynac Care" },
  { aeTitle: "CT_SCAN_SIEMENS_01", name: "CT Scanner (Siemens Somatom 128 Slice)", modality: "CT", location: "Ground Floor - Room 4" },
  { aeTitle: "MRI_GE_3T_MAIN", name: "MRI Scanner (GE SIGNA Architect 3.0T)", modality: "MR", location: "Ground Floor - MRI Bay" },
  { aeTitle: "XRAY_AGFA_CR_01", name: "Digital X-Ray (Agfa DX-D 300)", modality: "CR", location: "Ground Floor - X-Ray Room 1" }
];

const INITIAL_MWL = [
  {
    id: "MWL-1001",
    accessionNumber: "ACC-882910",
    patientName: "DESHMUKH^PRIYA",
    patientMrn: "MRN-48912",
    patientDob: "1994-06-15",
    patientGender: "F",
    modality: "US",
    scheduledStationAe: "US_ROOM_OBGYN_01",
    scheduledProcedureStepId: "SPS-OB-882910",
    procedureDescription: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",
    scheduledDate: "2026-09-28",
    scheduledTime: "11:30 AM",
    referringDoctor: "Dr. Sunita Rao, MD (OBGYN)",
    status: "SCHEDULED"
  },
  {
    id: "MWL-1002",
    accessionNumber: "ACC-551920",
    patientName: "KAPOOR^ANANYA",
    patientMrn: "MRN-19203",
    patientDob: "1998-11-20",
    patientGender: "F",
    modality: "US",
    scheduledStationAe: "US_ROOM_TVS_02",
    scheduledProcedureStepId: "SPS-GYN-551920",
    procedureDescription: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS",
    scheduledDate: "2026-09-28",
    scheduledTime: "12:00 PM",
    referringDoctor: "Dr. Meenakshi Sharma, DGO",
    status: "ARRIVED"
  }
];

const MwlManagerV3 = () => {
  const [mwlList, setMwlList] = useState(INITIAL_MWL);
  const [selectedTagItem, setSelectedTagItem] = useState(null);
  const [dispatchMsg, setDispatchMsg] = useState("");

  const handleReDispatch = (item) => {
    setDispatchMsg(`🚀 Re-broadcasting C-FIND SCP Worklist for ${item.patientName} to AE Title [${item.scheduledStationAe}]...`);
    setTimeout(() => setDispatchMsg(""), 4000);
  };

  return (
    <div className="mwl-manager-v3 p-3 md:p-4 bg-slate-950 text-slate-100 min-h-screen space-y-3 font-sans">
      {/* Ultra-Compact Header */}
      <header className="bg-slate-900/80 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30">
            <Radio size={16} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-white tracking-tight font-heading flex items-center gap-2">
              DICOM Modality Worklist (MWL) Station Dispatcher
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              DICOM 3.0 C-FIND SCP Compliance • Real-time Station AE Routing & DICOM Tags Inspector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1.5">
            <Server size={13} /> C-FIND SCP Active (Port 4243 / 8043)
          </span>
        </div>
      </header>

      {dispatchMsg && (
        <div className="p-2 px-3 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} /> {dispatchMsg}
        </div>
      )}

      {/* Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {STATIONS.map((st, i) => (
          <div key={i} className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                {st.modality}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-extrabold text-white text-xs truncate">{st.aeTitle}</div>
            <div className="text-[10px] text-slate-400 font-medium truncate">{st.name}</div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-purple-400" /> Scheduled Modality Worklist Items ({mwlList.length})
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">DICOM Standard 3.0 (PS 3.4)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Patient Name & MRN</th>
                <th className="py-3 px-4">Accession #</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Procedure Description</th>
                <th className="py-3 px-4">Station AE Title</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {mwlList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{item.patientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.patientMrn}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-400">{item.accessionNumber}</td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{item.modality}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium max-w-xs truncate">{item.procedureDescription}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 text-[11px] font-bold">{item.scheduledStationAe}</td>
                  <td className="py-3 px-4 text-slate-400">
                    <div>{item.scheduledTime}</div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === "ACQUIRING" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                      item.status === "ARRIVED" ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setMwlList(mwlList.map(m => m.id === item.id ? { ...m, status: m.status === "SCHEDULED" ? "ARRIVED" : m.status === "ARRIVED" ? "ACQUIRING" : "COMPLETED" } : m));
                        setDispatchMsg(`Technician status updated for ${item.patientName} -> ${item.status}`);
                        setTimeout(() => setDispatchMsg(""), 3000);
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/30 inline-flex items-center gap-1"
                    >
                      {item.status === "SCHEDULED" ? "Mark Arrived" : item.status === "ARRIVED" ? "Start Exam" : "Complete DICOM"}
                    </button>
                    <button
                      onClick={() => setSelectedTagItem(item)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-300 rounded-lg text-[11px] font-bold border border-purple-500/30 inline-flex items-center gap-1"
                    >
                      <FileCode size={12} /> View DICOM Tags
                    </button>
                    <button
                      onClick={() => handleReDispatch(item)}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-md shadow-purple-600/30"
                    >
                      <Send size={12} /> Dispatch C-FIND
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DICOM Tag Modal */}
      {selectedTagItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-2xl w-full space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode size={18} className="text-purple-400" /> DICOM 3.0 C-FIND Tag Inspector [{selectedTagItem.accessionNumber}]
              </h3>
              <button onClick={() => setSelectedTagItem(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] overflow-y-auto max-h-[350px]">
              <div className="text-slate-400 font-bold border-b border-slate-800/80 pb-1 mb-2">Tag ID | Name | VR | Value</div>
              <div className="text-purple-300">(0008,0050) [AccessionNumber] SH: "{selectedTagItem.accessionNumber}"</div>
              <div className="text-cyan-300">(0010,0010) [PatientName] PN: "{selectedTagItem.patientName}"</div>
              <div className="text-cyan-300">(0010,0020) [PatientID] LO: "{selectedTagItem.patientMrn}"</div>
              <div className="text-slate-300">(0010,0030) [PatientBirthDate] DA: "{selectedTagItem.patientDob.replace(/-/g, "")}"</div>
              <div className="text-slate-300">(0010,0040) [PatientSex] CS: "{selectedTagItem.patientGender}"</div>
              <div className="text-emerald-300">(0008,0060) [Modality] CS: "{selectedTagItem.modality}"</div>
              <div className="text-amber-300">(0040,0100) [ScheduledProcedureStepSequence] SQ:</div>
              <div className="pl-4 text-slate-400">└─ (0040,0001) [ScheduledStationAETitle] AE: "{selectedTagItem.scheduledStationAe}"</div>
              <div className="pl-4 text-slate-400">└─ (0040,0007) [ScheduledProcedureStepDescription] LO: "{selectedTagItem.procedureDescription}"</div>
              <div className="pl-4 text-slate-400">└─ (0040,0009) [ScheduledProcedureStepID] SH: "{selectedTagItem.scheduledProcedureStepId}"</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MwlManagerV3;
