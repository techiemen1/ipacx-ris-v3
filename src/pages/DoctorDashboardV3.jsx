// FILE: src/pages/DoctorDashboardV3.jsx
import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Smartphone, 
  Calendar, 
  User, 
  Activity, 
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Info,
  RefreshCw,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";
import DiagnosticWorkstationV3 from "../components/DoctorWorkstation/DiagnosticWorkstationV3";

const DoctorDashboardV3 = () => {
  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [statusTab, setStatusTab] = useState("ALL"); // ALL | STAT | UNREPORTED | DRAFT | FINALIZED
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showWorkstation, setShowWorkstation] = useState(false);
  const [inspectStudy, setInspectStudy] = useState(null);
  const [loading, setLoading] = useState(false);

  const [telemetry, setTelemetry] = useState({
    totalToday: 48,
    pendingUnreported: 12,
    statEmergency: 3,
    finalizedCount: 33,
    avgTurnaroundMin: 14
  });

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const mockStudies = [
        {
          id: "std_101",
          study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.1001",
          patient_mrn: "MRN-99812",
          patient_name: "CHANDRASEKHAR^V",
          patient_age: "48Y",
          patient_sex: "M",
          modality: "MR",
          study_description: "MRI BRAIN WITH CONTRAST (NEURO PROTOCOL)",
          study_date: "2026-09-28 08:30",
          total_series: 6,
          total_instances: 184,
          is_stat: true,
          status: "UNREPORTED",
          ai_recommendation: "Critical Alert: Subtle T2/FLAIR Hyperintensity detected"
        },
        {
          id: "std_102",
          study_uid: "1.2.840.113619.2.55.3.283115102.20260928.2002",
          patient_mrn: "MRN-88102",
          patient_name: "LAKSHMI^ANAND",
          patient_age: "35Y",
          patient_sex: "F",
          modality: "CT",
          study_description: "CT CHEST HIGH RESOLUTION (HRCT PULMONARY)",
          study_date: "2026-09-28 09:15",
          total_series: 4,
          total_instances: 240,
          is_stat: false,
          status: "DRAFT",
          ai_recommendation: "Bilateral ground-glass opacities identified"
        },
        {
          id: "std_103",
          study_uid: "1.2.392.200036.9125.2.2.20260928.3003",
          patient_mrn: "MRN-77192",
          patient_name: "RAMESH^KUMAR",
          patient_age: "62Y",
          patient_sex: "M",
          modality: "CR",
          study_description: "CHEST PA VIEW (POST-OPERATIVE)",
          study_date: "2026-09-28 07:45",
          total_series: 1,
          total_instances: 1,
          is_stat: false,
          status: "FINALIZED",
          ai_recommendation: "Unremarkable chest radiograph"
        },
        {
          id: "std_104",
          study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.4004",
          patient_mrn: "MRN-66104",
          patient_name: "PRIYA^SHARMA",
          patient_age: "29Y",
          patient_sex: "F",
          modality: "US",
          study_description: "ULTRASOUND ABDOMEN & PELVIS COMPLETE",
          study_date: "2026-09-28 09:40",
          total_series: 2,
          total_instances: 42,
          is_stat: true,
          status: "UNREPORTED",
          ai_recommendation: "STAT: Acute cholecystitis signs"
        }
      ];
      setStudies(mockStudies);
    } catch (err) {
      console.error("Failed to load studies:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudies = studies.filter(s => {
    const matchesSearch = 
      s.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.study_description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = modalityFilter === "ALL" || s.modality === modalityFilter;
    
    let matchesStatus = true;
    if (statusTab === "STAT") matchesStatus = s.is_stat;
    else if (statusTab !== "ALL") matchesStatus = s.status === statusTab;

    return matchesSearch && matchesModality && matchesStatus;
  });

  return (
    <div className="doctor-v3-container p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* 🌟 TELEMETRY DASHBOARD BANNER */}
      <header className="mb-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30">
                <Activity size={24} />
              </span>
              Diagnostic Radiology Triage Studio (v3.0)
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">Enterprise Radiology Information System • Real-Time AI Worklist Orchestration</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStudies} 
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all"
              title="Refresh Worklist"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-cyan-400" : ""} />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300">Dr. Radiologist (On Duty)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="glass-panel-interactive p-4 rounded-xl">
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Studies Today</div>
            <div className="text-2xl font-black text-white mt-1">{telemetry.totalToday}</div>
          </div>

          <div className="glass-panel-interactive p-4 rounded-xl border-amber-500/20">
            <div className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1">
              <Clock size={12} /> Pending Unreported
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{telemetry.pendingUnreported}</div>
          </div>

          <div className="glass-panel-interactive p-4 rounded-xl border-red-500/30 glow-red">
            <div className="text-xs text-red-400 font-bold uppercase flex items-center gap-1">
              <Zap size={12} className="animate-bounce" /> STAT Emergencies
            </div>
            <div className="text-2xl font-black text-red-400 mt-1">{telemetry.statEmergency}</div>
          </div>

          <div className="glass-panel-interactive p-4 rounded-xl border-emerald-500/20">
            <div className="text-xs text-emerald-400 font-semibold uppercase flex items-center gap-1">
              <CheckCircle2 size={12} /> Finalized Reports
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{telemetry.finalizedCount}</div>
          </div>

          <div className="glass-panel-interactive p-4 rounded-xl">
            <div className="text-xs text-cyan-400 font-semibold uppercase">Avg Turnaround Time</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{telemetry.avgTurnaroundMin} <span className="text-xs font-normal">mins</span></div>
          </div>
        </div>
      </header>

      {/* 🎛️ MULTI-TAB TRIAGE FILTER BAR */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        {/* Status Tabs */}
        <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: "ALL", label: "All Worklist" },
            { id: "STAT", label: "🚨 STAT Emergency", badge: telemetry.statEmergency, color: "text-red-400" },
            { id: "UNREPORTED", label: "Unreported", badge: telemetry.pendingUnreported },
            { id: "DRAFT", label: "Drafts" },
            { id: "FINALIZED", label: "Finalized" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === tab.id
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className={tab.color || ""}>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Modality Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 w-72">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search Patient, MRN, Exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {["ALL", "MR", "CT", "CR", "US"].map((mod) => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  modalityFilter === mod ? "bg-slate-800 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 HIGH-TECH WORKLIST TABLE */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-4">Triage Priority</th>
              <th className="px-5 py-4">Patient Information</th>
              <th className="px-5 py-4">Modality</th>
              <th className="px-5 py-4">Study / Examination Description</th>
              <th className="px-5 py-4">Slices / Series</th>
              <th className="px-5 py-4">AI Diagnostic Insight</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredStudies.map((study) => (
              <tr key={study.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-5 py-4">
                  {study.is_stat ? (
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-max glow-red animate-pulse">
                      <Zap size={12} /> STAT Emergency
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                      ROUTINE
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="font-extrabold text-white text-sm flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                    <User size={14} className="text-cyan-400" /> {study.patient_name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {study.patient_mrn} • {study.patient_age} / {study.patient_sex}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider ${
                    study.modality === "MR" ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                    study.modality === "CT" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" :
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {study.modality}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="font-bold text-slate-200 text-xs">{study.study_description}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{study.study_date}</div>
                </td>

                <td className="px-5 py-4 font-mono text-slate-400 text-xs">
                  {study.total_instances} Slices ({study.total_series} Series)
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 max-w-xs truncate">
                    <Sparkles size={14} className="text-purple-400 shrink-0" />
                    <span className="truncate">{study.ai_recommendation}</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-max ${
                    study.status === "FINALIZED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                    study.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                    "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {study.status === "FINALIZED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {study.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right space-x-2">
                  <button
                    onClick={() => setInspectStudy(study)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Quick DICOM Tag Inspect"
                  >
                    <Info size={16} />
                  </button>

                  <button
                    onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <FileText size={14} /> Report Studio
                  </button>

                  <a
                    href={`/v3/lite?study=${study.study_uid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-800"
                  >
                    <Smartphone size={14} /> Mobile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔍 DICOM TAG INSPECTION DRAWER MODAL */}
      {inspectStudy && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-950 border-l border-slate-800 w-full max-w-lg p-6 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info size={18} className="text-cyan-400" /> DICOM Metadata Inspector
              </h3>
              <button onClick={() => setInspectStudy(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono overflow-y-auto flex-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p><span className="text-slate-500">Patient Name:</span> <span className="text-white font-bold">{inspectStudy.patient_name}</span></p>
                <p><span className="text-slate-500">MRN:</span> {inspectStudy.patient_mrn}</p>
                <p><span className="text-slate-500">Age / Gender:</span> {inspectStudy.patient_age} / {inspectStudy.patient_sex}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p><span className="text-slate-500">StudyInstanceUID:</span></p>
                <p className="text-cyan-400 break-all">{inspectStudy.study_uid}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p><span className="text-slate-500">Modality:</span> {inspectStudy.modality}</p>
                <p><span className="text-slate-500">Exam:</span> {inspectStudy.study_description}</p>
                <p><span className="text-slate-500">Instances Count:</span> {inspectStudy.total_instances}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏥 DIAGNOSTIC WORKSTATION STUDIO */}
      {showWorkstation && selectedStudy && (
        <DiagnosticWorkstationV3
          study={selectedStudy}
          onClose={() => setShowWorkstation(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboardV3;
