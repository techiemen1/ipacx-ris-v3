// FILE: src/pages/EnterpriseUnifiedRisStudioV3.jsx
import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Calendar, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Split, 
  PenTool, 
  BarChart3, 
  Database, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  UserPlus,
  Plus, 
  Phone, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Printer, 
  Share2, 
  SlidersHorizontal, 
  Cpu, 
  ExternalLink, 
  Smartphone,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  PieChart,
  DollarSign,
  Radio,
  FileCheck,
  ClipboardList,
  Flame,
  Info,
  Microscope,
  Stethoscope,
  HeartPulse,
  Eye,
  RefreshCw,
  LayoutGrid,
  CreditCard
} from "lucide-react";
import { useTheme } from "../utils/ThemeContext";
import DiagnosticWorkstationV3 from "../components/DoctorWorkstation/DiagnosticWorkstationV3";
import ReportingStudioV3 from "./ReportingStudioV3";
import api from "../api/axios";

// 🌟 MOCK PATIENT DATASET WITH AI TRIAGE RISK & CLINICAL HISTORY
const INITIAL_STUDIES = [
  {
    id: "STU-001",
    patient_id: "PAT-8801",
    patient_name: "Eleanor Vance",
    patient_mrn: "MRN-994102",
    patient_age: "58Y",
    patient_sex: "F",
    dob: "1968-04-12",
    phone: "+1 (555) 382-9910",
    insurance: "Blue Cross Blue Shield",
    pre_auth_status: "APPROVED",
    study_description: "CT BRAIN WITHOUT CONTRAST (STROKE PROTOCOL)",
    modality: "CT",
    body_part: "BRAIN",
    study_date: "2026-10-01 08:30",
    referring_physician: "Dr. Marcus Vance (Neurology)",
    status: "UNREPORTED",
    is_stat: true,
    ai_risk_score: 94,
    ai_triaged: true,
    ai_recommendation: "CRITICAL: Right Middle Cerebral Artery Hyperdensity (Acute MCA Stroke Sign)",
    total_series: 4,
    total_instances: 248,
    study_uid: "1.2.840.113619.2.55.3.28311512.9901",
    allergies: ["Iodinated Contrast (Mild Hive Reaction)", "Penicillin"],
    egfr_level: "78 mL/min/1.73m² (Normal)",
    vital_signs: "BP: 154/92 mmHg | HR: 88 bpm | SpO2: 98%",
    scheduled_time: "08:15 AM",
    arrival_status: "IN_EXAM",
    tech_notes: "Patient transported via stretcher. IV 18G left antecubital vein patent.",
    prior_studies: [
      { date: "2025-11-14", modality: "MRI", desc: "MRI BRAIN W/WO CONTRAST", result: "Mild age-related white matter ischemic changes." }
    ]
  },
  {
    id: "STU-002",
    patient_id: "PAT-8802",
    patient_name: "Robert Sterling",
    patient_mrn: "MRN-331049",
    patient_age: "42Y",
    patient_sex: "M",
    dob: "1984-09-22",
    phone: "+1 (555) 721-4401",
    insurance: "Aetna Choice POS II",
    pre_auth_status: "APPROVED",
    study_description: "MRI KNEE RIGHT W/O CONTRAST",
    modality: "MR",
    body_part: "KNEE",
    study_date: "2026-10-01 09:15",
    referring_physician: "Dr. Sarah Jenkins (Orthopedics)",
    status: "DRAFT",
    is_stat: false,
    ai_risk_score: 28,
    ai_triaged: false,
    ai_recommendation: "Medial Meniscal Posterior Horn Grade II Signal Change",
    total_series: 6,
    total_instances: 180,
    study_uid: "1.2.840.113619.2.55.3.28311512.9902",
    allergies: ["NKDA (No Known Drug Allergies)"],
    egfr_level: "92 mL/min/1.73m²",
    vital_signs: "BP: 122/78 mmHg | HR: 68 bpm | SpO2: 99%",
    scheduled_time: "09:00 AM",
    arrival_status: "COMPLETED",
    tech_notes: "Screening cleared for MRI. No cardiac pacemaker or metallic implants.",
    prior_studies: []
  },
  {
    id: "STU-003",
    patient_id: "PAT-8803",
    patient_name: "Sophia Martinez",
    patient_mrn: "MRN-774120",
    patient_age: "31Y",
    patient_sex: "F",
    dob: "1995-02-18",
    phone: "+1 (555) 902-1133",
    insurance: "UnitedHealthcare Choice",
    pre_auth_status: "APPROVED",
    study_description: "OBSTETRIC ULTRASOUND TARGETED ANOMALY (20 WEEKS)",
    modality: "US",
    body_part: "OBSTETRIC",
    study_date: "2026-10-01 10:00",
    referring_physician: "Dr. Amanda Ross (OB/GYN)",
    status: "FINALIZED",
    is_stat: false,
    ai_risk_score: 12,
    ai_triaged: false,
    ai_recommendation: "Normal Single Live Intrauterine Fetus 20w 3d. AFI 14.2cm.",
    total_series: 3,
    total_instances: 72,
    study_uid: "1.2.840.113619.2.55.3.28311512.9903",
    allergies: ["Latex"],
    egfr_level: "N/A",
    vital_signs: "BP: 114/72 mmHg | HR: 74 bpm | SpO2: 100%",
    scheduled_time: "09:45 AM",
    arrival_status: "COMPLETED",
    tech_notes: "Transabdominal scanning performed. Full bladder verified.",
    prior_studies: [
      { date: "2026-07-12", modality: "US", desc: "US DATING SCAN 12 WEEKS", result: "Single fetus CRL 56mm. CRL corresponds to 12w 1d." }
    ]
  },
  {
    id: "STU-004",
    patient_id: "PAT-8804",
    patient_name: "Arthur Pendelton",
    patient_mrn: "MRN-112084",
    patient_age: "71Y",
    patient_sex: "M",
    dob: "1955-11-04",
    phone: "+1 (555) 443-8822",
    insurance: "Medicare Part B",
    pre_auth_status: "PENDING_AUTH",
    study_description: "HRCT CHEST HIGH RESOLUTION",
    modality: "CT",
    body_part: "CHEST",
    study_date: "2026-10-01 11:30",
    referring_physician: "Dr. David Wu (Pulmonology)",
    status: "UNREPORTED",
    is_stat: true,
    ai_risk_score: 88,
    ai_triaged: true,
    ai_recommendation: "HIGH RISK: Right Lower Lobe Segmental Pulmonary Embolism & Consolidation",
    total_series: 5,
    total_instances: 312,
    study_uid: "1.2.840.113619.2.55.3.28311512.9904",
    allergies: ["Sulfa Drugs"],
    egfr_level: "64 mL/min/1.73m²",
    vital_signs: "BP: 142/88 mmHg | HR: 102 bpm | SpO2: 92% (On 2L O2)",
    scheduled_time: "11:15 AM",
    arrival_status: "CHECKED_IN",
    tech_notes: "Patient short of breath. Oxygen saturation monitored continuously.",
    prior_studies: []
  },
  {
    id: "STU-005",
    patient_id: "PAT-8805",
    patient_name: "Claire Underwood",
    patient_mrn: "MRN-609211",
    patient_age: "49Y",
    patient_sex: "F",
    dob: "1977-06-30",
    phone: "+1 (555) 601-2299",
    insurance: "Cigna Health Care",
    pre_auth_status: "APPROVED",
    study_description: "MAMMOGRAM BILATERAL DIGITAL SCREENING",
    modality: "MG",
    body_part: "BREAST",
    study_date: "2026-10-01 12:15",
    referring_physician: "Dr. Elena Rostova (Women's Health)",
    status: "UNREPORTED",
    is_stat: false,
    ai_risk_score: 45,
    ai_triaged: true,
    ai_recommendation: "BI-RADS 3: Focal Asymmetry Left Upper Outer Quadrant. Targeted US Advised.",
    total_series: 4,
    total_instances: 8,
    study_uid: "1.2.840.113619.2.55.3.28311512.9905",
    allergies: ["NKDA"],
    egfr_level: "N/A",
    vital_signs: "BP: 118/76 mmHg | HR: 70 bpm | SpO2: 99%",
    scheduled_time: "12:00 PM",
    arrival_status: "ARRIVED",
    tech_notes: "Standard CC and MLO views obtained bilaterally.",
    prior_studies: [
      { date: "2025-09-10", modality: "MG", desc: "MAMMOGRAM BILATERAL", result: "BI-RADS 1 Negative." }
    ]
  }
];

