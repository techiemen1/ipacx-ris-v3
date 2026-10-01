// FILE: src/pages/HrUserManagementV3.jsx
import React, { useState, useEffect } from "react";
import { Users, UserPlus, ShieldCheck, CheckCircle2, Search, Activity, Stethoscope, Building, Lock, Edit3 } from "lucide-react";
import api from "../api/axios";

const INITIAL_USERS = [
  {
    id: "USR-101",
    username: "dr.smith",
    fullName: "Dr. Alexander Smith, MD",
    email: "a.smith@ipacx.com",
    role: "RADIOLOGIST",
    employeeId: "EMP-RAD-001",
    medicalLicense: "NMC-MH-2012-08819",
    department: "Radiology & Diagnostic Imaging",
    branch: "Main Campus Reading Room 1",
    shift: "Morning (08:00 - 16:00)",
    status: "ACTIVE",
    permissions: { viewWorklist: true, openViewer: true, createReport: true, finalizeReport: true, manageBilling: false, manageUsers: false, dispatchMwl: true }
  },
  {
    id: "USR-102",
    username: "sysadmin",
    fullName: "System Admin (IT Governance)",
    email: "admin@ipacx.com",
    role: "ADMIN",
    employeeId: "EMP-IT-001",
    medicalLicense: "N/A",
    department: "IT & PACS Infrastructure",
    branch: "Data Center Headquarters",
    shift: "General (09:00 - 18:00)",
    status: "ACTIVE",
    permissions: { viewWorklist: true, openViewer: true, createReport: true, finalizeReport: true, manageBilling: true, manageUsers: true, dispatchMwl: true }
  },
  {
    id: "USR-103",
    username: "hr.care",
    fullName: "Priya Nair (HR Manager)",
    email: "hr@ipacx.com",
    role: "HR_MANAGER",
    employeeId: "EMP-HR-002",
    medicalLicense: "N/A",
    department: "Human Resources",
    branch: "Corporate Office",
    shift: "General (09:00 - 18:00)",
    status: "ACTIVE",
    permissions: { viewWorklist: false, openViewer: false, createReport: false, finalizeReport: false, manageBilling: false, manageUsers: true, dispatchMwl: false }
  },
  {
    id: "USR-104",
    username: "rad.tech",
    fullName: "Rajesh Kumar (Lead Radiographer)",
    email: "r.kumar@ipacx.com",
    role: "TECHNICIAN",
    employeeId: "EMP-TECH-005",
    medicalLicense: "RAD-TECH-44912",
    department: "CT & MRI Acquisition Suite",
    branch: "Main Campus Floor 1",
    shift: "Evening (16:00 - 00:00)",
    status: "ACTIVE",
    permissions: { viewWorklist: true, openViewer: true, createReport: false, finalizeReport: false, manageBilling: false, manageUsers: false, dispatchMwl: true }
  }
];

