import express from "express";
import {
  generateFlashcards,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  getConceptHistory,
  generateQuiz
} from "../controllers/aiController.js";

import {protect} from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.post("/generate-flashcards", generateFlashcards);
router.post("/generate-summary", generateSummary);
router.post("/generate-quiz", generateQuiz);
router.post("/chat", chat);
router.post("/explain-concept", explainConcept);
router.get("/chat-history/:documentId", getChatHistory);
router.get("/concept-history/:documentId", getConceptHistory);

export default router;
