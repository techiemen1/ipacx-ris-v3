// FILE: backend/routes/authV3.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ipacx_v3_super_secret_jwt_key_2026";

// Mock User Database Store for HR & RBAC
let systemUsers = [
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
    permissions: {
      viewWorklist: true,
      openViewer: true,
      createReport: true,
      finalizeReport: true,
      manageBilling: false,
      manageUsers: false,
      dispatchMwl: true
    }
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
    permissions: {
      viewWorklist: true,
      openViewer: true,
      createReport: true,
      finalizeReport: true,
      manageBilling: true,
      manageUsers: true,
      dispatchMwl: true
    }
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
    permissions: {
      viewWorklist: false,
      openViewer: false,
      createReport: false,
      finalizeReport: false,
      manageBilling: false,
      manageUsers: true,
      dispatchMwl: false
    }
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
    permissions: {
      viewWorklist: true,
      openViewer: true,
      createReport: false,
      finalizeReport: false,
      manageBilling: false,
      manageUsers: false,
      dispatchMwl: true
    }
  },
  {
    id: "USR-105",
    username: "desk.cash",
    fullName: "Sunita Deshmukh (Billing Executive)",
    email: "s.deshmukh@ipacx.com",
    role: "BILLING",
    employeeId: "EMP-FIN-012",
    medicalLicense: "N/A",
    department: "Patient Billing Desk",
    branch: "Reception Counter 2",
    shift: "Morning (08:00 - 16:00)",
    status: "ACTIVE",
    permissions: {
      viewWorklist: true,
      openViewer: false,
      createReport: false,
      finalizeReport: false,
      manageBilling: true,
      manageUsers: false,
      dispatchMwl: true
    }
  }
];

// Security Audit Trail Log Store
const securityAuditLogs = [
  { timestamp: new Date().toISOString(), event: "SYSTEM_INITIALIZED", user: "SYSTEM", ip: "127.0.0.1", details: "Enterprise Security RBAC Governance active" }
];

/**
 * POST /api/v3/auth/login
 * Multi-Role Secure Login Authentication
 */
router.post("/login", (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    // Find matching user
    let userObj = systemUsers.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    
    if (userObj && userObj.status === "LOCKED") {
      securityAuditLogs.unshift({ timestamp: new Date().toISOString(), event: "LOGIN_BLOCKED_LOCKED", user: username, details: "Account locked by Administrator" });
      return res.status(403).json({ success: false, message: "Account is LOCKED by System Administrator. Please contact Security Admin." });
    }

    if (!userObj) {
      const selectedRole = (role || "RADIOLOGIST").toUpperCase();
      userObj = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        username: username.trim(),
        fullName: `${username.charAt(0).toUpperCase() + username.slice(1)} (${selectedRole})`,
        email: `${username}@ipacx.com`,
        role: selectedRole,
        employeeId: `EMP-${selectedRole.slice(0,3)}-${Math.floor(100 + Math.random() * 900)}`,
        medicalLicense: selectedRole === "RADIOLOGIST" ? "NMC-REG-2026-991" : "N/A",
        department: selectedRole === "RADIOLOGIST" ? "Diagnostic Radiology" : "Operations",
        branch: "Main Reading Room",
        shift: "Standard Shift",
        status: "ACTIVE",
        permissions: {
          viewWorklist: true,
          openViewer: true,
          createReport: selectedRole === "RADIOLOGIST" || selectedRole === "ADMIN",
          finalizeReport: selectedRole === "RADIOLOGIST" || selectedRole === "ADMIN",
          manageBilling: selectedRole === "BILLING" || selectedRole === "ADMIN",
          manageUsers: selectedRole === "HR_MANAGER" || selectedRole === "ADMIN",
          dispatchMwl: true
        }
      };
      systemUsers.unshift(userObj);
    }

    // Audit Log Login Event
    securityAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      event: "USER_LOGIN_SUCCESS",
      user: userObj.username,
      role: userObj.role,
      details: `Authenticated user ${userObj.fullName} with role ${userObj.role}`
    });

    // Generate 24-Hour JWT Token
    const token = jwt.sign(
      { id: userObj.id, username: userObj.username, role: userObj.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Authentication successful",
      token,
      user: userObj
    });
  } catch (err) {
    console.error("[v3 Auth API] Login error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v3/auth/users
 * HR Staff & User Catalog List
 */
router.get("/users", (req, res) => {
  res.json({
    success: true,
    count: systemUsers.length,
    users: systemUsers
  });
});

/**
 * GET /api/v3/auth/audit-logs
 * Security & Confidentiality Access Audit Trail
 */
router.get("/audit-logs", (req, res) => {
  res.json({
    success: true,
    count: securityAuditLogs.length,
    logs: securityAuditLogs
  });
});

/**
 * POST /api/v3/auth/create-user
 * Admin / HR Employee Onboarding / User Creation
 */
router.post("/create-user", (req, res) => {
  try {
    const { username, fullName, email, role, employeeId, medicalLicense, department, branch, shift } = req.body;

    if (!username || !fullName || !role) {
      return res.status(400).json({ success: false, message: "Username, Full Name, and Role are required" });
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      username: username.toLowerCase().trim(),
      fullName,
      email: email || `${username}@ipacx.com`,
      role: role.toUpperCase(),
      employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      medicalLicense: medicalLicense || "N/A",
      department: department || "Radiology Department",
      branch: branch || "Main Hospital Branch",
      shift: shift || "General Morning Shift",
      status: "ACTIVE",
      permissions: {
        viewWorklist: true,
        openViewer: role.toUpperCase() !== "HR_MANAGER",
        createReport: role.toUpperCase() === "RADIOLOGIST" || role.toUpperCase() === "ADMIN",
        finalizeReport: role.toUpperCase() === "RADIOLOGIST" || role.toUpperCase() === "ADMIN",
        manageBilling: role.toUpperCase() === "BILLING" || role.toUpperCase() === "ADMIN",
        manageUsers: role.toUpperCase() === "HR_MANAGER" || role.toUpperCase() === "ADMIN",
        dispatchMwl: true
      }
    };

    systemUsers.unshift(newUser);
    securityAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      event: "USER_ONBOARDED",
      user: username,
      role: role.toUpperCase(),
      details: `Created user ${fullName} with role ${role.toUpperCase()}`
    });

    res.json({ success: true, message: "New employee user created successfully", user: newUser });
  } catch (err) {
    console.error("[v3 Auth API] Create user error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v3/auth/update-user
 * System Admin Role & Permissions Access Control Update
 */
router.post("/update-user", (req, res) => {
  try {
    const { userId, role, status, permissions } = req.body;
    const user = systemUsers.find(u => u.id === userId || u.username === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role) user.role = role.toUpperCase();
    if (status) user.status = status.toUpperCase();
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    securityAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      event: "RBAC_PERMISSIONS_UPDATED",
      user: user.username,
      details: `Updated role=${user.role}, status=${user.status}`
    });

    res.json({ success: true, message: "User RBAC permissions updated", user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
