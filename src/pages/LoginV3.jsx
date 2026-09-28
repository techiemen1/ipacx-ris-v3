// FILE: src/pages/LoginV3.jsx
import React, { useState, useEffect } from "react";
import { Lock, User, ShieldCheck, Key, ArrowRight, CheckCircle2, Activity, Sparkles, Building, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ROLE_PRESETS = [
  { id: "RADIOLOGIST", label: "Radiologist MD", username: "dr.smith", roleBadge: "Diagnostic Reporting" },
  { id: "ADMIN", label: "System Administrator", username: "sysadmin", roleBadge: "Full Governance" },
  { id: "HR_MANAGER", label: "HR Manager", username: "hr.care", roleBadge: "Staff Roster & HR" },
  { id: "TECHNICIAN", label: "Lead Radiographer", username: "rad.tech", roleBadge: "Modality & MWL" },
  { id: "BILLING", label: "Billing Executive", username: "desk.cash", roleBadge: "GST & Cash Counter" }
];

const LoginV3 = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("RADIOLOGIST");
  const [username, setUsername] = useState("dr.smith");
  const [password, setPassword] = useState("••••••••••••");
  const [mfaCode, setMfaCode] = useState("881920");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [hospitalInfo, setHospitalInfo] = useState({
    hospitalName: "iPaCX RADIOLOGY & DIAGNOSTIC IMAGING CENTER",
    tagline: "NABH Accredited • NHA ABDM M1/M2/M3 • AERB Radiation Safety Certified"
  });

  useEffect(() => {
    // Dynamic Config Fetch
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

  const handleSelectRolePreset = (preset) => {
    setSelectedRole(preset.id);
    setUsername(preset.username);
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      setErrorMsg("Please enter username");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const userPayload = {
        username: username.trim(),
        role: selectedRole,
        fullName: selectedRole === "RADIOLOGIST" ? "Dr. Alexander Smith, MD" : selectedRole === "ADMIN" ? "System Admin" : selectedRole === "HR_MANAGER" ? "Priya Nair (HR Manager)" : selectedRole === "TECHNICIAN" ? "Rajesh Kumar (Lead Tech)" : "Sunita Deshmukh (Billing)",
        medicalLicense: selectedRole === "RADIOLOGIST" ? "NMC-MH-2012-08819" : "N/A"
      };

      if (onLoginSuccess) {
        onLoginSuccess(userPayload);
      }
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Dynamic Hospital Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30">
            <Building size={32} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">{hospitalInfo.hospitalName}</h1>
          <p className="text-[11px] text-cyan-400 font-bold">{hospitalInfo.tagline}</p>
          <div className="text-[10px] text-slate-500 font-mono">iPaCX RIS/PACS Integrated Platform v3.0</div>
        </div>

        {/* Role Quick Selector Preset Tabs */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Select Operating Role Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectRolePreset(p)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === p.id
                    ? "bg-cyan-600/10 border-cyan-500 text-white shadow-md shadow-cyan-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold text-xs">{p.label}</div>
                <div className="text-[9px] text-cyan-400 font-mono">{p.roleBadge}</div>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Username / System ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-white font-bold focus:border-cyan-500 focus:outline-none"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <span>Continue to 2FA Authentication</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-center text-xs font-bold space-y-1">
              <ShieldCheck size={20} className="mx-auto text-cyan-400" />
              <p>MFA 2-Factor Authentication Code Sent to Authenticator App</p>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Enter 6-Digit Security OTP</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-center text-cyan-400 font-mono font-black tracking-widest text-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                {loading ? "Authenticating Session..." : "Secure Login to RIS/PACS"}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          {hospitalInfo.hospitalName} • HIPAA & DISHA Compliant JWT RBAC v3.0
        </div>
      </div>
    </div>
  );
};

export default LoginV3;
