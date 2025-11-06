import express from "express";
import {
  generateLearningRecommendations,
  generateQuizFeedback,
  chatWithAI
} from "../controllers/aiRecommendationController";

const router = express.Router();

// AI Learning Recommendations
router.post("/ai/recommendations", generateLearningRecommendations);

// AI Quiz Feedback
router.post("/ai/quiz-feedback", generateQuizFeedback);

// AI Chat
router.post("/ai/chat", chatWithAI);

export default router;