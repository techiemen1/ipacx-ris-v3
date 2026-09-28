// FILE: src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import DoctorDashboardV3 from "./pages/DoctorDashboardV3";
import AdminDashboardV3 from "./pages/AdminDashboardV3";
import MobileLiteViewerV3 from "./pages/MobileLiteViewerV3";
import PatientRegistrationV3 from "./pages/PatientRegistrationV3";
import BillingPortalV3 from "./pages/BillingPortalV3";
import MwlManagerV3 from "./pages/MwlManagerV3";
import LoginV3 from "./pages/LoginV3";
import HrUserManagementV3 from "./pages/HrUserManagementV3";
import UniversalAdvancedReportV3 from "./pages/UniversalAdvancedReportV3";
import DoctorSignatureManagerV3 from "./components/DoctorWorkstation/DoctorSignatureManagerV3";
import { Activity, ShieldCheck, Smartphone, UserPlus, CreditCard, Radio, Users, LogIn, LogOut, User, PenTool } from "lucide-react";

const NavigationBar = ({ currentUser, onLogout, onOpenSignatureModal }) => {
  const location = useLocation();
  if (location.pathname.startsWith("/v3/lite") || location.pathname === "/login" || location.pathname.startsWith("/advanced-report")) return null;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30">
          <Activity size={20} />
        </div>
        <div>
          <span className="font-extrabold text-white text-lg tracking-tight">iPaCX RIS/PACS</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            v3.0 Enterprise
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Activity size={14} /> Worklist
        </Link>

        <Link
          to="/patient-registration"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/patient-registration"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus size={14} /> Reception Desk
        </Link>

        <Link
          to="/billing"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/billing"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard size={14} /> Billing & UPI QR
        </Link>

        <Link
          to="/mwl-manager"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/mwl-manager"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Radio size={14} /> Technician MWL
        </Link>

        <Link
          to="/hr-users"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/hr-users"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Users size={14} /> HR Roster
        </Link>

        <Link
          to="/admin"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            location.pathname === "/admin"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "bg-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={14} /> Admin
        </Link>

        {/* Doctor Signature Launcher */}
        <button
          onClick={onOpenSignatureModal}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <PenTool size={14} /> Signature & QR
        </button>

        {/* User Profile Badge */}
        <div className="pl-3 border-l border-slate-800 flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              <User size={14} className="text-cyan-400" />
              <div className="text-left">
                <div className="text-[11px] font-bold text-white leading-tight">{currentUser.fullName}</div>
                <div className="text-[9px] font-mono text-cyan-400">{currentUser.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
            >
              <LogIn size={14} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState({
    username: "dr.smith",
    fullName: "Dr. Alexander Smith, MD",
    role: "RADIOLOGIST",
    medicalLicense: "NMC-MH-2012-08819"
  });

  const [showSigModal, setShowSigModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavigationBar
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenSignatureModal={() => setShowSigModal(true)}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DoctorDashboardV3 />} />
          <Route path="/login" element={<LoginV3 onLoginSuccess={(u) => setCurrentUser(u)} />} />
          <Route path="/patient-registration" element={<PatientRegistrationV3 />} />
          <Route path="/billing" element={<BillingPortalV3 />} />
          <Route path="/mwl-manager" element={<MwlManagerV3 />} />
          <Route path="/hr-users" element={<HrUserManagementV3 />} />
          <Route path="/admin" element={<AdminDashboardV3 />} />
          <Route path="/advanced-report" element={<UniversalAdvancedReportV3 />} />
          <Route path="/v3/lite" element={<MobileLiteViewerV3 />} />
        </Routes>

        {showSigModal && (
          <DoctorSignatureManagerV3
            doctorUser={currentUser}
            onClose={() => setShowSigModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
