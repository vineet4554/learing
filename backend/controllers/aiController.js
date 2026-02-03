import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import Quiz from "../models/Quiz.js"
import mongoose from "mongoose";

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

// ================= GENERATE QUIZ =================
// ================= GENERATE QUIZ =================
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numberOfQuestions = 5, title } = req.body;

    // Validate documentId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format"
      });
    }

    // Find the document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Generate quiz using AI
    const aiQuestions = await geminiService.generateQuiz(document.extractedText, parseInt(numberOfQuestions));


    const transformedQuestions = aiQuestions.map(q => ({
      questionText: q.question,  
      options: q.options,
      correctAnswer: q.options[q.correctAnswer],  
      explanation: q.explanation || "",
      difficulty: "medium"  
    }));

    // Create quiz in database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: documentId,
      title: title || `Quiz: ${document.title}`,
      description: `Quiz generated from ${document.title}`,
      questions: transformedQuestions,  
      userAnswers: [],
      score: 0
    });

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      data: quiz
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
      status:'ready'
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
      data: { 
        documentId:document._id,
        title:document.title,
        summary },
        message:"Summary generate successfully"
    });
  } catch (error) {
    next(error);
  }
};

// ================= CHAT WITH AI =================
export const chat = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        message: "documentId and message are required"
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready"
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    let chunks = findRelevantChunks(document.chunks, message, 3);

    // 🔑 absolute safety
    if (!chunks || chunks.length === 0) {
      chunks = document.chunks.slice(0, 1);
    }

    const reply = await geminiService.chatWithContext(message, chunks);

    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: []
      });
    }

    chatHistory.messages.push(
      {
        role: "user",
        content: message,
        relativeChunks: []
      },
      {
        role: "assistant",
        content: reply,
        relativeChunks: chunks.map(c => c.chunkIndex)
      }
    );

    await chatHistory.save();

    res.json({
      success: true,
      message: "Response generated successfully",
      data: {
        question: message,
        answer: reply,
        relativeChunks: chunks.map(c => c.chunkIndex),
        chatHistoryId: chatHistory._id
      }
    });
  } catch (error) {
    next(error);
  }
};




// ================= EXPLAIN CONCEPT =================
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!concept || !documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId and concept are required",
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
        message: "Document not found",
      });
    }

    let chunks = findRelevantChunks(document.chunks, concept, 3);

    // 🔑 SAFETY FALLBACK
    if (!chunks || chunks.length === 0) {
      chunks = document.chunks.slice(0, 1);
    }

    const contextText = chunks.map(c => c.content).join("\n\n");

    const explanation = await geminiService.explainConcept(
      concept,
      contextText
    );

    res.json({
      success: true,
      message: "Response generated successfully",
      data: {
        concept,
        explanation,
        relativeChunks: chunks.map(c => c.chunkIndex),
      },
    });
  } catch (error) {
    next(error);
  }
};



// ================= GET CHAT HISTORY =================
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    const chats = await ChatHistory.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: 1 });
    if (!chats) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    res.json({
      success: true,
      data: chats.message,
      message:"chat history retrieved sucessfully"
    });
  } catch (error) {
    next(error);
  }
};