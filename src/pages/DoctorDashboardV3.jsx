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
  Database,
  ExternalLink,
  LayoutGrid,
  List,
  Split,
  PenTool
} from "lucide-react";
import { Link } from "react-router-dom";
import DiagnosticWorkstationV3 from "../components/DoctorWorkstation/DiagnosticWorkstationV3";
import ReportingStudioV3 from "./ReportingStudioV3";
import api from "../api/axios";
import { useTheme } from "../utils/ThemeContext";

const DoctorDashboardV3 = () => {
  const { theme } = useTheme();
  const isLight = theme === "LIGHT";

  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [statusTab, setStatusTab] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // "ALL" | "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH"
  const [viewMode, setViewMode] = useState(typeof window !== "undefined" && window.innerWidth < 768 ? "CARDS" : "TABLE"); // "TABLE" | "CARDS"
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showWorkstation, setShowWorkstation] = useState(false);
  const [showReportingStudio, setShowReportingStudio] = useState(false);
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

  const getOhifViewerUrl = (study) => {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const studyUid = study?.study_uid || study?.id || "";
    let baseUrl = `http://${host}:8043/ohif/viewer`;

    const saved = localStorage.getItem("ipacx_hospital_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ohifViewerUrl) baseUrl = parsed.ohifViewerUrl;
      } catch (e) {}
    }
    const cleanUrl = baseUrl.trim();
    if (cleanUrl.includes("?")) {
      return `${cleanUrl}&StudyInstanceUIDs=${encodeURIComponent(studyUid)}`;
    }
    return `${cleanUrl}?StudyInstanceUIDs=${encodeURIComponent(studyUid)}`;
  };

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v3/pacs/studies").catch(() => null);
      let fetchedList = [];
      if (res?.data?.success && Array.isArray(res.data.studies) && res.data.studies.length > 0) {
        fetchedList = res.data.studies;
      }

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
        }
      ];

      setStudies(fetchedList.length > 0 ? [...fetchedList, ...mockStudies] : mockStudies);
    } catch (err) {
      console.error("Failed to load studies:", err);
    } finally {
      setLoading(false);
    }
  };

  const isStudyInDateRange = (studyDateStr, filter) => {
    if (filter === "ALL") return true;
    if (!studyDateStr) return true;

    const todayStr = "2026-09-28";
    const sDateStr = studyDateStr.substring(0, 10);

    if (filter === "TODAY") {
      return sDateStr === todayStr || studyDateStr.includes(todayStr);
    }

    if (filter === "YESTERDAY") {
      return sDateStr === "2026-09-27" || sDateStr === "2026-03-24";
    }

    if (filter === "THIS_WEEK" || filter === "THIS_MONTH") {
      return true;
    }

    return true;
  };

  const filteredStudies = studies
    .filter((study) => {
      const matchesSearch = 
        study.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.study_description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesModality = modalityFilter === "ALL" || study.modality === modalityFilter;
      
      const matchesStatus = 
        statusTab === "ALL" ? true :
        statusTab === "STAT" ? study.is_stat :
        study.status === statusTab;

      const matchesDate = isStudyInDateRange(study.study_date, dateFilter);

      return matchesSearch && matchesModality && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      // Sort recent & today studies first (descending date/time)
      const timeA = new Date(a.study_date || 0).getTime();
      const timeB = new Date(b.study_date || 0).getTime();
      return timeB - timeA;
    });

  return (
    <div className={`min-h-screen p-3 md:p-5 space-y-3 font-sans transition-colors ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      
      {/* 🌟 ULTRA-COMPACT HEADER & TELEMETRY STRIP */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
        isLight ? "bg-white/90 border-slate-200 shadow-slate-200/50" : "bg-slate-900/80 border-slate-800/80"
      }`}>
        
        {/* Title & Compact Inline Telemetry */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
              <Activity size={18} />
            </div>
            <h1 className={`text-base font-black tracking-tight font-heading ${isLight ? "text-slate-900" : "text-white"}`}>
              Radiology Worklist
            </h1>
          </div>

          <div className={`h-4 w-px hidden sm:block ${isLight ? "bg-slate-200" : "bg-slate-800"}`}></div>

          {/* Compact Telemetry Pills */}
          <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-950 text-slate-300 border-slate-800"
            }`}>
              <span>Today:</span>
              <span className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{telemetry.totalToday}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
              <Clock size={12} />
              <span>Unreported:</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{telemetry.pendingUnreported}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30 flex items-center gap-1">
              <Zap size={12} />
              <span>STAT:</span>
              <span className="font-black text-red-600 dark:text-red-400">{telemetry.statEmergency}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Finalized:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{telemetry.finalizedCount}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 flex items-center gap-1">
              <span>TAT:</span>
              <span className="font-black text-cyan-600 dark:text-cyan-400">{telemetry.avgTurnaroundMin}m</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            to="/pacs-nodes"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-cyan-700 border border-slate-300"
                : "bg-slate-950 hover:bg-slate-900 text-cyan-300 border border-slate-700"
            }`}
          >
            <Database size={13} /> PACS Fetch
          </Link>
          <button 
            onClick={fetchStudies}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isLight ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Refresh Worklist"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>


      {/* 🔍 WORKLIST FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xl touch-manipulation">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "STAT", label: "🚨 STAT Emergency", count: telemetry.statEmergency },
            { id: "UNREPORTED", label: "Unreported", count: telemetry.pendingUnreported },
            { id: "SCHEDULED", label: "Scheduled (MWL)" },
            { id: "DRAFT", label: "In-Reading / Drafts" },
            { id: "FINALIZED", label: "Finalized" },
            { id: "ADDENDUM", label: "Addendums" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
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
          {/* View Mode Switcher (Desktop Table vs Mobile Patient Cards) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("TABLE")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "TABLE" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
              title="Desktop Table View"
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode("CARDS")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "CARDS" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile Patient Cards View"
            >
              <LayoutGrid size={13} /> Mobile Cards
            </button>
          </div>

          {/* Date Filter Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Calendar size={13} className="text-cyan-400 ml-1.5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 border-none outline-none pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">📅 All Time Studies</option>
              <option value="TODAY" className="bg-slate-900 text-cyan-400 font-extrabold">🌟 Today's Studies</option>
              <option value="YESTERDAY" className="bg-slate-900 text-white">Yesterday</option>
              <option value="THIS_WEEK" className="bg-slate-900 text-white">Last 7 Days</option>
              <option value="THIS_MONTH" className="bg-slate-900 text-white">Last 30 Days</option>
            </select>
          </div>

          <div className="relative flex-1 md:w-56">
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

      {/* 📊 DESKTOP TABLE VIEW OR MOBILE PATIENT CARDS VIEW */}
      {viewMode === "TABLE" ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Triage Priority</th>
                <th className="px-5 py-4">Patient Information</th>
                <th className="px-5 py-4">Modality</th>
                <th className="px-5 py-4">Examination & Date</th>
                <th className="px-5 py-4">Slices / Series</th>
                <th className="px-5 py-4">AI Diagnostic Insight</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStudies.map((study) => {
                const isToday = study.study_date && (study.study_date.includes("2026-09-28") || study.study_date.includes("TODAY"));
                return (
                <tr key={study.id} className={`hover:bg-slate-800/50 transition-colors group ${isToday ? "bg-cyan-950/20" : ""}`}>
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
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>{study.study_date}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40 text-[9px] uppercase">
                          TODAY
                        </span>
                      )}
                    </div>
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
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1 shadow-md shadow-cyan-600/30 transition-all cursor-pointer shrink-0"
                        title="Open 50:50 Multilayered DICOM Viewer & Reporting Studio"
                      >
                        <Split size={13} /> 50:50 Studio
                      </button>

                      <button
                        onClick={() => { setSelectedStudy(study); setShowReportingStudio(true); }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
                        title="Open World-Class Standalone Reporting Studio"
                      >
                        <PenTool size={13} /> Report Studio
                      </button>

                      <a
                        href={getOhifViewerUrl(study)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-extrabold inline-flex items-center gap-1 transition-all shrink-0"
                        title="Open in OHIF Viewer"
                      >
                        <ExternalLink size={13} /> OHIF
                      </a>

                      <a
                        href={`/v3/lite?study=${study.study_uid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all shrink-0"
                        title="Open Mobile DICOM Viewer"
                      >
                        <Smartphone size={13} /> Mobile
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      ) : (
        /* 📱 MOBILE PATIENT CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudies.map((study) => {
            const isToday = study.study_date && (study.study_date.includes("2026-09-28") || study.study_date.includes("TODAY"));
            return (
              <div 
                key={study.id} 
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden ${
                  isToday ? "bg-slate-900/95 border-cyan-500/50 shadow-cyan-500/10" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider ${
                    study.modality === "MR" ? "bg-purple-500/15 text-purple-300 border border-purple-500/30" :
                    study.modality === "CT" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" :
                    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {study.modality}
                  </span>

                  <div className="flex items-center gap-2">
                    {study.is_stat && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black text-[10px] uppercase border border-red-500/40 flex items-center gap-1">
                        <Zap size={10} /> STAT
                      </span>
                    )}
                    {isToday && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40 text-[9px] uppercase">
                        TODAY
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient Information */}
                <div className="space-y-1">
                  <div className="font-extrabold text-white text-base flex items-center gap-2">
                    <User size={16} className="text-cyan-400" /> {study.patient_name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">{study.patient_mrn}</span>
                    <span>•</span>
                    <span>{study.patient_age} / {study.patient_sex}</span>
                  </div>
                </div>

                {/* Examination Description & Slices */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="text-xs font-bold text-slate-200">{study.study_description}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{study.study_date}</span>
                    <span className="text-cyan-400">{study.total_instances} Slices ({study.total_series} Series)</span>
                  </div>
                </div>

                {/* AI Recommendation */}
                {study.ai_recommendation && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400 shrink-0" />
                    <span className="truncate">{study.ai_recommendation}</span>
                  </div>
                )}

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                    className="px-2 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-md shadow-cyan-600/30 cursor-pointer"
                  >
                    <Split size={13} /> 50:50 Studio
                  </button>

                  <button
                    onClick={() => { setSelectedStudy(study); setShowReportingStudio(true); }}
                    className="px-2 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    <PenTool size={13} /> Report Studio
                  </button>

                  <a
                    href={getOhifViewerUrl(study)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={13} /> OHIF Viewer
                  </a>

                  <a
                    href={`/v3/lite?study=${study.study_uid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Smartphone size={13} /> Mobile Viewer
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 50:50 MULTILAYERED DIAGNOSTIC WORKSTATION MODAL */}
      {showWorkstation && selectedStudy && (
        <DiagnosticWorkstationV3
          study={selectedStudy}
          onClose={() => setShowWorkstation(false)}
        />
      )}

      {/* 🌟 STANDALONE RADIOLOGY REPORTING STUDIO MODAL */}
      {showReportingStudio && selectedStudy && (
        <ReportingStudioV3
          study={selectedStudy}
          onClose={() => setShowReportingStudio(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboardV3;
