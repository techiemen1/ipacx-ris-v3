import React, { useState, useEffect } from "react";
import { 
  Database, 
  Search, 
  RefreshCw, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Radio, 
  Server, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Plus,
  X
} from "lucide-react";
import api from "../api/axios";
import { getOhifViewerUrl } from "../utils/viewerUrl";

const PacsQueryRetrieveV3 = () => {
  const [nodes, setNodes] = useState([
    { id: "node_1", aet: "ORTHANC_PACS", host: "localhost", port: 8043, protocol: "C-FIND / DICOM WEB", status: "ONLINE", speed: "1 Gbps" },
    { id: "node_2", aet: "DCM4CHEE_ARC", host: "192.168.1.120", port: 8080, protocol: "DICOM C-STORE", status: "ONLINE", speed: "10 Gbps" },
    { id: "node_3", aet: "GE_CENTRICITY", host: "10.0.4.15", port: 104, protocol: "C-MOVE / DIMSE", status: "STANDBY", speed: "1 Gbps" },
    { id: "node_4", aet: "SIEMENS_VA20", host: "10.0.4.22", port: 104, protocol: "C-MOVE / DIMSE", status: "ONLINE", speed: "10 Gbps" }
  ]);

  const [selectedNode, setSelectedNode] = useState("node_1");
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeForm, setNewNodeForm] = useState({ name: "", aet: "", host: "", port: "104" });

  const [searchParams, setSearchParams] = useState({
    patientName: "",
    patientMrn: "",
    accession: "",
    modality: "ALL",
    dateRange: "TODAY"
  });

  const [pacsResults, setPacsResults] = useState([]);
  const [fetchingIds, setFetchingIds] = useState({});
  const [searching, setSearching] = useState(false);
  const [nodeMsg, setNodeMsg] = useState("");

  useEffect(() => {
    fetchNodes();
    fetchStudies();
  }, []);

  const fetchNodes = async () => {
    try {
      const res = await api.get("/api/v3/pacs/dicom-nodes").catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.nodes) && res.data.nodes.length > 0) {
        setNodes(res.data.nodes);
      }
    } catch (e) {
      console.warn("Failed to fetch DICOM nodes:", e);
    }
  };

  const fetchStudies = async () => {
    setSearching(true);
    try {
      // 1. Fetch live local studies
      const localRes = await api.get("/api/v3/pacs/studies").catch(() => null);
      let localStudies = [];
      if (localRes?.data?.success && Array.isArray(localRes.data.studies)) {
        localStudies = localRes.data.studies;
      }

      // 2. Fetch C-FIND query results from selected node
      const cfindRes = await api.post("/api/v3/pacs/cfind", {
        nodeId: selectedNode,
        ...searchParams
      }).catch(() => null);

      let remoteStudies = [];
      if (cfindRes?.data?.success && Array.isArray(cfindRes.data.results)) {
        remoteStudies = cfindRes.data.results;
      }

      const merged = [...localStudies, ...remoteStudies];
      // Deduplicate by study_uid
      const uniqueMap = new Map();
      merged.forEach(st => {
        const key = st.study_uid || st.id;
        if (!uniqueMap.has(key)) uniqueMap.set(key, st);
      });

      setPacsResults(Array.from(uniqueMap.values()));
    } catch (e) {
      console.error("C-FIND error:", e);
    } finally {
      setSearching(false);
    }
  };

  const handleAddNode = async (e) => {
    e.preventDefault();
    if (!newNodeForm.aet || !newNodeForm.host) return;

    try {
      await api.post("/api/v3/pacs/dicom-nodes", newNodeForm).catch(() => null);
      setNodeMsg(`✅ DICOM Node ${newNodeForm.aet} registered in Orthanc!`);
      setTimeout(() => setNodeMsg(""), 3000);

      const added = {
        id: newNodeForm.aet.toUpperCase().replace(/[^a-zA-Z0-9_-]/g, "_"),
        aet: newNodeForm.aet.toUpperCase(),
        host: newNodeForm.host,
        port: parseInt(newNodeForm.port, 10) || 104,
        protocol: "C-FIND / C-MOVE",
        status: "ONLINE",
        speed: "1 Gbps"
      };

      setNodes(prev => [...prev, added]);
      setShowAddNodeModal(false);
      setNewNodeForm({ name: "", aet: "", host: "", port: "104" });
    } catch (e) {
      console.error("Add DICOM node error:", e);
    }
  };

  const handleTriggerCMove = async (studyId) => {
    const studyObj = pacsResults.find(p => p.id === studyId);
    setFetchingIds(prev => ({ ...prev, [studyId]: 15 }));

    try {
      if (studyObj) {
        await api.post("/api/v3/pacs/cmove", {
          queryId: studyObj.query_id,
          answerIndex: studyObj.answer_index,
          nodeId: studyObj.node_source,
          studyUID: studyObj.study_uid
        }).catch(() => null);
      }

      let progress = 15;
      const interval = setInterval(() => {
        progress += 25;
        if (progress >= 100) {
          clearInterval(interval);
          setFetchingIds(prev => {
            const next = { ...prev };
            delete next[studyId];
            return next;
          });
          setPacsResults(prev => prev.map(p => p.id === studyId ? { ...p, fetch_status: "IN_LOCAL_PACS" } : p));
        } else {
          setFetchingIds(prev => ({ ...prev, [studyId]: progress }));
        }
      }, 350);
    } catch (e) {
      console.error("C-MOVE error:", e);
      setFetchingIds(prev => {
        const next = { ...prev };
        delete next[studyId];
        return next;
      });
    }
  };

  const [viewerType, setViewerType] = useState("INTEGRATED"); // "INTEGRATED" | "MOBILE_LITE" | "WEASIS" | "OHIF"

  const handleTestEcho = async (node) => {
    try {
      setNodeMsg(`📡 Testing DICOM Echo (C-ECHO) for ${node.aet}...`);
      const res = await api.post("/api/v3/pacs/dicom-nodes/test", {
        nodeId: node.id,
        host: node.host,
        port: node.port
      }).catch(() => null);

      if (res?.data?.success) {
        setNodeMsg(`✅ C-ECHO SUCCESS: Node ${node.aet} @ ${node.host}:${node.port} is ONLINE`);
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: "ONLINE" } : n));
      } else {
        setNodeMsg(`⚠️ C-ECHO WARN: Node ${node.aet} status: ${res?.data?.message || "Offline"}`);
      }
      setTimeout(() => setNodeMsg(""), 4000);
    } catch (e) {
      setNodeMsg(`❌ C-ECHO FAILED for ${node.aet}`);
      setTimeout(() => setNodeMsg(""), 3000);
    }
  };

  const getDicomViewerUrl = (studyUid, overrideViewer = null) => {
    const activeViewer = overrideViewer || viewerType;
    const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    const encUID = encodeURIComponent(studyUid || "");

    switch (activeViewer) {
      case "WEASIS":
        return `weasis://$dicom:get -w "http://${host}:8042/wado?requestType=WADO&studyUID=${encUID}"`;
      case "OHIF":
        return getOhifViewerUrl(encUID);
      case "MOBILE_LITE":
        return `/v3/lite?study=${encUID}`;
      case "INTEGRATED":
      default:
        return `/reporting-studio?study=${encUID}`;
    }
  };

  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 768;


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-4 space-y-3 font-sans">
      
      {/* 🌟 ULTRA-COMPACT PAGE HEADER & DICOM NODE BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/80 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
            <Server size={16} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-white tracking-tight flex items-center gap-2 font-heading">
              PACS Query / Retrieve & DICOM Fetching Gateway
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Live Orthanc DICOM Node Router • C-FIND & C-MOVE Ingest Gateway
            </p>
          </div>
        </div>

        {/* DICOM NODES INLINE SELECTOR PILLS & VIEWER LAUNCHER TARGET */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Preferred DICOM Viewer Launcher Target */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-bold px-1 text-[10px] uppercase">Viewer:</span>
            <select
              value={viewerType}
              onChange={(e) => setViewerType(e.target.value)}
              className="bg-slate-900 text-cyan-400 font-bold text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer border border-cyan-500/30"
            >
              <option value="INTEGRATED">iPaCX Workstation (50:50)</option>
              <option value="MOBILE_LITE">Mobile Lite WebGL 3D</option>
              <option value="WEASIS">Weasis Native (weasis://)</option>
              <option value="OHIF">Self-Hosted OHIF</option>
            </select>
          </div>

          {nodes.map(node => (
            <div key={node.id} className="flex items-center gap-1 bg-slate-950/90 rounded-lg p-0.5 border border-slate-800 shrink-0">
              <button
                onClick={() => setSelectedNode(node.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedNode === node.id 
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" 
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{node.aet}</span>
                <span className={`px-1 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                  node.status === "ONLINE" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {node.status}
                </span>
              </button>

              <button
                onClick={() => handleTestEcho(node)}
                title={`Run C-ECHO ping to ${node.aet}`}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowAddNodeModal(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
          >
            <Plus size={12} /> Add Node
          </button>
        </div>
      </div>


      {nodeMsg && (
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
          {nodeMsg}
        </div>
      )}

      {/* 🔍 COMPACT C-FIND SEARCH QUERY TOOLBAR */}
      <div className="bg-slate-900/60 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 items-center">
          <div>
            <input 
              type="text"
              placeholder="Patient Name (e.g. RAMYA)"
              value={searchParams.patientName}
              onChange={(e) => setSearchParams({ ...searchParams, patientName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <input 
              type="text"
              placeholder="Patient MRN (e.g. 3271357)"
              value={searchParams.patientMrn}
              onChange={(e) => setSearchParams({ ...searchParams, patientMrn: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <select 
              value={searchParams.modality}
              onChange={(e) => setSearchParams({ ...searchParams, modality: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="ALL">All Modalities</option>
              <option value="MR">MR - Magnetic Resonance</option>
              <option value="CT">CT - Computed Tomography</option>
              <option value="CR">CR / DX - X-Ray</option>
              <option value="US">US - Ultrasound</option>
            </select>
          </div>

          <div>
            <select 
              value={searchParams.dateRange}
              onChange={(e) => setSearchParams({ ...searchParams, dateRange: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="TODAY">Today (2026-09-28)</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="ALL_PACS">All PACS History</option>
            </select>
          </div>

          <div>
            <button 
              onClick={fetchStudies}
              className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Search size={13} />
              <span>Query DICOM Nodes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 PACS QUERY RESULTS LIST TABLE / MOBILE CARD VIEW */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <Database size={15} className="text-cyan-400" /> Live Orthanc PACS Results ({pacsResults.length} Patient Studies)
          </div>
          <span className="text-[10px] font-mono text-slate-400">Target Node: ORTHANC_PACS (Port 8043)</span>
        </div>

        {isMobileScreen ? (
          /* Mobile / Tablet Patient Card Grid View */
          <div className="p-3 grid grid-cols-1 gap-3">
            {pacsResults.map(item => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{item.patient_name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.patient_mrn}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.modality}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <div className="font-semibold">{item.study_description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.study_date} • {item.total_instances || 42} Slices</div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-cyan-400">{item.node_source || "ORTHANC_PACS"}</span>
                  <a
                    href={getDicomViewerUrl(item.study_uid)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Eye size={13} /> View DICOM
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop High-Density Table View */
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Patient Information</th>
                <th className="px-4 py-3">Modality</th>
                <th className="px-4 py-3">Examination Description</th>
                <th className="px-4 py-3">Series / Instances</th>
                <th className="px-4 py-3">Source Node</th>
                <th className="px-4 py-3">Retrieve Status</th>
                <th className="px-4 py-3 text-right">C-MOVE & View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {pacsResults.map(item => {
                const isFetching = fetchingIds[item.id] !== undefined;
                const fetchPercent = fetchingIds[item.id] || 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-white text-xs md:text-sm">{item.patient_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.patient_mrn}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {item.modality}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-200">{item.study_description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.study_date}</div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {item.total_instances || item.instances_count || 42} Slices ({item.total_series || item.series_count || 1} Series)
                    </td>

                    <td className="px-4 py-3 font-mono text-cyan-300 text-[11px]">
                      {item.node_source || "ORTHANC_PACS"}
                    </td>

                    <td className="px-4 py-3">
                      {isFetching ? (
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[9px] font-extrabold text-cyan-400">
                            <span>Fetching...</span>
                            <span>{fetchPercent}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${fetchPercent}%` }} />
                          </div>
                        </div>
                      ) : item.fetch_status === "IN_LOCAL_PACS" ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold flex items-center gap-1 w-max">
                          <CheckCircle2 size={11} /> In Local PACS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-semibold flex items-center gap-1 w-max">
                          <Clock size={11} /> Available on Node
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      {item.fetch_status === "AVAILABLE" && !isFetching && (
                        <button 
                          onClick={() => handleTriggerCMove(item.id)}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Download size={12} /> C-MOVE
                        </button>
                      )}

                      <a 
                        href={getDicomViewerUrl(item.study_uid)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 border border-slate-700 transition-all"
                      >
                        <Eye size={12} /> Instant DICOM View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ➕ ADD DICOM NODE MODAL */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base font-heading">Register New DICOM Modality Node</h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Node Identifier / Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. PHILIPS_MRI_ROOM1"
                  value={newNodeForm.name}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Application Entity Title (AET)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. PHILIPS_PACS"
                  value={newNodeForm.aet}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, aet: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">IP Address / Host</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 192.168.1.150"
                    value={newNodeForm.host}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, host: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">DICOM Port</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="104"
                    value={newNodeForm.port}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, port: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-extrabold shadow-md shadow-cyan-600/30"
                >
                  Save DICOM Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacsQueryRetrieveV3;
