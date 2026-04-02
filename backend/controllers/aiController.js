import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks, textChunker } from "../utils/textChunker.js";
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
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numberOfQuestions = 5, title, topicName } = req.body;
    const trimmedTopic = topicName?.trim();

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

    const quizSourceText = trimmedTopic
      ? `Generate a quiz focused on this topic: ${trimmedTopic}`
      : document.extractedText;

    // Generate quiz using AI
    const aiQuestions = await geminiService.generateQuiz(
      quizSourceText,
      parseInt(numberOfQuestions)
    );


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
      title: title || `Quiz: ${trimmedTopic || document.title}`,
      description: trimmedTopic
        ? `Quiz generated for topic "${trimmedTopic}" in ${document.title}`
        : `Quiz generated from ${document.title}`,
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
    // Support both `message` and legacy `question` field from frontend
    const { documentId, message, question } = req.body;
    const userMessage = message || question;

    if (!documentId || !userMessage) {
      return res.status(400).json({
        success: false,
        message: "documentId and message are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format",
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

    // Prefer persisted chunks; build transient chunks from extracted text if missing.
    const persistedChunks = Array.isArray(document.chunks)
      ? document.chunks
      : [];
    const rawText = document.extractedText || document.content || "";
    const generatedChunks =
      persistedChunks.length === 0 && rawText
        ? textChunker(rawText, 350, 80)
        : [];
    const sourceChunks =
      persistedChunks.length > 0 ? persistedChunks : generatedChunks;

    if (sourceChunks.length === 0) {
      return res.status(422).json({
        success: false,
        message:
          "No readable text found in this file. Please upload a text-based PDF or DOCX.",
      });
    }

    let chunks = findRelevantChunks(sourceChunks, userMessage, 3, false);

    const hadRelevantChunks = Array.isArray(chunks) && chunks.length > 0;
    if (!hadRelevantChunks) {
      chunks = [];
    }

    let reply;
    try {
      if (hadRelevantChunks) {
        reply = await geminiService.chatWithContext(userMessage, chunks);
      } else {
        reply = await geminiService.chatGeneral(userMessage);
      }
    } catch (geminiError) {
      console.error("Gemini chat error:", geminiError);
      reply =
        "I can read your question, but the AI chat service is currently unavailable. Please verify your Gemini API key in backend/.env and try again.";
    }

    const isFallbackReply = (text = "") =>
      /i couldn't find this in the provided content|not mentioned in the provided content/i.test(
        String(text).toLowerCase()
      );

    if (hadRelevantChunks && isFallbackReply(reply) && sourceChunks.length > chunks.length) {
      const broaderChunks = sourceChunks.slice(0, Math.min(sourceChunks.length, 10));
      try {
        const retryReply = await geminiService.chatWithContext(userMessage, broaderChunks);
        if (retryReply && retryReply.trim()) {
          reply = retryReply.trim();
          chunks = broaderChunks;
        }
      } catch (retryError) {
        console.error("Gemini retry chat error:", retryError);
      }
    }

    if (isFallbackReply(reply)) {
      try {
        const generalReply = await geminiService.chatGeneral(userMessage);
        if (generalReply?.trim()) {
          reply = generalReply.trim();
          chunks = [];
        } else {
          reply =
            "I could not find an exact match for that question in this file. Try asking with exact keywords from the content, or ask me to summarize the relevant section first.";
        }
      } catch (fallbackErr) {
        console.error("Gemini general fallback error:", fallbackErr);
        reply =
          "I could not find an exact match for that question in this file. Try asking with exact keywords from the content, or ask me to summarize the relevant section first.";
      }
    }

    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    chatHistory.messages.push(
      {
        role: "user",
        content: userMessage,
        relativeChunks: [],
      },
      {
        role: "assistant",
        content: reply,
        relativeChunks: chunks.map((c) => c.chunkIndex).filter((v) => typeof v === "number"),
      }
    );

    await chatHistory.save();

    res.json({
      success: true,
      message: "Response generated successfully",
      data: {
        question: userMessage,
        answer: reply,
        relativeChunks: chunks.map((c) => c.chunkIndex).filter((v) => typeof v === "number"),
        chatHistoryId: chatHistory._id,
      },
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

    // Prefer persisted chunks; build transient chunks from extracted text if missing.
    const persistedChunks = Array.isArray(document.chunks)
      ? document.chunks
      : [];
    const rawText = document.extractedText || document.content || "";
    const generatedChunks =
      persistedChunks.length === 0 && rawText
        ? textChunker(rawText, 350, 80)
        : [];
    const sourceChunks =
      persistedChunks.length > 0 ? persistedChunks : generatedChunks;

    if (sourceChunks.length === 0) {
      return res.status(422).json({
        success: false,
        message:
          "No readable text found in this file. Please upload a text-based PDF or DOCX.",
      });
    }

    const chunks = findRelevantChunks(sourceChunks, concept, 3, false);
    const hasRelevantChunks = Array.isArray(chunks) && chunks.length > 0;
    const contextText = hasRelevantChunks
      ? chunks.map((c) => c.content).join("\n\n")
      : "";

    let explanation;
    try {
      explanation = await geminiService.explainConcept(
        concept,
        contextText
      );
    } catch (geminiError) {
      // Don't crash the API if the AI service fails – return a graceful fallback
      console.error("Explain concept AI error:", geminiError);
      explanation =
        "The AI explanation service is currently unavailable. Please try again later.";
    }

    res.json({
      success: true,
      message: hasRelevantChunks
        ? "Response generated successfully"
        : "Concept not found in file, generated general explanation",
      data: {
        concept,
        explanation,
        relativeChunks: hasRelevantChunks
          ? chunks.map((c) => c.chunkIndex).filter((v) => typeof v === "number")
          : [],
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
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const chat = await ChatHistory.findOne({
      documentId,
      userId: req.user._id,
    });

    if (!chat) {
      // No history yet is not an error – return empty list
      return res.json({
        success: true,
        data: [],
        message: "No chat history found",
      });
    }

    res.json({
      success: true,
      data: chat.messages,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