const HrUserManagementV3 = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("ipacx_users_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUserForRbac, setSelectedUserForRbac] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "RADIOLOGIST",
    employeeId: "",
    medicalLicense: "",
    department: "Diagnostic Radiology",
    branch: "Main Hospital Campus",
    shift: "Morning (08:00 - 16:00)"
  });

  const [successBanner, setSuccessBanner] = useState("");

  const handleCreateUser = (e) => {
    e.preventDefault();
    const created = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      username: newUserForm.username.toLowerCase().trim(),
      fullName: newUserForm.fullName,
      email: newUserForm.email || `${newUserForm.username}@ipacx.com`,
      role: newUserForm.role,
      employeeId: newUserForm.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      medicalLicense: newUserForm.medicalLicense || "N/A",
      department: newUserForm.department,
      branch: newUserForm.branch,
      shift: newUserForm.shift,
      status: "ACTIVE",
      permissions: {
        viewWorklist: true,
        openViewer: newUserForm.role !== "HR_MANAGER",
        createReport: newUserForm.role === "RADIOLOGIST" || newUserForm.role === "ADMIN",
        finalizeReport: newUserForm.role === "RADIOLOGIST" || newUserForm.role === "ADMIN",
        manageBilling: newUserForm.role === "BILLING" || newUserForm.role === "ADMIN",
        manageUsers: newUserForm.role === "HR_MANAGER" || newUserForm.role === "ADMIN",
        dispatchMwl: true
      }
    };

    const updatedUsers = [created, ...users];
    setUsers(updatedUsers);
    localStorage.setItem("ipacx_users_db", JSON.stringify(updatedUsers));
    setShowCreateModal(false);
    setSuccessBanner(`✅ Employee ${created.fullName} onboarded with Role ${created.role}!`);
    setTimeout(() => setSuccessBanner(""), 4000);

    setNewUserForm({
      username: "",
      fullName: "",
      email: "",
      role: "RADIOLOGIST",
      employeeId: "",
      medicalLicense: "",
      department: "Diagnostic Radiology",
      branch: "Main Hospital Campus",
      shift: "Morning (08:00 - 16:00)"
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="hr-user-v3 p-3 md:p-4 bg-slate-950 text-slate-100 min-h-screen space-y-3 font-sans">
      {/* Ultra-Compact Header */}
      <header className="bg-slate-900/80 p-2.5 px-4 rounded-xl border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30">
            <Users size={16} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-white tracking-tight font-heading flex items-center gap-2">
              HR Governance & User Management Module
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Staff Roster, NMC Medical Licenses & Shift Management • Role-Based Access Control (RBAC) Matrix
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus size={14} /> Onboard New Employee / Doctor
        </button>
      </header>

      {successBanner && (
        <div className="p-2 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} /> {successBanner}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 w-72">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search Staff Name, Username, Emp ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {["ALL", "RADIOLOGIST", "ADMIN", "HR_MANAGER", "TECHNICIAN", "BILLING"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                roleFilter === role ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff User Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-4">Employee Name & ID</th>
              <th className="px-5 py-4">Role & Department</th>
              <th className="px-5 py-4">NMC / Medical License</th>
              <th className="px-5 py-4">Assigned Branch</th>
              <th className="px-5 py-4">Shift Roster</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">RBAC Rights</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-extrabold text-white text-sm">{u.fullName}</div>
                  <div className="text-[11px] font-mono text-indigo-400">{u.username} • {u.employeeId}</div>
                </td>

                <td className="px-5 py-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold font-mono uppercase">
                    {u.role}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{u.department}</div>
                </td>

                <td className="px-5 py-4 font-mono text-purple-300 text-xs font-bold">
                  {u.medicalLicense}
                </td>

                <td className="px-5 py-4 text-slate-300 font-medium">
                  {u.branch}
                </td>

                <td className="px-5 py-4 text-slate-400 text-xs">
                  {u.shift}
                </td>

                <td className="px-5 py-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {u.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => setSelectedUserForRbac(u)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/30 inline-flex items-center gap-1.5"
                  >
                    <Lock size={14} /> RBAC Matrix
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboard User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-lg w-full space-y-4 text-xs font-medium">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus size={18} className="text-indigo-400" /> Onboard New Employee / Medical Staff
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. r.kumar"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Operating Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="RADIOLOGIST">Radiologist MD</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="TECHNICIAN">Radiographer / Technician</option>
                    <option value="BILLING">Billing Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">NMC / Medical License No.</label>
                  <input
                    type="text"
                    placeholder="e.g. NMC-MH-2026-9910"
                    value={newUserForm.medicalLicense}
                    onChange={(e) => setNewUserForm({ ...newUserForm, medicalLicense: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RBAC Matrix Inspector Modal */}
      {selectedUserForRbac && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 text-xs font-medium">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-indigo-400" /> RBAC Permissions Matrix [{selectedUserForRbac.username}]
              </h3>
              <button onClick={() => setSelectedUserForRbac(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-2.5">
              {Object.entries(selectedUserForRbac.permissions).map(([permKey, permVal]) => (
                <div key={permKey} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-white capitalize">{permKey.replace(/([A-Z])/g, " $1")}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${permVal ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {permVal ? "ALLOWED" : "DENIED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrUserManagementV3;
