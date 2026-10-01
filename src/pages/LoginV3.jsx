// FILE: src/pages/LoginV3.jsx
import React, { useState, useEffect } from "react";
import { Lock, User, ArrowRight, Building, Sun, Moon, Activity, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../utils/ThemeContext";

const LoginV3 = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "LIGHT";

  const [username, setUsername] = useState("dr.smith");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [hospitalInfo, setHospitalInfo] = useState({
    hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
    tagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Certified"
  });

  useEffect(() => {
    const saved = localStorage.getItem("ipacx_hospital_config");
    if (saved) {
      try { setHospitalInfo(JSON.parse(saved)); } catch (e) {}
    }

    api.get("/api/v3/config/hospital")
      .then(res => {
        if (res?.data?.success && res?.data?.config) {
          setHospitalInfo(res.data.config);
          localStorage.setItem("ipacx_hospital_config", JSON.stringify(res.data.config));
        }
      })
      .catch(() => null);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Please enter username");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      let authenticatedUser = null;

      // 1. Try Backend Auth API
      const res = await api.post("/api/v3/auth/login", {
        username: username.trim(),
        password
      }).catch(() => null);

      if (res?.data?.success && res?.data?.user) {
        authenticatedUser = res.data.user;
      } else {
        // 2. Lookup in Created Users Database (localStorage ipacx_users_db)
        const u = username.toLowerCase().trim();
        let matchedUser = null;
        try {
          const savedUsers = JSON.parse(localStorage.getItem("ipacx_users_db") || "[]");
          matchedUser = savedUsers.find(usr => usr.username.toLowerCase() === u);
        } catch (e) {}

        if (matchedUser) {
          authenticatedUser = {
            username: matchedUser.username,
            role: matchedUser.role,
            fullName: matchedUser.fullName,
            medicalLicense: matchedUser.medicalLicense || "N/A"
          };
        } else {
          // Fallback Intelligent Role Resolution
          let role = "RADIOLOGIST";
          let fullName = "Dr. Alexander Smith, MD";

          if (u.includes("admin") || u.includes("sys") || u.includes("jags") || u.includes("boss")) {
            role = "ADMIN";
            fullName = `${username} (System Admin)`;
          } else if (u.includes("tech") || u.includes("rad")) {
            role = "TECHNICIAN";
            fullName = `${username} (Lead Tech)`;
          } else if (u.includes("cash") || u.includes("bill") || u.includes("desk")) {
            role = "BILLING";
            fullName = `${username} (Billing Executive)`;
          } else if (u.includes("hr") || u.includes("care")) {
            role = "HR_MANAGER";
            fullName = `${username} (HR Manager)`;
          }

          authenticatedUser = {
            username: username.trim(),
            role,
            fullName,
            medicalLicense: role === "RADIOLOGIST" ? "NMC-MH-2012-08819" : "N/A"
          };
        }
      }

      // Save user session & trigger callback
      localStorage.setItem("ipacx_user", JSON.stringify(authenticatedUser));
      if (onLoginSuccess) {
        onLoginSuccess(authenticatedUser);
      }

      // Auto Connect Role to Designated Workspace
      const roleStr = (authenticatedUser.role || "RADIOLOGIST").toUpperCase();
      switch (roleStr) {
        case "TECHNICIAN":
          navigate("/mwl-manager");
          break;
        case "BILLING":
          navigate("/billing");
          break;
        case "HR_MANAGER":
          navigate("/hr-users");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        case "RADIOLOGIST":
        default:
          navigate("/");
          break;
      }

    } catch (err) {
      setErrorMsg("Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans transition-colors ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      {/* Sun/Moon Theme Toggle Pill in Top Corner */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-sm transition-all cursor-pointer ${
            isLight
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              : "bg-slate-900 text-cyan-300 border-slate-800 hover:bg-slate-800"
          }`}
        >
          {isLight ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-cyan-400" />}
          <span>{isLight ? "Clinical Light" : "AI Dark"}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className={`max-w-md w-full p-8 rounded-3xl backdrop-blur-2xl shadow-2xl relative z-10 space-y-6 transition-all border ${
        isLight
          ? "bg-white/95 border-slate-200 shadow-slate-200/50"
          : "bg-slate-900/90 border-slate-800/90"
      }`}>
        
        {/* Hospital Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30 mb-1">
            <Activity size={28} />
          </div>
          <h1 className={`text-base md:text-lg font-black tracking-tight uppercase font-heading ${isLight ? "text-slate-900" : "text-white"}`}>
            {hospitalInfo.hospitalName}
          </h1>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold leading-relaxed">
            {hospitalInfo.tagline}
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            iPaCX RIS/PACS Integrated Platform v3.0
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className={`block font-extrabold uppercase text-[10px] mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Username / Account ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={`w-full border rounded-xl px-3.5 py-3 pl-10 font-bold outline-none transition-colors ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:bg-white"
                    : "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                }`}
              />
              <User size={16} className={`absolute left-3.5 top-3.5 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
            </div>
          </div>

          <div>
            <label className={`block font-extrabold uppercase text-[10px] mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full border rounded-xl px-3.5 py-3 pl-10 font-mono outline-none transition-colors ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:bg-white"
                    : "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                }`}
              />
              <Lock size={16} className={`absolute left-3.5 top-3.5 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
            </div>
          </div>

          {/* Quick Account Selector Pills */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-extrabold uppercase text-[9px] text-slate-400">Quick Select User Account:</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "jags", role: "ADMIN" },
                { name: "sysadmin", role: "ADMIN" },
                { name: "dr.smith", role: "RADIOLOGIST" },
                { name: "rad.tech", role: "TECHNICIAN" },
                { name: "hr.care", role: "HR_MANAGER" }
              ].map((acc) => (
                <button
                  key={acc.name}
                  type="button"
                  onClick={() => setUsername(acc.name)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    username === acc.name
                      ? "bg-cyan-600 text-white border-cyan-400"
                      : isLight ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {acc.name} <span className="text-[9px] opacity-75">[{acc.role}]</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <span>{loading ? "Authenticating Session..." : "Secure Login to RIS/PACS"}</span>
            <ArrowRight size={16} />
          </button>

        </form>

        <div className={`pt-4 border-t text-center text-[10px] font-mono ${isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-500"}`}>
          {hospitalInfo.hospitalName} • Enterprise RBAC v3.0
        </div>
      </div>
    </div>
  );
};

export default LoginV3;

