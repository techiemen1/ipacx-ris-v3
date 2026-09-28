// FILE: src/pages/DoctorDashboardV3.jsx
import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Smartphone, 
  Calendar, 
  User, 
  Activity, 
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";
import DiagnosticWorkstationV3 from "../components/DoctorWorkstation/DiagnosticWorkstationV3";

const DoctorDashboardV3 = () => {
  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showWorkstation, setShowWorkstation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      // Mock / Real API Studies list for v3
      const mockStudies = [
        {
          id: "std_1",
          study_uid: "1.3.12.2.1107.5.2.32.35109.20260928.1001",
          patient_mrn: "MRN-99812",
          patient_name: "CHANDRASEKHAR^V",
          modality: "MR",
          study_description: "MRI BRAIN WITH CONTRAST",
          study_date: "2026-09-28",
          total_series: 4,
          total_instances: 156,
          status: "UNREPORTED"
        },
        {
          id: "std_2",
          study_uid: "1.2.840.113619.2.55.3.283115102.20260928.2002",
          patient_mrn: "MRN-88102",
          patient_name: "LAKSHMI^ANAND",
          modality: "CT",
          study_description: "CT CHEST HIGH RESOLUTION (HRCT)",
          study_date: "2026-09-28",
          total_series: 3,
          total_instances: 220,
          status: "DRAFT"
        },
        {
          id: "std_3",
          study_uid: "1.2.392.200036.9125.2.2.20260928.3003",
          patient_mrn: "MRN-77192",
          patient_name: "RAMESH^KUMAR",
          modality: "CR",
          study_description: "CHEST PA VIEW",
          study_date: "2026-09-28",
          total_series: 1,
          total_instances: 1,
          status: "FINALIZED"
        }
      ];
      setStudies(mockStudies);
    } catch (err) {
      console.error("Failed to load studies:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase()) || s.study_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === "ALL" || s.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  return (
    <div className="doctor-v3-container p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Activity className="text-cyan-400" size={28} />
            Diagnostic Worklist Portal (v3.0)
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time DICOM Worklist, AI-Assisted Radiology Studio & Key Image Capture</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Dr. Radiologist (On Duty)
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 w-full md:w-80">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search Patient Name, MRN, Exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400 uppercase font-semibold">Modality:</span>
          {["ALL", "MR", "CT", "CR", "US"].map((mod) => (
            <button
              key={mod}
              onClick={() => setModalityFilter(mod)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                modalityFilter === mod ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Worklist Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Patient Info</th>
              <th className="px-4 py-3">Modality</th>
              <th className="px-4 py-3">Study Description</th>
              <th className="px-4 py-3">Slices / Series</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudies.map((study) => (
              <tr key={study.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-white flex items-center gap-2">
                    <User size={14} className="text-cyan-400" /> {study.patient_name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{study.patient_mrn}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${
                    study.modality === "MR" ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                    study.modality === "CT" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" :
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {study.modality}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-200">{study.study_description}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {study.total_instances} Slices ({study.total_series} Series)
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                    study.status === "FINALIZED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                    study.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                    "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {study.status === "FINALIZED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {study.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => { setSelectedStudy(study); setShowWorkstation(true); }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                  >
                    <FileText size={14} /> Report Studio
                  </button>

                  <a
                    href={`/v3/lite?study=${study.study_uid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Smartphone size={14} /> Mobile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Workstation Modal */}
      {showWorkstation && selectedStudy && (
        <DiagnosticWorkstationV3
          study={selectedStudy}
          onClose={() => setShowWorkstation(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboardV3;
