// FILE: src/pages/ReportsArchiveV3.jsx
import React, { useState, useEffect } from "react";
import { 
  FileCheck, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Printer, 
  Eye, 
  Download, 
  CheckCircle2, 
  Filter, 
  Sparkles, 
  ImageIcon, 
  X,
  Database
} from "lucide-react";
import api from "../api/axios";

const ReportsArchiveV3 = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFinalizedReports();
  }, []);

  const fetchFinalizedReports = async () => {
    setLoading(true);
    try {
      // Mock initial demo finalized reports list
      const demoReports = [
        {
          id: "rep_101",
          study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.1001",
          patient_mrn: "MRN-99812",
          patient_name: "CHANDRASEKHAR^V",
          patient_age: "48Y",
          patient_sex: "M",
          modality: "MR",
          study_description: "MRI BRAIN WITH CONTRAST (NEURO PROTOCOL)",
          study_date: "2026-09-28 08:30",
          status: "FINALIZED",
          signed_by: "Dr. Alexander Smith, MD",
          signed_at: "2026-09-28 09:45",
          findings: "Brain Parenchyma: Cerebral hemispheres show normal sulcal-gyral pattern. No diffusion restriction. Ventricles & Cisterns: Normal size and configuration. Brainstem & Cerebellum: Unremarkable. Impression: Unremarkable MRI Brain study.",
          impression: "1. Normal MRI Brain study. No intracranial focal mass lesion or acute infarct.",
          key_images: [
            { id: "ki_1", series_description: "T2 FLAIR AXIAL", slice_number: 14, total_slices: 32 }
          ]
        },
        {
          id: "rep_102",
          study_uid: "1.2.840.113619.2.55.3.283115102.20260928.2002",
          patient_mrn: "MRN-88102",
          patient_name: "LAKSHMI^ANAND",
          patient_age: "35Y",
          patient_sex: "F",
          modality: "CT",
          study_description: "CT CHEST HIGH RESOLUTION (HRCT PULMONARY)",
          study_date: "2026-09-28 09:15",
          status: "FINALIZED",
          signed_by: "Dr. Alexander Smith, MD",
          signed_at: "2026-09-28 10:20",
          findings: "Lungs: Clear lung fields bilaterally. Pleura: No effusion or pneumothorax. Mediastinum: Normal vascular contours.",
          impression: "1. Normal HRCT Chest examination.",
          key_images: []
        }
      ];

      setReports(demoReports);
    } catch (e) {
      console.error("Fetch reports error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.study_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMod = modalityFilter === "ALL" || r.modality === modalityFilter;
    return matchesSearch && matchesMod;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
            <FileCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight font-heading">
              Finalized Diagnostic Reports Archive
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Signed Clinical Reports • Key Images • Print & PDF Dispatch Portal
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Patient, MRN, Exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white outline-none focus:border-cyan-500 w-56"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {["ALL", "MR", "CT", "CR", "US"].map((mod) => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  modalityFilter === mod ? "bg-slate-800 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Patient Information</th>
              <th className="px-4 py-3">Modality</th>
              <th className="px-4 py-3">Examination & Date</th>
              <th className="px-4 py-3">Reporting Radiologist</th>
              <th className="px-4 py-3">Key Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredReports.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-extrabold text-white text-sm flex items-center gap-2">
                    <User size={14} className="text-cyan-400" /> {rep.patient_name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {rep.patient_mrn} • {rep.patient_age} / {rep.patient_sex}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {rep.modality}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">{rep.study_description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rep.study_date}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> {rep.signed_by}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Signed: {rep.signed_at}</div>
                </td>

                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {rep.key_images?.length || 0} Key Images
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <Eye size={13} /> View Report
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Printer size={13} /> Print PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base font-heading">{selectedReport.patient_name}</h3>
                <p className="text-xs text-cyan-400 font-mono">{selectedReport.patient_mrn} • {selectedReport.study_description}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Radiological Findings</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 mt-1 whitespace-pre-wrap">
                  {selectedReport.findings}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Diagnostic Impression</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-cyan-300 font-bold mt-1 whitespace-pre-wrap">
                  {selectedReport.impression}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-xs text-slate-400">
                <div className="font-bold text-emerald-400">Digitally Signed by: {selectedReport.signed_by}</div>
                <button onClick={() => window.print()} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                  <Printer size={14} /> Print Formal PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsArchiveV3;
