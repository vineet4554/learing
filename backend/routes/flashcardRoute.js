import express from "express";
import {
  getFlashcards,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet
} from "../controllers/flashcardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.get("/", getAllFlashcardSets); 

// Get flashcards by document ID
router.get("/:documentId", getFlashcards);

// Mark flashcard as reviewed
router.post("/:id/review", reviewFlashcard);

// Toggle star on flashcard
router.post("/:id/toggle-star", toggleStarFlashcard);

// Delete flashcard set
router.delete("/:id", deleteFlashcardSet);

export default router;
