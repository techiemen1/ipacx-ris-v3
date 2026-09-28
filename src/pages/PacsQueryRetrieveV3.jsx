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
  Layers
} from "lucide-react";
import api from "../api/axios";

const PacsQueryRetrieveV3 = () => {
  const [nodes, setNodes] = useState([
    { id: "node_1", aet: "ORTHANC_PACS", host: "localhost", port: 8043, protocol: "C-FIND / DICOM WEB", status: "ONLINE", speed: "1 Gbps" },
    { id: "node_2", aet: "DCM4CHEE_ARC", host: "192.168.1.120", port: 8080, protocol: "DICOM C-STORE", status: "ONLINE", speed: "10 Gbps" },
    { id: "node_3", aet: "GE_CENTRICITY", host: "10.0.4.15", port: 104, protocol: "C-MOVE / DIMSE", status: "STANDBY", speed: "1 Gbps" },
    { id: "node_4", aet: "SIEMENS_VA20", host: "10.0.4.22", port: 104, protocol: "C-MOVE / DIMSE", status: "ONLINE", speed: "10 Gbps" }
  ]);

  const [selectedNode, setSelectedNode] = useState("node_1");
  const [searchParams, setSearchParams] = useState({
    patientName: "",
    patientMrn: "",
    accession: "",
    modality: "ALL",
    dateRange: "TODAY"
  });

  const [pacsResults, setPacsResults] = useState([
    {
      id: "pacs_101",
      study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.1001",
      patient_mrn: "MRN-99812",
      patient_name: "CHANDRASEKHAR^V",
      modality: "MR",
      study_description: "MRI BRAIN WITH CONTRAST (NEURO PROTOCOL)",
      study_date: "2026-09-28 08:30",
      series_count: 6,
      instances_count: 184,
      node_source: "ORTHANC_PACS",
      fetch_status: "IN_LOCAL_PACS" // IN_LOCAL_PACS | FETCHING | AVAILABLE
    },
    {
      id: "pacs_102",
      study_uid: "1.2.840.113619.2.55.3.283115102.20260928.2002",
      patient_mrn: "MRN-88102",
      patient_name: "LAKSHMI^ANAND",
      modality: "CT",
      study_description: "CT CHEST HIGH RESOLUTION (HRCT PULMONARY)",
      study_date: "2026-09-28 09:15",
      series_count: 4,
      instances_count: 240,
      node_source: "DCM4CHEE_ARC",
      fetch_status: "IN_LOCAL_PACS"
    },
    {
      id: "pacs_103",
      study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.9009",
      patient_mrn: "MRN-55201",
      patient_name: "RAJESH^VERMA",
      modality: "CT",
      study_description: "CT ANGIOGRAPHY CORONARY ARTERIES",
      study_date: "2026-09-28 10:45",
      series_count: 8,
      instances_count: 512,
      node_source: "SIEMENS_VA20",
      fetch_status: "AVAILABLE"
    },
    {
      id: "pacs_104",
      study_uid: "1.2.392.200036.9125.2.2.20260928.8008",
      patient_mrn: "MRN-44109",
      patient_name: "SUNITA^PATEL",
      modality: "MR",
      study_description: "MRI WHOLE SPINE WITH STIR PROTOCOL",
      study_date: "2026-09-28 11:10",
      series_count: 5,
      instances_count: 210,
      node_source: "GE_CENTRICITY",
      fetch_status: "AVAILABLE"
    }
  ]);

  const [fetchingIds, setFetchingIds] = useState({});
  const [searching, setSearching] = useState(false);

  const handleExecuteCFind = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
    }, 600);
  };

  const handleTriggerCMove = (studyId) => {
    setFetchingIds(prev => ({ ...prev, [studyId]: 10 }));
    let progress = 10;
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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* 🌟 PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
            <Server size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
              PACS Query / Retrieve & DICOM Fetching Gateway
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Multi-Node C-FIND SCP & C-MOVE Routing Engine • Hybrid DICOM 3.0 Node Proxy
            </p>
          </div>
        </div>

        <button 
          onClick={handleExecuteCFind}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <RefreshCw size={15} className={searching ? "animate-spin" : ""} />
          <span>Execute C-FIND Ping</span>
        </button>
      </div>

      {/* 🖥️ CONNECTED DICOM NODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {nodes.map(node => (
          <div 
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedNode === node.id 
                ? "bg-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-500/10" 
                : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white font-mono">{node.aet}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                node.status === "ONLINE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                {node.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {node.host}:{node.port} • {node.protocol}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
              <Radio size={12} className="text-cyan-400" /> Speed: {node.speed}
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 C-FIND SEARCH QUERY FORM */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
          <Filter size={14} className="text-cyan-400" /> C-FIND Search Query Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Patient Name</label>
            <input 
              type="text"
              placeholder="e.g. CHANDRASEKHAR"
              value={searchParams.patientName}
              onChange={(e) => setSearchParams({ ...searchParams, patientName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Patient MRN</label>
            <input 
              type="text"
              placeholder="e.g. MRN-99812"
              value={searchParams.patientMrn}
              onChange={(e) => setSearchParams({ ...searchParams, patientMrn: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Modality</label>
            <select 
              value={searchParams.modality}
              onChange={(e) => setSearchParams({ ...searchParams, modality: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="ALL">All Modalities</option>
              <option value="MR">MR - Magnetic Resonance</option>
              <option value="CT">CT - Computed Tomography</option>
              <option value="CR">CR / DX - X-Ray</option>
              <option value="US">US - Ultrasound</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Date Range</label>
            <select 
              value={searchParams.dateRange}
              onChange={(e) => setSearchParams({ ...searchParams, dateRange: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="TODAY">Today (2026-09-28)</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Date</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleExecuteCFind}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Search size={14} /> Query DICOM Nodes
            </button>
          </div>
        </div>
      </div>

      {/* 📊 PACS QUERY RESULTS LIST TABLE */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <Database size={15} className="text-cyan-400" /> PACS Query Results ({pacsResults.length} Studies Found)
          </div>
          <span className="text-[11px] font-mono text-slate-400">Target Node: ORTHANC_PACS (Port 8043)</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-4">Patient Information</th>
              <th className="px-5 py-4">Modality</th>
              <th className="px-5 py-4">Examination Description</th>
              <th className="px-5 py-4">Series / Instances</th>
              <th className="px-5 py-4">Source Node</th>
              <th className="px-5 py-4">Retrieve Status</th>
              <th className="px-5 py-4 text-right">C-MOVE & View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {pacsResults.map(item => {
              const isFetching = fetchingIds[item.id] !== undefined;
              const fetchPercent = fetchingIds[item.id] || 0;

              return (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-white text-sm">{item.patient_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.patient_mrn}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {item.modality}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-200">{item.study_description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.study_date}</div>
                  </td>

                  <td className="px-5 py-4 font-mono text-slate-400">
                    {item.instances_count} Slices ({item.series_count} Series)
                  </td>

                  <td className="px-5 py-4 font-mono text-cyan-300 text-xs">
                    {item.node_source}
                  </td>

                  <td className="px-5 py-4">
                    {isFetching ? (
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[10px] font-extrabold text-cyan-400">
                          <span>Fetching...</span>
                          <span>{fetchPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${fetchPercent}%` }} />
                        </div>
                      </div>
                    ) : item.fetch_status === "IN_LOCAL_PACS" ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1 w-max">
                        <CheckCircle2 size={12} /> In Local PACS
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold flex items-center gap-1 w-max">
                        <Clock size={12} /> Available on Node
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right space-x-2">
                    {item.fetch_status === "AVAILABLE" && !isFetching && (
                      <button 
                        onClick={() => handleTriggerCMove(item.id)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                      >
                        <Download size={13} /> C-MOVE Fetch
                      </button>
                    )}

                    <a 
                      href={`/v3/lite?study=${item.study_uid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <Eye size={13} /> Instant DICOM View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PacsQueryRetrieveV3;
