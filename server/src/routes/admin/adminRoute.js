const router = require("express").Router();
const { requireAdmin } = require("../../middleware/adminMiddleware");
const {
  adminLogin,
  getAdminMe,
  getDashboardStats,
  // Users
  getUsers,
  getUserById,
  updateUser,
  banUser,
  unbanUser,
  deleteUser,
  // Posts
  getPostsAdmin,
  deletePostAdmin,
  restorePostAdmin,
  // GIFs
  getGifsAdmin,
  createGifAdmin,
  updateGifAdmin,
  deleteGifAdmin,
  // Events
  getEventsAdmin,
  createEventAdmin,
  updateEventAdmin,
  deleteEventAdmin,
  // Blogs
  getBlogsAdmin,
  getBlogByIdAdmin,
  approveBlogAdmin,
  rejectBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  // Reports
  getReportsAdmin,
  resolveReportAdmin,
} = require("../../controllers/admin/adminController");

// Public admin login
router.post("/login", adminLogin);

// Protected routes (Admin token or x-admin-key required)
router.use(requireAdmin);

// Admin Profile & Stats
router.get("/me", getAdminMe);
router.get("/stats", getDashboardStats);

// User Management
router.get("/users", getUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId", updateUser);
router.post("/users/:userId/ban", banUser);
router.post("/users/:userId/unban", unbanUser);
router.delete("/users/:userId", deleteUser);

// Post Management
router.get("/posts", getPostsAdmin);
router.delete("/posts/:postId", deletePostAdmin);
router.post("/posts/:postId/restore", restorePostAdmin);

// GIF Management
router.get("/gifs", getGifsAdmin);
router.post("/gifs", createGifAdmin);
router.put("/gifs/:gifId", updateGifAdmin);
router.delete("/gifs/:gifId", deleteGifAdmin);

// Event Management
router.get("/events", getEventsAdmin);
router.post("/events", createEventAdmin);
router.put("/events/:eventId", updateEventAdmin);
router.delete("/events/:eventId", deleteEventAdmin);

// Blog Management & Approvals
router.get("/blogs", getBlogsAdmin);
router.get("/blogs/:blogId", getBlogByIdAdmin);
router.post("/blogs/:blogId/approve", approveBlogAdmin);
router.post("/blogs/:blogId/reject", rejectBlogAdmin);
router.put("/blogs/:blogId", updateBlogAdmin);
router.delete("/blogs/:blogId", deleteBlogAdmin);

// Reports & Moderation
router.get("/reports", getReportsAdmin);
router.post("/reports/:reportId/resolve", resolveReportAdmin);

module.exports = router;

