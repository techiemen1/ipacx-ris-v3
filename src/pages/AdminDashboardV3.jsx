// FILE: src/pages/AdminDashboardV3.jsx
import React, { useState, useEffect } from "react";
import { 
  Server, 
  Users, 
  ShieldCheck, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Activity,
  Building,
  Save,
  CheckCircle2,
  Palette,
  UserPlus,
  Lock,
  UserCheck
} from "lucide-react";
import PacsNodeModal from "../components/AdminPortal/PacsNodeModal";
import HrUserManagementV3 from "./HrUserManagementV3";
import api from "../api/axios";
import { useTheme } from "../utils/ThemeContext";

const AdminDashboardV3 = () => {
  const { model, setDesignModel } = useTheme();
  const [activeTab, setActiveTab] = useState("hospital_branding"); // hospital_branding | users_roles | hr_roster | pacs_nodes

  const [pacsNodes, setPacsNodes] = useState([]);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState("");

  const [hospitalConfig, setHospitalConfig] = useState({
    hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
    tagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Radiation Safety Certified",
    address: "Plot 104, Medical Center Avenue, Healthcare Hub, Maharashtra 400001",
    phone: "+91 (022) 2891-0000 | report@ipacx-imaging.com",
    gstin: "27AAAAA0000A1Z5",
    sacCode: "999312",
    ohifViewerUrl: "http://192.168.1.7:8042/ohif/viewer",
    preferredViewer: "50:50", // 50:50 | OHIF | MOBILE_LITE
    logoUrl: ""
  });

  useEffect(() => {
    fetchPacsNodes();
    fetchHospitalConfig();
  }, []);

  const fetchHospitalConfig = async () => {
    try {
      const res = await api.get("/api/v3/config/hospital").catch(() => null);
      if (res?.data?.success && res?.data?.config) {
        setHospitalConfig(res.data.config);
        localStorage.setItem("ipacx_hospital_config", JSON.stringify(res.data.config));
      }
    } catch (e) {
      console.warn("Config fetch error:", e);
    }
  };

  const handleSaveHospitalConfig = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/v3/config/hospital", hospitalConfig).catch(() => null);
      localStorage.setItem("ipacx_hospital_config", JSON.stringify(hospitalConfig));
      setSavedSuccess("✅ Hospital Branding updated! Changes reflected across Login Page, Workstation & Reports!");
      setTimeout(() => setSavedSuccess(""), 4000);
    } catch (err) {
      console.error("Save config error:", err);
    }
  };

  const fetchPacsNodes = async () => {
    setLoading(true);
    try {
      const mockNodes = [
        {
          id: "node_orthanc_1",
          node_name: "Primary Edge Orthanc PACS",
          pacs_type: "ORTHANC",
          ae_title: "ORTHANC",
          ip_address: "127.0.0.1",
          port: 8042,
          is_active: true,
          is_default: true
        },
        {
          id: "node_dcm4chee_1",
          node_name: "Central VNA DCM4CHEE ARC",
          pacs_type: "DCM4CHEE",
          ae_title: "DCM4CHEE",
          ip_address: "dcm4chee-arc",
          port: 8080,
          is_active: true,
          is_default: false
        }
      ];
      setPacsNodes(mockNodes);
    } catch (err) {
      console.error("Failed to load PACS nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-v3-container p-3 md:p-4 bg-slate-950 text-slate-100 min-h-screen space-y-3 font-sans">
      {/* Ultra-Compact Header */}
      <header className="bg-slate-900/80 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-white tracking-tight font-heading flex items-center gap-2">
              iPaCX RIS/PACS v3.0 Enterprise Governance
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              System Administration, Hospital Branding, PACS Nodes & Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <Activity size={13} className="animate-pulse" />
            System Health: HEALTHY
          </div>
          <button 
            onClick={fetchPacsNodes} 
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Refresh System"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {savedSuccess && (
        <div className="p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} /> {savedSuccess}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-6 border-b border-slate-800 pb-2.5">
        <button
          onClick={() => setActiveTab("hospital_branding")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "hospital_branding"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Building size={16} /> Hospital Branding & Login Settings
        </button>

        <button
          onClick={() => setActiveTab("users_roles")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "users_roles"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <UserPlus size={16} /> User & Role Creation (RBAC)
        </button>

        <button
          onClick={() => setActiveTab("hr_roster")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "hr_roster"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users size={16} /> HR Staff Roster & Medical Licenses
        </button>

        <button
          onClick={() => setActiveTab("pacs_nodes")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "pacs_nodes"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Server size={16} /> PACS Nodes & VNA Gateway
        </button>
      </div>

      {/* Hospital Branding Tab Content */}
      {activeTab === "hospital_branding" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="text-cyan-400" size={20} /> Configure Hospital Name, Branding & Letterhead
          </h2>

          <form onSubmit={handleSaveHospitalConfig} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Hospital / Diagnostic Center Name (Reflects on Login & Reports)</label>
              <input
                type="text"
                required
                value={hospitalConfig.hospitalName}
                onChange={(e) => setHospitalConfig({ ...hospitalConfig, hospitalName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-cyan-300 font-bold text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Sub-Tagline / Accreditation Details</label>
              <input
                type="text"
                value={hospitalConfig.tagline}
                onChange={(e) => setHospitalConfig({ ...hospitalConfig, tagline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Hospital Address</label>
                <input
                  type="text"
                  value={hospitalConfig.address}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Helpline Phone & Email</label>
                <input
                  type="text"
                  value={hospitalConfig.phone}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={hospitalConfig.gstin}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, gstin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Healthcare SAC Code</label>
                <input
                  type="text"
                  readOnly
                  value={hospitalConfig.sacCode}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-purple-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* 🎨 4-MODEL CLINICAL DESIGN SYSTEM PALETTE SELECTOR */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="text-xs font-extrabold text-slate-100 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Palette size={16} className="text-cyan-400" /> Executive Clinical Design System Models (Zero Eye Fatigue)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">IPACX V3 MASTER SPEC</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Theme 1: Deep Sapphire */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "DEEP_SAPPHIRE" });
                    setDesignModel("DEEP_SAPPHIRE");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "DEEP_SAPPHIRE"
                      ? "bg-[#14223A] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                      : "bg-[#14223A]/60 border-slate-800 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">1. Deep Sapphire</span>
                    {model === "DEEP_SAPPHIRE" && <CheckCircle size={14} className="text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Executive midnight blue glassmorphism, crisp white titles, cyan accents. Plus Jakarta Sans typography.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4 h-4 rounded-full bg-[#0B132B] border border-slate-700" title="Canvas #0B132B"></span>
                    <span className="w-4 h-4 rounded-full bg-[#14223A] border border-slate-700" title="Card #14223A"></span>
                    <span className="w-4 h-4 rounded-full bg-[#38BDF8]" title="Sky Cyan #38BDF8"></span>
                    <span className="w-4 h-4 rounded-full bg-[#F8FAFC]" title="Text #F8FAFC"></span>
                  </div>
                </div>

                {/* Theme 2: Emerald Sage */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "EMERALD_SAGE" });
                    setDesignModel("EMERALD_SAGE");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "EMERALD_SAGE"
                      ? "bg-[#0E2920] border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                      : "bg-[#0E2920]/60 border-slate-800 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">2. Emerald Sage</span>
                    {model === "EMERALD_SAGE" && <CheckCircle size={14} className="text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Bio-clinical forest sage glass, mint white typography, teal accents. Manrope typography.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4 h-4 rounded-full bg-[#071913] border border-slate-700" title="Canvas #071913"></span>
                    <span className="w-4 h-4 rounded-full bg-[#0E2920] border border-slate-700" title="Card #0E2920"></span>
                    <span className="w-4 h-4 rounded-full bg-[#2DD4BF]" title="Mint Teal #2DD4BF"></span>
                    <span className="w-4 h-4 rounded-full bg-[#F0FDF4]" title="Text #F0FDF4"></span>
                  </div>
                </div>

                {/* Theme 3: Velvet Obsidian */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "VELVET_OBSIDIAN" });
                    setDesignModel("VELVET_OBSIDIAN");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "VELVET_OBSIDIAN"
                      ? "bg-[#181B24] border-amber-400 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                      : "bg-[#181B24]/60 border-slate-800 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">3. Velvet Obsidian</span>
                    {model === "VELVET_OBSIDIAN" && <CheckCircle size={14} className="text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Luxury dark charcoal obsidian glass, warm white titles, amber gold accents. Inter typography.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4 h-4 rounded-full bg-[#0F1117] border border-slate-700" title="Canvas #0F1117"></span>
                    <span className="w-4 h-4 rounded-full bg-[#181B24] border border-slate-700" title="Card #181B24"></span>
                    <span className="w-4 h-4 rounded-full bg-[#F59E0B]" title="Amber Gold #F59E0B"></span>
                    <span className="w-4 h-4 rounded-full bg-[#FAFAFA]" title="Text #FAFAFA"></span>
                  </div>
                </div>

                {/* Theme 4: Warm Beige */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "WARM_BEIGE" });
                    setDesignModel("WARM_BEIGE");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "WARM_BEIGE"
                      ? "bg-[#F6F4F0] border-amber-600 ring-2 ring-amber-600/30 shadow-lg"
                      : "bg-[#FAF8F4] border-slate-700 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">4. Warm Beige</span>
                    {model === "WARM_BEIGE" && <CheckCircle size={14} className="text-amber-700" />}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    Warm linen light canvas with crisp white cards, dark slate text, zero glare. Plus Jakarta Sans font.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4 h-4 rounded-full bg-[#F6F4F0] border border-amber-300" title="Canvas #F6F4F0"></span>
                    <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-slate-300" title="Card #FFFFFF"></span>
                    <span className="w-4 h-4 rounded-full bg-[#D97706]" title="Warm Amber #D97706"></span>
                    <span className="w-4 h-4 rounded-full bg-[#1E293B]" title="Text #1E293B"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* DICOM & OHIF VIEWER CONFIGURATION */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> DICOM Image Viewer Base Settings
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    OHIF / DICOM Viewer Base URL
                  </label>
                  <input
                    type="text"
                    value={hospitalConfig.ohifViewerUrl || "http://192.168.1.7:8042/ohif/viewer"}
                    onChange={(e) => setHospitalConfig({ ...hospitalConfig, ohifViewerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-400 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    placeholder="http://192.168.1.7:8042/ohif/viewer"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Primary Workstation Mode
                  </label>
                  <select
                    value={hospitalConfig.preferredViewer || "50:50"}
                    onChange={(e) => setHospitalConfig({ ...hospitalConfig, preferredViewer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="50:50">⚡ 50:50 Side-by-Side Dual-Pane Report Studio (Recommended)</option>
                    <option value="WEASIS">🚀 Weasis Native DICOM Viewer (weasis:// launcher)</option>
                    <option value="OHIF">🌐 External OHIF Viewer Link</option>
                    <option value="MOBILE_LITE">📱 Mobile Lite Touch WebGL 3D Viewer</option>
                  </select>
                </div>
              </div>
            </div>



            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <Save size={16} /> Save Branding & Sync to Login / Reports
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User & Role Creation Tab Content */}
      {(activeTab === "users_roles" || activeTab === "hr_roster") && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-2 overflow-hidden shadow-2xl">
          <HrUserManagementV3 />
        </div>
      )}

      {/* PACS Nodes Tab Content */}
      {activeTab === "pacs_nodes" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="text-cyan-400" size={20} /> Active Hybrid PACS Destinations
            </h2>
            <button
              onClick={() => { setSelectedNode(null); setShowNodeModal(true); }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20"
            >
              <Plus size={16} /> Add PACS Node
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pacsNodes.map((node) => (
              <div 
                key={node.id} 
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white text-base">{node.node_name}</span>
                    {node.is_default && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Default Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p><span className="text-slate-500">AE Title:</span> <code className="text-cyan-400 font-mono">{node.ae_title}</code></p>
                    <p><span className="text-slate-500">Host / Port:</span> {node.ip_address}:{node.port}</p>
                    <p><span className="text-slate-500">Type:</span> <span className="text-slate-300 font-semibold">{node.pacs_type}</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    node.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    {node.is_active ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {node.is_active ? "ONLINE" : "OFFLINE"}
                  </span>
                  <button 
                    onClick={() => { setSelectedNode(node); setShowNodeModal(true); }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Edit Node
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🔗 PACS DICOM VIEWER LINKS & LAUNCHER TEMPLATES CONFIGURATION */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Server className="text-cyan-400" size={18} /> PACS Custom DICOM Viewer Links & Launcher Protocols
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Configure dynamic URL schemes used by doctors when launching external DICOM viewers from PACS Worklist & Nodes.
                </p>
              </div>

              <button
                onClick={handleSaveHospitalConfig}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Save size={14} /> Save Viewer Links
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="font-extrabold text-cyan-300 block uppercase text-[10px]">
                  1. OHIF Web Viewer URL Format
                </label>
                <input
                  type="text"
                  value={hospitalConfig.ohifViewerUrl || "http://localhost:8043/ohif/viewer?StudyInstanceUIDs={studyUID}"}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, ohifViewerUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="http://localhost:8043/ohif/viewer?StudyInstanceUIDs={studyUID}"
                />
                <span className="text-[10px] text-slate-400">Placeholders: <code>{`{studyUID}`}</code>, <code>{`{host}`}</code></span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="font-extrabold text-purple-300 block uppercase text-[10px]">
                  2. Weasis Native Protocol Launcher URL
                </label>
                <input
                  type="text"
                  value={hospitalConfig.weasisUrl || "weasis://$dicom:get -w http://localhost:8042/wado?requestType=WADO&studyUID={studyUID}"}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, weasisUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-purple-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="weasis://$dicom:get -w http://localhost:8042/wado?..."
                />
                <span className="text-[10px] text-slate-400">Supports Weasis desktop client protocol scheme.</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="font-extrabold text-amber-300 block uppercase text-[10px]">
                  3. Horos / OsiriX Mac Workstation Link
                </label>
                <input
                  type="text"
                  value={hospitalConfig.horosUrl || "osirix://?methodName=DownloadURL&URL={wadoUrl}"}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, horosUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-amber-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="osirix://?methodName=DownloadURL..."
                />
                <span className="text-[10px] text-slate-400">Direct OsiriX / Horos macOS DICOM listener integration.</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="font-extrabold text-emerald-300 block uppercase text-[10px]">
                  4. Integrated 50:50 DICOM Workstation Endpoint
                </label>
                <input
                  type="text"
                  value={hospitalConfig.integratedViewerUrl || "/reporting-studio?study={studyUID}"}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, integratedViewerUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-emerald-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="/reporting-studio?study={studyUID}"
                />
                <span className="text-[10px] text-slate-400">Default iPaCX dual-pane 50:50 Reporting Studio target.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editor */}
      {showNodeModal && (
        <PacsNodeModal
          node={selectedNode}
          onClose={() => setShowNodeModal(false)}
          onSave={(saved) => {
            setShowNodeModal(false);
            fetchPacsNodes();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardV3;
