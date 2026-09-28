// FILE: src/pages/DoctorDashboardV3.jsx
import React, { useState, useEffect } from "react";
import { 
  FileText, 
  FileCheck,
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
  X,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import DiagnosticWorkstationV3 from "../components/DoctorWorkstation/DiagnosticWorkstationV3";

const DoctorDashboardV3 = () => {
  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [statusTab, setStatusTab] = useState("ALL");
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

  const filteredStudies = studies.filter((study) => {
    const matchesSearch = 
      study.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.study_description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = modalityFilter === "ALL" || study.modality === modalityFilter;
    
    const matchesStatus = 
      statusTab === "ALL" ? true :
      statusTab === "STAT" ? study.is_stat :
      study.status === statusTab;

    return matchesSearch && matchesModality && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      
      {/* 🌟 TELEMETRY KPI CARDS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight font-heading">
              Diagnostic Radiology Triage Studio (v3.0)
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Enterprise Radiology Information System • Real-Time AI Worklist Orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pacs-nodes"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all"
          >
            <Database size={15} /> PACS Nodes & C-MOVE Fetch
          </Link>
          <button 
            onClick={fetchStudies}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Worklist"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI METRICS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Studies Today</div>
          <div className="text-2xl font-black text-white font-heading mt-1">{telemetry.totalToday}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Clock size={12} /> Pending Unreported
          </div>
          <div className="text-2xl font-black text-amber-400 font-heading mt-1">{telemetry.pendingUnreported}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-red-500/30 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1">
            <Zap size={12} /> STAT Emergencies
          </div>
          <div className="text-2xl font-black text-red-400 font-heading mt-1">{telemetry.statEmergency}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Finalized Reports
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading mt-1">{telemetry.finalizedCount}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Avg Turnaround Time</div>
          <div className="text-2xl font-black text-cyan-400 font-heading mt-1">{telemetry.avgTurnaroundMin} <span className="text-xs font-normal text-slate-400">mins</span></div>
        </div>
      </div>

      {/* 🔍 WORKLIST FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "ALL", label: "All Worklist" },
            { id: "STAT", label: "🚨 STAT Emergency", count: telemetry.statEmergency },
            { id: "UNREPORTED", label: "Unreported", count: telemetry.pendingUnreported },
            { id: "DRAFT", label: "Drafts" },
            { id: "FINALIZED", label: "Finalized" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusTab === tab.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono font-black">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search Patient, MRN, Exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 pl-9 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["ALL", "MR", "CT", "CR", "US"].map((mod) => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  modalityFilter === mod ? "bg-slate-800 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 REFINED WORKLIST TABLE */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-4">Triage Priority</th>
              <th className="px-5 py-4">Patient Information</th>
              <th className="px-5 py-4">Modality</th>
              <th className="px-5 py-4">Examination Description</th>
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
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-max">
                      <Zap size={12} /> STAT Emergency
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-semibold border border-slate-700/60">
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

                {/* UNIFORM REFINED ACTION BUTTONS */}
                <td className="px-5 py-4 text-right space-x-1.5">
                  <button
                    onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                    className="px-2.5 py-1.5 bg-cyan-900/30 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-extrabold inline-flex items-center gap-1 transition-all cursor-pointer"
                    title="Open DICOM Viewer in RIS"
                  >
                    <Eye size={13} /> DICOM
                  </button>

                  <button
                    onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-extrabold inline-flex items-center gap-1 transition-all cursor-pointer"
                    title="Open 50:50 Side-by-Side Report Studio"
                  >
                    <FileText size={13} /> Report (50:50)
                  </button>

                  <a
                    href={`/advanced-report?accession=ACC-882910`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-xl text-xs font-extrabold inline-flex items-center gap-1 transition-all"
                  >
                    <FileCheck size={13} /> Print Report
                  </a>

                  <a
                    href={`/v3/lite?study=${study.study_uid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all"
                  >
                    <Smartphone size={13} /> Mobile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 50:50 SIDE-BY-SIDE DIAGNOSTIC WORKSTATION MODAL */}
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
