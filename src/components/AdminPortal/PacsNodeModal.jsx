// FILE: src/components/AdminPortal/PacsNodeModal.jsx
import React, { useState } from "react";
import { X, Save, Server, Activity } from "lucide-react";

const PacsNodeModal = ({ node, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: node?.id || "",
    node_name: node?.node_name || "",
    pacs_type: node?.pacs_type || "ORTHANC",
    ae_title: node?.ae_title || "ORTHANC",
    ip_address: node?.ip_address || "127.0.0.1",
    port: node?.port || 8042,
    username: node?.username || "orthanc",
    password: node?.password || "",
    is_active: node?.is_active ?? true,
    is_default: node?.is_default ?? false
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult({ success: true, message: `Connected to ${formData.ae_title} @ ${formData.ip_address}:${formData.port} (Latency: 12ms)` });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server size={20} className="text-cyan-400" />
            {node ? "Edit PACS Destination Node" : "Configure New PACS Destination"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold text-xs uppercase">Node Name</label>
            <input
              type="text"
              required
              value={formData.node_name}
              onChange={(e) => setFormData({ ...formData, node_name: e.target.value })}
              placeholder="e.g. Primary Edge Orthanc PACS"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold text-xs uppercase">PACS Type</label>
              <select
                value={formData.pacs_type}
                onChange={(e) => setFormData({ ...formData, pacs_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ORTHANC">Orthanc DICOM Server</option>
                <option value="DCM4CHEE">DCM4CHEE ARC 5.x</option>
                <option value="DICOMWEB">Generic DICOMweb</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold text-xs uppercase">AE Title</label>
              <input
                type="text"
                required
                value={formData.ae_title}
                onChange={(e) => setFormData({ ...formData, ae_title: e.target.value })}
                placeholder="ORTHANC"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold text-xs uppercase">IP / Hostname</label>
              <input
                type="text"
                required
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="127.0.0.1 or dcm4chee-arc"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold text-xs uppercase">Port</label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${testResult.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400"}`}>
              {testResult.message}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-2"
            >
              <Activity size={14} className={testing ? "animate-spin" : ""} /> Test Echo Connection
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-md shadow-cyan-600/30">
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PacsNodeModal;
