const router = require("express").Router();
const { protect } = require("../../middleware/authMiddleware");
const { aiGenerationLimiter } = require("../../middleware/rateLimiter");
const { generateQuestion } = require("../../controllers/ai/questionGenerationController");

router.post("/ai/generate-question", protect, aiGenerationLimiter, generateQuestion);

module.exports = router;
