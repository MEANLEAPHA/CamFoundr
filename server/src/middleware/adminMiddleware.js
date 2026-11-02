const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const ADMIN_SECRET = process.env.ADMIN_KEY || "camfoundr_admin_secret_2026";

const requireAdmin = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  // 1. Check if admin API key is provided directly in headers
  const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
  if (adminKey && adminKey === ADMIN_SECRET) {
    req.user = { id: 1, userId: 1, role: "admin", username: "System Admin" };
    return next();
  }

  // 2. Check Bearer token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication required for admin access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Direct token role check
    if (decoded.role === "admin" || decoded.isAdmin) {
      return next();
    }

    // Database role check
    const userId = decoded.userId || decoded.id;
    if (userId) {
      const userCheck = await pool.query(
        "SELECT id, username, email, role FROM users WHERE id = $1",
        [userId]
      );

      if (userCheck.rows.length > 0) {
        const user = userCheck.rows[0];
        // Allow if role is admin or if user is the first user/owner
        if (user.role === "admin" || user.id === 1) {
          req.user.role = "admin";
          req.user.username = user.username;
          return next();
        }
      }
    }

    return res.status(403).json({ message: "Admin privileges required" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAdmin, ADMIN_SECRET };

