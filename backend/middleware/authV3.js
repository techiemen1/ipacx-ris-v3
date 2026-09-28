// FILE: backend/middleware/authV3.js
const jwt = require("jsonwebtoken");

function getJwtSecret() {
  return process.env.JWT_SECRET || "ipacx_v3_super_secret_jwt_key_2026";
}

/**
 * Universal JWT Authentication Middleware
 */
function requireAuthV3(req, res, next) {
  // Public paths bypass authentication
  const publicPaths = ["/api/v3/auth/login", "/health", "/api/v3/pacs/instance-preview"];
  const isPublic = publicPaths.some(p => req.path.startsWith(p));
  if (isPublic) return next();

  const authHeader = req.headers.authorization || "";
  let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token && req.query && req.query.token) token = req.query.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired JWT session token" });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware Guard
 */
function requireRoleV3(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Access forbidden: user role undefined" });
    }
    const userRole = String(req.user.role).toUpperCase();
    const hasRole = allowedRoles.some(r => r.toUpperCase() === userRole);
    if (!hasRole) {
      return res.status(403).json({ success: false, message: `Access forbidden: requires ${allowedRoles.join('/')} privilege` });
    }
    return next();
  };
}

module.exports = {
  requireAuthV3,
  requireRoleV3
};
