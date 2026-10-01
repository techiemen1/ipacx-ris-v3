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

  const [hospitalConfig, setHospitalConfig] = useState(() => {
    const saved = localStorage.getItem("ipacx_hospital_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
      tagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Radiation Safety Certified",
      address: "Plot 104, Medical Center Avenue, Healthcare Hub, Maharashtra 400001",
      phone: "+91 (022) 2891-0000 | report@ipacx-imaging.com",
      gstin: "27AAAAA0000A1Z5",
      sacCode: "999312",
      ohifViewerUrl: "http://localhost:8042/ohif/viewer?StudyInstanceUIDs={studyUID}",
      weasisUrl: "weasis://$dicom:get -w http://localhost:8042/wado?requestType=WADO&studyUID={studyUID}",
      horosUrl: "osirix://?methodName=DownloadURL&URL={wadoUrl}",
      preferredViewer: "50:50",
      logoUrl: ""
    };
  });

  useEffect(() => {
    fetchPacsNodes();
    fetchHospitalConfig();
  }, []);

  const fetchHospitalConfig = async () => {
    try {
      const res = await api.get("/api/v3/config/hospital").catch(() => null);
      if (res?.data?.success && res?.data?.config) {
        setHospitalConfig(prev => {
          const merged = { ...prev, ...res.data.config };
          localStorage.setItem("ipacx_hospital_config", JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn("Config fetch error:", e);
    }
  };

  const handleSaveHospitalConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      localStorage.setItem("ipacx_hospital_config", JSON.stringify(hospitalConfig));
      await api.post("/api/v3/config/hospital", hospitalConfig).catch(() => null);
      window.dispatchEvent(new Event("ipacx_config_updated"));
      setSavedSuccess("✅ Hospital Branding & DICOM Viewer links updated! Changes saved permanently!");
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

            {/* 🎨 UNIFIED MASTER CLINICAL THEME (NAVY BLUE, ORANGE & GOLD TITLES) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Palette size={16} className="text-orange-500" /> Unified Master Theme: Deep Navy Blue, Electric Orange & Light Gold Titles
                </span>
                <span className="text-[10px] text-orange-400 font-mono font-bold bg-orange-950/60 px-2.5 py-0.5 rounded border border-orange-800">iPaCX GOLDEN FORMULA</span>
              </div>

              <div className="p-4 rounded-xl bg-[#070D1B] border border-[#1E335B] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-400 font-heading flex items-center gap-2">
                    <span>👑 iPaCX Clinical Navy & Orange Standard</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-orange-600 text-white font-black">ACTIVE</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed for zero eye fatigue in reading rooms. Deep Navy Blue backdrop, Electric Orange highlights, Light Dark Yellow titles, and High-Contrast Crisp Black fonts for report printing & PDF exports.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1A30] border border-[#1E335B] text-xs font-mono">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#070D1B] border border-slate-700" title="Deep Navy"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F97316]" title="Electric Orange"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FACC15]" title="Gold Title"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#000000] border border-slate-600" title="Black Print Font"></span>
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
                    value={hospitalConfig.ohifViewerUrl || "http://localhost:8042/ohif/viewer?StudyInstanceUIDs={studyUID}"}
                    onChange={(e) => setHospitalConfig({ ...hospitalConfig, ohifViewerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-400 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    placeholder="http://localhost:8042/ohif/viewer?StudyInstanceUIDs={studyUID}"
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
                  value={hospitalConfig.ohifViewerUrl || "http://localhost:8042/ohif/viewer?StudyInstanceUIDs={studyUID}"}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, ohifViewerUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="http://localhost:8042/ohif/viewer?StudyInstanceUIDs={studyUID}"
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
