const router = require("express").Router();
const { protect } = require("../../middleware/authMiddleware");
const { aiGenerationLimiter, readLimiter } = require("../../middleware/rateLimiter");
const {
  generateQuestion,
  getQuestionGenerationStatus,
} = require("../../controllers/ai/questionGenerationController");

router.post("/ai/generate-question", protect, aiGenerationLimiter, generateQuestion);
router.get("/ai/generate-question/:jobId", protect, readLimiter, getQuestionGenerationStatus);

module.exports = router;