export default function EnterpriseUnifiedRisStudioV3({ userPersona = "RADIOLOGIST" }) {
  const { theme } = useTheme();
  const isLight = theme === "LIGHT";

  // 🌟 MAIN MODULE NAVIGATION STATE
  const [activeModule, setActiveModule] = useState(
    userPersona === "RADIOLOGIST" ? "DIAGNOSTIC" :
    userPersona === "TECHNICIAN" ? "TECH" :
    userPersona === "BILLING" ? "ADMIN" : "DIAGNOSTIC"
  );

  // 🌟 MODULE SUB-TAB STATE
  const [activeTab, setActiveTab] = useState("UNREPORTED_QUEUE");

  // 🌟 WORKSPACE STATE
  const [studies, setStudies] = useState(INITIAL_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState(INITIAL_STUDIES[0]);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [statOnlyFilter, setStatOnlyFilter] = useState(false);

  // 🌟 MODALS STATE
  const [showWorkstation, setShowWorkstation] = useState(false);
  const [workstationMode, setWorkstationMode] = useState("SPLIT");
  const [showReportingStudio, setShowReportingStudio] = useState(false);

  // 🌟 AUTOMATICALLY SYNC DEFAULT TABS WHEN MODULE SWITCHES
  useEffect(() => {
    if (activeModule === "ADMIN") setActiveTab("REGISTRATION");
    else if (activeModule === "TECH") setActiveTab("MWL_QUEUE");
    else if (activeModule === "DIAGNOSTIC") setActiveTab("UNREPORTED_QUEUE");
    else if (activeModule === "ANALYTICS") setActiveTab("TAT_ANALYTICS");
  }, [activeModule]);

  // 🌟 FILTERED STUDIES COMPUTATION
  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      const matchSearch = 
        study.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.patient_mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.study_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.referring_physician.toLowerCase().includes(searchTerm.toLowerCase());

      const matchModality = modalityFilter === "ALL" || study.modality === modalityFilter;
      const matchStat = !statOnlyFilter || study.is_stat;

      return matchSearch && matchModality && matchStat;
    });
  }, [studies, searchTerm, modalityFilter, statOnlyFilter]);

  return (
    <div className={`h-[calc(100vh-53px)] flex flex-col font-sans transition-colors ${
      isLight ? "bg-slate-100 text-slate-800" : "bg-slate-900 text-slate-100"
    }`}>

      {/* 🚀 MAIN SPLIT THREE-PANEL CONTAINER */}
      <div className="flex-1 flex overflow-hidden">

        {/* ==================================================================== */}
        {/* PANEL 1: LEFT GLOBAL MODULE NAVIGATION SIDEBAR (EXECUTIVE CLINICAL) */}
        {/* ==================================================================== */}
        <nav className={`w-16 lg:w-60 border-r flex flex-col justify-between shrink-0 transition-all ${
          isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800/80"
        }`}>
          {/* Top Module Buttons */}
          <div className="p-3 space-y-2">
            
            {/* 1. Diagnostic Radiologist Workspace */}
            <button
              onClick={() => setActiveModule("DIAGNOSTIC")}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeModule === "DIAGNOSTIC"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Stethoscope size={18} className="shrink-0 text-blue-300" />
              <div className="text-left hidden lg:block">
                <div className="font-extrabold text-sm leading-tight">Diagnostic Rad</div>
                <div className="text-[10px] text-blue-200/70 font-normal">Unreported Queue & Speech</div>
              </div>
            </button>

            {/* 2. Clinical Workflow (Tech Workspace) */}
            <button
              onClick={() => setActiveModule("TECH")}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeModule === "TECH"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Radio size={18} className="shrink-0 text-emerald-400" />
              <div className="text-left hidden lg:block">
                <div className="font-extrabold text-sm leading-tight">Clinical Tech</div>
                <div className="text-[10px] text-slate-400 font-normal">MWL & Safety Protocol</div>
              </div>
            </button>

            {/* 3. Administrative & Operations */}
            <button
              onClick={() => setActiveModule("ADMIN")}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeModule === "ADMIN"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Calendar size={18} className="shrink-0 text-indigo-400" />
              <div className="text-left hidden lg:block">
                <div className="font-extrabold text-sm leading-tight">Admin & Ops</div>
                <div className="text-[10px] text-slate-400 font-normal">Scheduling & Check-In</div>
              </div>
            </button>

            {/* 4. BI & Analytics Module */}
            <button
              onClick={() => setActiveModule("ANALYTICS")}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeModule === "ANALYTICS"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <BarChart3 size={18} className="shrink-0 text-purple-400" />
              <div className="text-left hidden lg:block">
                <div className="font-extrabold text-sm leading-tight">BI Analytics</div>
                <div className="text-[10px] text-slate-400 font-normal">TAT & Modality Usage</div>
              </div>
            </button>
          </div>

          {/* Bottom Telemetry Card */}
          <div className="p-3 m-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hidden lg:block space-y-2">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><Activity size={12} className="text-blue-400" /> Operations</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Avg TAT:</span>
                <span className="font-bold text-white">14.2 min</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MWL Node:</span>
                <span className="font-bold text-emerald-400">ONLINE</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ==================================================================== */}
        {/* PANEL 2: CENTER DYNAMIC WORKSPACE WITH SUB-TABS & DATA GRID          */}
        {/* ==================================================================== */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">

          {/* 🏷️ DYNAMIC SUB-TABS BAR (CLEAN SLATE DESIGN) */}
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2 overflow-x-auto">
            
            {/* SUB-TABS FOR DIAGNOSTIC RAD MODULE */}
            {activeModule === "DIAGNOSTIC" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("UNREPORTED_QUEUE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "UNREPORTED_QUEUE" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Stethoscope size={14} className="text-blue-400" /> Reading Queue ({studies.filter(s => s.status === "UNREPORTED").length})
                </button>
                <button
                  onClick={() => setActiveTab("VIEWER_MPR")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "VIEWER_MPR" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers size={14} className="text-indigo-400" /> 50:50 Viewport Studio
                </button>
                <button
                  onClick={() => setActiveTab("REPORTING_DICTATION")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "REPORTING_DICTATION" ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PenTool size={14} className="text-purple-400" /> Speech Dictation Studio
                </button>
                <button
                  onClick={() => setActiveTab("CRITICAL_ALERTS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "CRITICAL_ALERTS" ? "bg-rose-950/60 text-rose-300 border border-rose-800/80 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap size={14} className="text-amber-400" /> Critical Findings Alerts
                </button>
              </div>
            )}

            {/* SUB-TABS FOR CLINICAL TECH MODULE */}
            {activeModule === "TECH" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("MWL_QUEUE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "MWL_QUEUE" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio size={14} className="text-emerald-400" /> Modality Worklist (MWL)
                </button>
                <button
                  onClick={() => setActiveTab("SAFETY_PROTOCOL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "SAFETY_PROTOCOL" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldAlert size={14} className="text-amber-400" /> MRI/CT Safety Screening
                </button>
                <button
                  onClick={() => setActiveTab("CONSENTS_LOG")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "CONSENTS_LOG" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ClipboardList size={14} /> Consents & Contrast Log
                </button>
                <button
                  onClick={() => setActiveTab("IMAGE_QA")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "IMAGE_QA" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye size={14} /> DICOM PACS Transfer QA
                </button>
              </div>
            )}

            {/* SUB-TABS FOR ADMIN MODULE */}
            {activeModule === "ADMIN" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("REGISTRATION")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "REGISTRATION" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus size={14} /> Patient Registration
                </button>
                <button
                  onClick={() => setActiveTab("MASTER_SCHEDULING")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "MASTER_SCHEDULING" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar size={14} /> Master Scheduling Calendar
                </button>
                <button
                  onClick={() => setActiveTab("PRE_AUTH")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "PRE_AUTH" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck size={14} /> Eligibility & Pre-Auth
                </button>
                <button
                  onClick={() => setActiveTab("WAITING_ROOM")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "WAITING_ROOM" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock size={14} /> Check-In / Waiting Room
                </button>
              </div>
            )}

            {/* SUB-TABS FOR BI ANALYTICS MODULE */}
            {activeModule === "ANALYTICS" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("TAT_ANALYTICS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "TAT_ANALYTICS" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp size={14} /> Turnaround Time (TAT)
                </button>
                <button
                  onClick={() => setActiveTab("MODALITY_UTILIZATION")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "MODALITY_UTILIZATION" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PieChart size={14} /> Modality Utilization
                </button>
                <button
                  onClick={() => setActiveTab("BILLING_CODING")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "BILLING_CODING" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign size={14} /> Billing & ICD-10 Coding
                </button>
              </div>
            )}

            {/* STAT Filter Toggle & Right Drawer Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatOnlyFilter(!statOnlyFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  statOnlyFilter
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Zap size={12} className="text-amber-400" />
                <span>STAT ({studies.filter(s => s.is_stat).length})</span>
              </button>

              <button
                onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Toggle Right Patient Drawer"
              >
                {isRightDrawerOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          {/* 🔍 SEARCH & QUICK MODALITY FILTERS BAR */}
          <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, MRN, study description..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-2 text-slate-400 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Modality Pills */}
            <div className="flex items-center gap-1">
              {["ALL", "CT", "MR", "US", "MG", "XR"].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setModalityFilter(mod)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    modalityFilter === mod
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800/60"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* 📊 MAIN WORKSPACE DATA PANEL (HANDLES ALL 16 SUB-TABS) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* 1. RADIOLOGIST UNREPORTED QUEUE / MWL QUEUE */}
            {(activeTab === "UNREPORTED_QUEUE" || activeTab === "MWL_QUEUE") && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-2.5">Patient / MRN</th>
                        <th className="px-4 py-2.5">Examination</th>
                        <th className="px-4 py-2.5">AI Risk Prioritization</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredStudies.map((study) => {
                        const isSelected = selectedStudy?.id === study.id;
                        return (
                          <tr
                            key={study.id}
                            onClick={() => setSelectedStudy(study)}
                            className={`transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-slate-800/60 border-l-4 border-l-blue-500" 
                                : "hover:bg-slate-900/60"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="font-extrabold text-white flex items-center gap-1.5">
                                {study.is_stat && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px]">
                                    STAT
                                  </span>
                                )}
                                {study.patient_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="text-slate-300 font-semibold">{study.patient_mrn}</span>
                                <span>•</span>
                                <span>{study.patient_age} / {study.patient_sex}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-bold text-[10px] border border-slate-700">
                                  {study.modality}
                                </span>
                                <span className="font-bold text-slate-200 truncate max-w-xs">{study.study_description}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {study.study_date} • {study.total_instances} Slices
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {study.ai_triaged ? (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    study.ai_risk_score > 85 ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  }`}>
                                    AI Score: {study.ai_risk_score}%
                                  </span>
                                  <span className="text-[11px] text-slate-300 truncate max-w-xs">{study.ai_recommendation}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">No acute finding flags</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                study.status === "FINALIZED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                study.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {study.status}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedStudy(study); setWorkstationMode("SPLIT"); setShowWorkstation(true); }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Split size={12} /> 50:50 Studio
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedStudy(study); setShowReportingStudio(true); }}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <PenTool size={12} /> Report Studio
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ADMIN: PATIENT REGISTRATION FORM TAB */}
            {activeTab === "REGISTRATION" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <UserPlus className="text-blue-400" /> Patient Registration & Demographic Intake
                    </h3>
                    <p className="text-xs text-slate-400">Search existing EMR/RIS database or register a new patient record.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Plus size={14} /> Add New Patient
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-200">Patient Demographics</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="First Name" defaultValue="Eleanor" className="p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                      <input type="text" placeholder="Last Name" defaultValue="Vance" className="p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                      <input type="text" placeholder="MRN (Auto-Gen)" defaultValue="MRN-994102" readOnly className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono" />
                      <input type="date" defaultValue="1968-04-12" className="p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-200">Insurance & Contact</div>
                    <div className="space-y-2">
                      <input type="text" placeholder="Primary Insurance Provider" defaultValue="Blue Cross Blue Shield" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                      <input type="text" placeholder="Policy / Member Group ID" defaultValue="BCBS-8841-99201" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white font-mono" />
                      <input type="text" placeholder="Contact Phone Number" defaultValue="+1 (555) 382-9910" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ADMIN: MASTER SCHEDULING CALENDAR TAB */}
            {activeTab === "MASTER_SCHEDULING" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Calendar className="text-indigo-400" /> Master Modality Scheduling Calendar
                    </h3>
                    <p className="text-xs text-slate-400">Resource slots for MRI-1, CT-2, Ultrasound-3, and Digital Mammography.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded">October 1, 2026</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {["MRI 1.5T Scanner", "CT 128-Slice Scanner", "Ultrasound Bay 3", "Digital Mammography"].map((room, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="font-bold text-blue-400 border-b border-slate-800 pb-1">{room}</div>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="p-2 bg-blue-950/60 border border-blue-800/60 rounded text-blue-200">08:30 AM - Eleanor Vance (CT Brain)</div>
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-400">09:15 AM - Robert Sterling (MRI Knee)</div>
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-400">10:00 AM - Sophia Martinez (OB US)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ADMIN: ELIGIBILITY & PRE-AUTH TAB */}
            {activeTab === "PRE_AUTH" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" /> Real-time Insurance Verification & Pre-Auth
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">99% Clean Claim Rate</span>
                </div>

                <div className="space-y-2 text-xs">
                  {studies.map(s => (
                    <div key={s.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{s.patient_name} ({s.patient_mrn})</div>
                        <div className="text-slate-400 font-mono text-[11px]">{s.insurance} • {s.study_description}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.pre_auth_status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {s.pre_auth_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ADMIN: WAITING ROOM CHECK-IN TAB */}
            {activeTab === "WAITING_ROOM" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Clock className="text-amber-400" /> Patient Arrival & Waiting Room Live Monitor
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Average Wait: 8.4 min</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {["SCHEDULED", "CHECKED_IN", "IN_EXAM", "COMPLETED"].map((st) => (
                    <div key={st} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">{st.replace("_", " ")}</div>
                      {studies.filter(s => s.arrival_status === st).map(s => (
                        <div key={s.id} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <div className="font-bold text-white">{s.patient_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.modality} • {s.scheduled_time}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TECH: MRI/CT SAFETY PROTOCOL SCREENING TAB */}
            {activeTab === "SAFETY_PROTOCOL" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldAlert className="text-amber-400" /> Technologist Pre-Scan Safety Screening Checklist
                </h3>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <div className="font-bold text-blue-400">Patient: {selectedStudy?.patient_name} ({selectedStudy?.patient_mrn})</div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                      <input type="checkbox" defaultChecked /> Cardiac Pacemaker / Defibrillator Check Cleared
                    </label>
                    <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                      <input type="checkbox" defaultChecked /> eGFR Renal Function Level Verified ({selectedStudy?.egfr_level})
                    </label>
                    <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                      <input type="checkbox" defaultChecked /> Metallic Aneurysm Clip / Implant Screening Cleared
                    </label>
                    <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                      <input type="checkbox" defaultChecked /> Pregnancy Status Cleared (N/A)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 7. TECH: CONSENTS & CONTRAST MEDIA LOG TAB */}
            {activeTab === "CONSENTS_LOG" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ClipboardList className="text-emerald-400" /> Digital Consent Signatures & Contrast Media Injection Log
                </h3>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Contrast Agent Brand</label>
                      <input type="text" defaultValue="Omnipaque 350 mgI/mL" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Volume Injected (mL)</label>
                      <input type="text" defaultValue="85 mL" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white font-mono" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Injection Rate (mL/s)</label>
                      <input type="text" defaultValue="3.5 mL/sec" className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. TECH: DICOM PACS QA TAB */}
            {activeTab === "IMAGE_QA" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Eye className="text-blue-400" /> DICOM PACS Transfer QA & Header Inspector
                </h3>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-2 font-mono text-slate-300">
                  <div>[0008,0016] SOP Class UID: 1.2.840.10008.5.1.4.1.1.2 (CT Image Storage)</div>
                  <div>[0008,0060] Modality: {selectedStudy?.modality}</div>
                  <div>[0010,0010] Patient Name: {selectedStudy?.patient_name}</div>
                  <div>[0010,0020] Patient ID: {selectedStudy?.patient_mrn}</div>
                  <div>[0020,000D] Study Instance UID: {selectedStudy?.study_uid}</div>
                </div>
              </div>
            )}

            {/* 9. RAD: 50:50 VIEWER STUDIO TAB */}
            {activeTab === "VIEWER_MPR" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Layers className="text-indigo-400" /> 50:50 Multilayered DICOM Viewer & Reporting Workspace
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Active Exam: <span className="text-blue-400 font-bold">{selectedStudy?.patient_name}</span> ({selectedStudy?.study_description})
                    </p>
                  </div>

                  <button
                    onClick={() => { 
                      if (!selectedStudy && Array.isArray(filteredStudies) && filteredStudies.length > 0) {
                        setSelectedStudy(filteredStudies[0]);
                      }
                      setWorkstationMode("SPLIT"); 
                      setShowWorkstation(true); 
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/30"
                  >
                    <Split size={14} /> Open Fullscreen 50:50 Studio
                  </button>
                </div>
              </div>
            )}

            {/* 10. RAD: SPEECH DICTATION STUDIO TAB */}
            {activeTab === "REPORTING_DICTATION" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <PenTool className="text-purple-400" /> PowerScribe Speech Dictation & Template Studio
                  </h3>
                  <button
                    onClick={() => setShowReportingStudio(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool size={14} /> Launch Standalone Reporting Studio
                  </button>
                </div>
              </div>
            )}

            {/* 11. RAD: CRITICAL FINDINGS ALERTS TAB */}
            {activeTab === "CRITICAL_ALERTS" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Zap className="text-amber-400" /> STAT Emergency Critical Findings Escalation Log
                </h3>
                <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-200 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-rose-300">
                    <AlertTriangle size={16} /> CRITICAL ALERT: Right MCA Acute Stroke Sign (Patient: Eleanor Vance)
                  </div>
                  <div>Clinician Notified: Dr. Marcus Vance (Neurology) • SMS & Email Timestamp: 2026-10-01 08:34:12</div>
                </div>
              </div>
            )}

            {/* 12. BI: TAT ANALYTICS TAB */}
            {activeTab === "TAT_ANALYTICS" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <TrendingUp className="text-emerald-400" /> Turnaround Time (TAT) Analytics & Radiologist Performance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400">Order to Scan Complete</div>
                    <div className="text-xl font-bold text-white font-mono">8.4 min</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400">Scan Complete to Draft</div>
                    <div className="text-xl font-bold text-blue-400 font-mono">11.2 min</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400">Draft to Final Signature</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">3.1 min</div>
                  </div>
                </div>
              </div>
            )}

            {/* 13. BI: MODALITY UTILIZATION TAB */}
            {activeTab === "MODALITY_UTILIZATION" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <PieChart className="text-purple-400" /> Scanner Machine Utilization & Capacity Analytics
                </h3>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
                  <div className="flex justify-between"><span>CT 128-Slice Scanner:</span> <span className="text-emerald-400 font-bold font-mono">98% Capacity</span></div>
                  <div className="flex justify-between"><span>MRI 1.5T Scanner:</span> <span className="text-blue-400 font-bold font-mono">88% Capacity</span></div>
                  <div className="flex justify-between"><span>Ultrasound Bay 3:</span> <span className="text-purple-400 font-bold font-mono">94% Capacity</span></div>
                </div>
              </div>
            )}

            {/* 14. BI: BILLING & ICD-10 CODING TAB */}
            {activeTab === "BILLING_CODING" && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <DollarSign className="text-emerald-400" /> Automated ICD-10 / CPT Coding & Billing Claims
                </h3>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2 font-mono">
                  <div>Exam: CT BRAIN WITHOUT CONTRAST</div>
                  <div>Suggested CPT Code: <span className="text-blue-400 font-bold">70450</span></div>
                  <div>Suggested ICD-10 Code: <span className="text-emerald-400 font-bold">I63.50 (Cerebral infarction)</span></div>
                  <div>Claim Status: <span className="text-emerald-300 font-bold">READY FOR EHR BATCH EXPORT</span></div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* ==================================================================== */}
        {/* PANEL 3: RIGHT COLLAPSIBLE CONTEXTUAL DRAWER (EXECUTIVE PATIENT CARD)*/}
        {/* ==================================================================== */}
        {isRightDrawerOpen && selectedStudy && (
          <aside className={`w-80 lg:w-96 border-l flex flex-col justify-between shrink-0 transition-all overflow-y-auto ${
            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800/80 text-slate-100"
          }`}>
            <div className="p-4 space-y-4">

              {/* Patient Profile Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Patient Profile</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedStudy.patient_id}</span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={16} className="text-blue-400" /> {selectedStudy.patient_name}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span className="text-slate-200 font-semibold">{selectedStudy.patient_mrn}</span>
                    <span>•</span>
                    <span>{selectedStudy.patient_age} / {selectedStudy.patient_sex}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" /> <span>{selectedStudy.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-400" /> <span>{selectedStudy.insurance}</span>
                  </div>
                </div>
              </div>

              {/* AI Triage Card */}
              {selectedStudy.ai_triaged && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <Sparkles size={13} className="text-purple-400" /> AI Risk Prioritization
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      SCORE: {selectedStudy.ai_risk_score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedStudy.ai_recommendation}
                  </p>
                </div>
              )}

              {/* Current Exam Specifications */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Examination Details</div>
                <div className="text-xs font-bold text-white leading-snug">{selectedStudy.study_description}</div>
                <div className="text-xs text-slate-400 font-mono space-y-1 pt-1">
                  <div>Referring Doctor: <span className="text-slate-200">{selectedStudy.referring_physician}</span></div>
                  <div>Study UID: <span className="text-blue-400 truncate block">{selectedStudy.study_uid}</span></div>
                </div>
              </div>

              {/* Safety & Vitals */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldAlert size={12} className="text-amber-400" /> Safety & Vitals
                </div>
                <div className="text-xs space-y-1">
                  <div><span className="text-slate-400">Allergies:</span> <span className="text-rose-300 font-semibold">{selectedStudy.allergies.join(", ")}</span></div>
                  <div><span className="text-slate-400">eGFR Renal:</span> <span className="text-emerald-400 font-mono">{selectedStudy.egfr_level}</span></div>
                  <div><span className="text-slate-400">Vitals:</span> <span className="text-slate-200 font-mono">{selectedStudy.vital_signs}</span></div>
                </div>
              </div>

              {/* Prior Scans History */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Clock size={12} className="text-blue-400" /> Prior Imaging ({selectedStudy.prior_studies.length})
                </div>
                {selectedStudy.prior_studies.length > 0 ? (
                  selectedStudy.prior_studies.map((prior, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-blue-300 font-bold font-mono">
                        <span>{prior.modality} • {prior.desc}</span>
                        <span className="text-slate-400 text-[10px]">{prior.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">{prior.result}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">No prior imaging on record.</div>
                )}
              </div>

            </div>
          </aside>
        )}

      </div>

      {/* 🌟 MODALS INTERACTION */}
      {showWorkstation && (
        <DiagnosticWorkstationV3
          study={selectedStudy}
          initialMode={workstationMode}
          onClose={() => setShowWorkstation(false)}
        />
      )}

      {showReportingStudio && (
        <ReportingStudioV3
          study={selectedStudy}
          onClose={() => setShowReportingStudio(false)}
        />
      )}

    </div>
  );
}
