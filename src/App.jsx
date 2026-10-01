// FILE: src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import PacsQueryRetrieveV3 from "./pages/PacsQueryRetrieveV3";
import ReportsArchiveV3 from "./pages/ReportsArchiveV3";
import { Activity, ShieldCheck, Smartphone, UserPlus, CreditCard, Radio, Users, LogIn, LogOut, User, PenTool, Database, FileCheck, Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "./utils/ThemeContext";

const NavigationBar = ({ currentUser, onLogout, onOpenSignatureModal }) => {
  const location = useLocation();
  const { model, cycleDesignModel, isLight } = useTheme();

  if (location.pathname.startsWith("/v3/lite") || location.pathname === "/login" || location.pathname.startsWith("/advanced-report")) return null;

  const role = currentUser ? (currentUser.role || "RADIOLOGIST").toUpperCase() : "";

  const showWorklist = !!currentUser;
  const showPacsNodes = role === "RADIOLOGIST" || role === "TECHNICIAN" || role === "ADMIN";
  const showReports = role === "RADIOLOGIST" || role === "BILLING" || role === "ADMIN";
  const showReception = role === "BILLING" || role === "ADMIN";
  const showBilling = role === "BILLING" || role === "ADMIN";
  const showMwl = role === "TECHNICIAN" || role === "ADMIN";
  const showHr = role === "HR_MANAGER" || role === "ADMIN";
  const showAdmin = role === "ADMIN";
  const showSig = role === "RADIOLOGIST" || role === "ADMIN";

  return (
    <nav className={`${isLight ? "bg-white/90 border-slate-200 text-slate-800" : "bg-slate-900/95 border-slate-800/80 text-slate-100"} backdrop-blur-md border-b px-3 md:px-6 py-2 flex flex-wrap justify-between items-center sticky top-0 z-40 gap-2 transition-colors`}>
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
          <Activity size={18} />
        </div>
        <div>
          <span className={`font-extrabold text-sm md:text-base tracking-tight font-heading ${isLight ? "text-slate-900" : "text-white"}`}>iPaCX RIS/PACS</span>
          <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hidden sm:inline-block">
            v3.0
          </span>
        </div>
      </Link>

      {/* Navigation Links Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none shrink-0">
        {showWorklist && (
          <Link
            to="/"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={13} /> <span>Worklist</span>
          </Link>
        )}

        {showPacsNodes && (
          <Link
            to="/pacs-nodes"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/pacs-nodes"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Database size={13} /> <span>PACS Nodes</span>
          </Link>
        )}

        {showReports && (
          <Link
            to="/reports"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/reports"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <FileCheck size={13} /> <span>Finalized Reports</span>
          </Link>
        )}

        {showReception && (
          <Link
            to="/patient-registration"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/patient-registration"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus size={13} /> <span>Reception</span>
          </Link>
        )}

        {showBilling && (
          <Link
            to="/billing"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/billing"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard size={13} /> <span>Billing & QR</span>
          </Link>
        )}

        {showMwl && (
          <Link
            to="/mwl-manager"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/mwl-manager"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Radio size={13} /> <span>Technician MWL</span>
          </Link>
        )}

        {showHr && (
          <Link
            to="/hr-users"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/hr-users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Users size={13} /> <span>HR Roster</span>
          </Link>
        )}

        {showAdmin && (
          <Link
            to="/admin"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
              location.pathname === "/admin"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={13} /> <span>Admin</span>
          </Link>
        )}

        {showSig && (
          <button
            onClick={onOpenSignatureModal}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              isLight ? "bg-slate-100 border border-slate-300 text-cyan-700 hover:border-cyan-500" : "bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-500"
            }`}
          >
            <PenTool size={13} /> <span>Signature & QR</span>
          </button>
        )}

        {/* 3-MODEL DYNAMIC DESIGN TOGGLE SWITCHER */}
        <button
          onClick={cycleDesignModel}
          title={`Active Design Model: ${model}. Click to cycle models.`}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            isLight
              ? "bg-amber-500/10 text-amber-700 border-amber-300 hover:bg-amber-500/20"
              : model === "PITCH_BLACK"
              ? "bg-[#4FE3B5]/10 text-[#4FE3B5] border-[#4FE3B5]/30 hover:bg-[#4FE3B5]/20"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
          }`}
        >
          {isLight ? (
            <Sun size={14} className="text-amber-600" />
          ) : model === "PITCH_BLACK" ? (
            <Moon size={14} className="text-[#4FE3B5]" />
          ) : (
            <Moon size={14} className="text-cyan-400" />
          )}
          <span className="hidden sm:inline">
            {model === "PITCH_BLACK" ? "Pitch-Black" : model === "CLINICAL_LIGHT" ? "Clinical Light" : "Deep-Blue"}
          </span>
        </button>

        {/* User Profile / Logout Badge */}
        <div className="pl-2 border-l border-slate-300 dark:border-slate-800 flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border ${isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"}`}>
              <User size={13} className="text-cyan-600 dark:text-cyan-400" />
              <div className={`text-xs font-extrabold leading-tight max-w-[140px] truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                {currentUser.fullName || currentUser.username}
              </div>
              <button
                onClick={onLogout}
                className="ml-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-600/30 shrink-0"
            >
              <LogIn size={14} /> <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const MainAppContent = () => {
  const navigate = useNavigate();
  const { model, isLight } = useTheme();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("ipacx_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [showSigModal, setShowSigModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("ipacx_user");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isLight ? "bg-[#F8F9FA] text-slate-900" : model === "PITCH_BLACK" ? "bg-black text-[#E0E6ED]" : "bg-[#0D1B2A] text-[#E0E6ED]"}`}>
      <NavigationBar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSignatureModal={() => setShowSigModal(true)}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={currentUser ? <DoctorDashboardV3 /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginV3 onLoginSuccess={(u) => setCurrentUser(u)} />} />
          <Route path="/patient-registration" element={currentUser ? <PatientRegistrationV3 /> : <Navigate to="/login" replace />} />
          <Route path="/billing" element={currentUser ? <BillingPortalV3 /> : <Navigate to="/login" replace />} />
          <Route path="/mwl-manager" element={currentUser ? <MwlManagerV3 /> : <Navigate to="/login" replace />} />
          <Route path="/hr-users" element={currentUser ? <HrUserManagementV3 /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={currentUser ? <AdminDashboardV3 /> : <Navigate to="/login" replace />} />
          <Route path="/pacs-nodes" element={currentUser ? <PacsQueryRetrieveV3 /> : <Navigate to="/login" replace />} />
          <Route path="/reports" element={currentUser ? <ReportsArchiveV3 /> : <Navigate to="/login" replace />} />
          <Route path="/advanced-report" element={<UniversalAdvancedReportV3 />} />
          <Route path="/v3/lite" element={<MobileLiteViewerV3 />} />
        </Routes>

        {showSigModal && currentUser && (
          <DoctorSignatureManagerV3
            doctorUser={currentUser}
            onClose={() => setShowSigModal(false)}
          />
        )}
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <MainAppContent />
  </ThemeProvider>
);

export default App;


