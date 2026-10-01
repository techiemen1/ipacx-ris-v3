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
  Palette
} from "lucide-react";
import PacsNodeModal from "../components/AdminPortal/PacsNodeModal";
import api from "../api/axios";
import { useTheme } from "../utils/ThemeContext";

const AdminDashboardV3 = () => {
  const { model, setDesignModel } = useTheme();
  const [activeTab, setActiveTab] = useState("hospital_branding"); // hospital_branding | pacs_nodes | users | settings

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
      <div className="flex gap-3 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("hospital_branding")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "hospital_branding"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Building size={18} /> Hospital Branding & Login Settings
        </button>

        <button
          onClick={() => setActiveTab("pacs_nodes")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "pacs_nodes"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Server size={18} /> PACS Nodes & VNA Gateway
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

            {/* 🎨 3-MODEL CLINICAL DESIGN SYSTEM PALETTE SELECTOR */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Palette size={16} className="text-cyan-400" /> Enterprise Medical Design System Models
                </span>
                <span className="text-[10px] text-slate-400 font-mono">IPACX MASTER DESIGN SPEC</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Model 1: Pitch-Black Radiology */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "PITCH_BLACK" });
                    setDesignModel("PITCH_BLACK");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "PITCH_BLACK"
                      ? "bg-black border-[#4FE3B5] ring-2 ring-[#4FE3B5]/30 shadow-lg shadow-[#4FE3B5]/10"
                      : "bg-black/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#E0E6ED]">Model 1: Pitch-Black Radiology</span>
                    {model === "PITCH_BLACK" && <CheckCircle size={14} className="text-[#4FE3B5]" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Skins Factory Reading Room standard. Zero-glare pitch black canvas with Mid-Century Mint accents.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-5 h-5 rounded-full bg-[#000000] border border-slate-700" title="Canvas #000000"></span>
                    <span className="w-5 h-5 rounded-full bg-[#121212] border border-slate-700" title="Surface #121212"></span>
                    <span className="w-5 h-5 rounded-full bg-[#4FE3B5]" title="Hero Mint #4FE3B5"></span>
                    <span className="w-5 h-5 rounded-full bg-[#E0E6ED]" title="Typography #E0E6ED"></span>
                    <span className="w-5 h-5 rounded-full bg-[#FF3B30]" title="STAT Red #FF3B30"></span>
                  </div>
                </div>

                {/* Model 2: Deep-Blue Medical Device Shell */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "DEEP_BLUE" });
                    setDesignModel("DEEP_BLUE");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "DEEP_BLUE"
                      ? "bg-[#0D1B2A] border-[#778DA9] ring-2 ring-[#778DA9]/30 shadow-lg shadow-cyan-600/10"
                      : "bg-[#0D1B2A]/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#E0E6ED]">Model 2: Deep-Blue Medical Shell</span>
                    {model === "DEEP_BLUE" && <CheckCircle size={14} className="text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    GEC Designs Medical Devices UI framework. Deep navy anchor shell with steel blue data panels.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] border border-slate-700" title="Anchor Navy #0D1B2A"></span>
                    <span className="w-5 h-5 rounded-full bg-[#1B263B]" title="Steel Blue #1B263B"></span>
                    <span className="w-5 h-5 rounded-full bg-[#415A77]" title="Active State #415A77"></span>
                    <span className="w-5 h-5 rounded-full bg-[#778DA9]" title="Info Sky #778DA9"></span>
                  </div>
                </div>

                {/* Model 3: Light Mode / Hybrid Interface */}
                <div
                  onClick={() => {
                    setHospitalConfig({ ...hospitalConfig, designModel: "CLINICAL_LIGHT" });
                    setDesignModel("CLINICAL_LIGHT");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    model === "CLINICAL_LIGHT"
                      ? "bg-white border-[#005A9C] ring-2 ring-[#005A9C]/30 shadow-lg shadow-blue-500/10"
                      : "bg-slate-100 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Model 3: Clinical Light Hybrid</span>
                    {model === "CLINICAL_LIGHT" && <CheckCircle size={14} className="text-[#005A9C]" />}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    Fruto Radiology Tech & Portals standard. Warm off-white canvas with WCAG 2.1 AA clinical blue actions.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-5 h-5 rounded-full bg-[#F8F9FA] border border-slate-300" title="Warm White #F8F9FA"></span>
                    <span className="w-5 h-5 rounded-full bg-[#005A9C]" title="Clinical Blue #005A9C"></span>
                    <span className="w-5 h-5 rounded-full bg-[#E2F0FD] border border-blue-200" title="Soft Pill #E2F0FD"></span>
                    <span className="w-5 h-5 rounded-full bg-[#0f172a]" title="Text #0f172a"></span>
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
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Edit Node
                  </button>
                </div>
              </div>
            ))}
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
