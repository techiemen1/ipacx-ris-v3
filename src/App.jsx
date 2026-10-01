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
import ReportingStudioV3 from "./pages/ReportingStudioV3";
import EnterpriseUnifiedRisStudioV3 from "./pages/EnterpriseUnifiedRisStudioV3";
import { Activity, ShieldCheck, Smartphone, UserPlus, CreditCard, Radio, Users, LogIn, LogOut, User, PenTool, Database, FileCheck, Sun, Moon, Menu, X, LayoutGrid, Palette } from "lucide-react";
import { ThemeProvider, useTheme } from "./utils/ThemeContext";

const NavigationBar = ({ currentUser, onLogout, onOpenSignatureModal }) => {
  const location = useLocation();
  const { model, cycleDesignModel, isLight } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className={`${isLight ? "bg-white/95 border-slate-200 text-slate-800" : "bg-slate-900/95 border-slate-800/80 text-slate-100"} backdrop-blur-md border-b px-3 md:px-6 py-2 sticky top-0 z-40 transition-colors`}>
      <div className="flex items-center justify-between gap-2 max-w-full">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <Activity size={18} />
          </div>
          <div>
            <span className="font-black text-sm md:text-base tracking-tight font-heading text-amber-400 drop-shadow">iPaCX RIS/PACS</span>
            <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 hidden sm:inline-block">
              v3.0 GOLDEN SPEC
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Bar (hidden lg:flex) */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          {showWorklist && (
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} /> <span>Enterprise RIS Studio</span>
            </Link>
          )}

          {showWorklist && (
            <Link
              to="/worklist"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/worklist"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <Activity size={14} /> <span>Classic Worklist</span>
            </Link>
          )}

          {showPacsNodes && (
            <Link
              to="/pacs-nodes"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/pacs-nodes"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <Database size={14} /> <span>PACS Nodes</span>
            </Link>
          )}

          {showReports && (
            <Link
              to="/reports"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/reports"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <FileCheck size={14} /> <span>Reports</span>
            </Link>
          )}

          {showReception && (
            <Link
              to="/patient-registration"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/patient-registration"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus size={14} /> <span>Reception</span>
            </Link>
          )}

          {showBilling && (
            <Link
              to="/billing"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/billing"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard size={14} /> <span>Billing</span>
            </Link>
          )}

          {showMwl && (
            <Link
              to="/mwl-manager"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/mwl-manager"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <Radio size={14} /> <span>MWL Queue</span>
            </Link>
          )}

          {showAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === "/admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-950/80 text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={14} /> <span>Admin</span>
            </Link>
          )}

          {showSig && (
            <button
              onClick={onOpenSignatureModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLight ? "bg-slate-100 border border-slate-300 text-cyan-700 hover:border-cyan-500" : "bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-500"
              }`}
            >
              <PenTool size={14} /> <span>Signature</span>
            </button>
          )}
        </div>

        {/* Right Action Icons & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Unified Navy Blue & Orange Theme Badge */}
          <div
            title="Unified iPaCX Medical Theme (Deep Navy, Orange & Gold Titles)"
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border bg-orange-950/40 text-orange-400 border-orange-500/40"
          >
            <Palette size={15} className="text-orange-400" />
            <span className="hidden sm:inline font-extrabold text-amber-400">
              Navy & Orange Standard
            </span>
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border ${isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"}`}>
                <User size={14} className="text-cyan-600 dark:text-cyan-400" />
                <span className={`text-xs font-extrabold leading-tight max-w-[100px] truncate hidden sm:inline ${isLight ? "text-slate-900" : "text-white"}`}>
                  {currentUser.fullName || currentUser.username}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-600/30 shrink-0"
              >
                <LogIn size={14} /> <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button (lg:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border lg:hidden min-h-[40px] flex items-center justify-center transition-colors cursor-pointer ${
              isLight ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-950 border-slate-800 text-slate-200"
            }`}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 📱 MOBILE NAVIGATION DRAWER OVERLAY (lg:hidden) */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-2 mt-2 border-t border-slate-800 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
          {showWorklist && (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 min-h-[44px]"
            >
              <Activity size={16} /> <span>Radiology Worklist</span>
            </Link>
          )}

          {showWorklist && (
            <Link
              to="/unified-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-purple-950/80 text-purple-200 border border-purple-800/80 min-h-[44px]"
            >
              <LayoutGrid size={16} /> <span>Enterprise RIS Studio (3-Panel)</span>
            </Link>
          )}

          {showPacsNodes && (
            <Link
              to="/pacs-nodes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <Database size={16} /> <span>PACS Nodes & Query/Retrieve</span>
            </Link>
          )}

          {showReports && (
            <Link
              to="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <FileCheck size={16} /> <span>Finalized Reports Archive</span>
            </Link>
          )}

          {showReception && (
            <Link
              to="/patient-registration"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <UserPlus size={16} /> <span>Patient Reception</span>
            </Link>
          )}

          {showBilling && (
            <Link
              to="/billing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <CreditCard size={16} /> <span>Billing & QR Payments</span>
            </Link>
          )}

          {showMwl && (
            <Link
              to="/mwl-manager"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <Radio size={16} /> <span>Technician Modality Worklist (MWL)</span>
            </Link>
          )}

          {showHr && (
            <Link
              to="/hr-users"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <Users size={16} /> <span>HR Staff Roster</span>
            </Link>
          )}

          {showAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 min-h-[44px]"
            >
              <ShieldCheck size={16} /> <span>Admin Settings</span>
            </Link>
          )}
        </div>
      )}
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
          <Route path="/" element={currentUser ? <EnterpriseUnifiedRisStudioV3 userPersona={currentUser.role} /> : <Navigate to="/login" replace />} />
          <Route path="/unified-studio" element={currentUser ? <EnterpriseUnifiedRisStudioV3 userPersona={currentUser.role} /> : <Navigate to="/login" replace />} />
          <Route path="/worklist" element={currentUser ? <DoctorDashboardV3 /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginV3 onLoginSuccess={(u) => setCurrentUser(u)} />} />
          <Route path="/patient-registration" element={currentUser ? <PatientRegistrationV3 /> : <Navigate to="/login" replace />} />
          <Route path="/billing" element={currentUser ? <BillingPortalV3 /> : <Navigate to="/login" replace />} />
          <Route path="/mwl-manager" element={currentUser ? <MwlManagerV3 /> : <Navigate to="/login" replace />} />
          <Route path="/hr-users" element={currentUser ? <HrUserManagementV3 /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={currentUser ? <AdminDashboardV3 /> : <Navigate to="/login" replace />} />
          <Route path="/pacs-nodes" element={currentUser ? <PacsQueryRetrieveV3 /> : <Navigate to="/login" replace />} />
          <Route path="/reports" element={currentUser ? <ReportsArchiveV3 /> : <Navigate to="/login" replace />} />
          <Route path="/reporting-studio" element={currentUser ? <ReportingStudioV3 /> : <Navigate to="/login" replace />} />
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


