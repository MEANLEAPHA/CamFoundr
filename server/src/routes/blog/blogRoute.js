const router = require("express").Router();
const { protect } = require("../../middleware/authMiddleware");
const { readLimiter, writeLimiter } = require("../../middleware/rateLimiter");
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../../controllers/blog/blogController");

router.get("/blogs", readLimiter, getBlogs);
router.get("/blogs/:slugOrId", readLimiter, getBlog);
router.post("/blogs", protect, writeLimiter, createBlog);
router.put("/blogs/:blogId", protect, writeLimiter, updateBlog);
router.delete("/blogs/:blogId", protect, writeLimiter, deleteBlog);

module.exports = router;
