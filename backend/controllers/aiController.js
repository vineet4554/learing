import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";


// ================= GENERATE FLASHCARDS =================
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or not ready",
      });
    }

    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count)
    );

    if (!cards || cards.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate flashcards",
      });
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      message: "Flashcards generated successfully",
      data: flashcardSet,
    });
  } catch (error) {
    next(error);
  }
};


// ================= GENERATE SUMMARY =================
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const summary = await geminiService.generateSummary(
      document.extractedText
    );

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};


// ================= CHAT WITH AI =================
export const chat = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const chunks = documentId
      ? await findRelevantChunks(documentId, message)
      : [];

    const reply = await geminiService.chatWithContext(message, chunks);

    res.json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
};


// ================= EXPLAIN CONCEPT =================
export const explainConcept = async (req, res, next) => {
  try {
    const { concept, documentId } = req.body;

    if (!concept) {
      return res.status(400).json({
        success: false,
        message: "Concept is required",
      });
    }

    const context = documentId
      ? await findRelevantChunks(documentId, concept)
      : [];

    const explanation = await geminiService.explainConcept(
      concept,
      context.map(c => c.content).join("\n")
    );

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    next(error);
  }
};


// ================= GET CHAT HISTORY =================
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const chats = await ChatHistory.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};
