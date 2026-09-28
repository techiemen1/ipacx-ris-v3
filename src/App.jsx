// FILE: src/App.jsx
import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import DoctorDashboardV3 from "./pages/DoctorDashboardV3";
import AdminDashboardV3 from "./pages/AdminDashboardV3";
import MobileLiteViewerV3 from "./pages/MobileLiteViewerV3";
import { Activity, ShieldCheck, Smartphone, Layers } from "lucide-react";

const NavigationBar = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/v3/lite")) return null;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
          <Activity size={20} />
        </div>
        <div>
          <span className="font-extrabold text-white text-lg tracking-tight">iPaCX RIS/PACS</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            v3.0 Enterprise
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to="/"
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            location.pathname === "/"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Activity size={14} /> Doctor Worklist
        </Link>

        <Link
          to="/admin"
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            location.pathname === "/admin"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={14} /> Admin Governance
        </Link>

        <Link
          to="/v3/lite?study=1.3.12.2.1107.5.2.32.35109.20260928.1001"
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            location.pathname.startsWith("/v3/lite")
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Smartphone size={14} /> Mobile Viewport
        </Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavigationBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DoctorDashboardV3 />} />
          <Route path="/admin" element={<AdminDashboardV3 />} />
          <Route path="/v3/lite" element={<MobileLiteViewerV3 />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
