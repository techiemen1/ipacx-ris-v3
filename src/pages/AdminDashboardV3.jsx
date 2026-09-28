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
  Activity
} from "lucide-react";
import PacsNodeModal from "../components/AdminPortal/PacsNodeModal";

const AdminDashboardV3 = () => {
  const [activeTab, setActiveTab] = useState("pacs_nodes"); // pacs_nodes | users | audit_logs | settings
  const [pacsNodes, setPacsNodes] = useState([]);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalStudies: 1420,
    activeNodes: 2,
    storageUsedGB: 84.5,
    systemStatus: "HEALTHY"
  });

  useEffect(() => {
    fetchPacsNodes();
  }, []);

  const fetchPacsNodes = async () => {
    setLoading(true);
    try {
      // Mock / Real API endpoint fallback for PACS nodes
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
    <div className="admin-v3-container p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="text-cyan-400" size={28} />
            iPaCX RIS/PACS v3.0 Enterprise Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">System Administration, PACS Nodes, Audit Security & Configuration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Activity size={14} className="animate-pulse" />
            System Health: {systemStats.systemStatus}
          </div>
          <button 
            onClick={fetchPacsNodes} 
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh System"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-3 mb-6 border-b border-slate-800 pb-2">
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

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "users"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Users size={18} /> Radiologists & Doctor Accounts
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === "settings"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Settings size={18} /> System Settings & DICOMweb Rules
        </button>
      </div>

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
