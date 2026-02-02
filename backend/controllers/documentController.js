import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { textChunker } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// ================= UPLOAD DOCUMENT =================
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const baseUrl =
      process.env.BASE_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
      content: "" // Will be updated after PDF processing
    });

    processPDF(document._id, req.file.path).catch(console.error);

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing started."
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

// ================= BACKGROUND PDF PROCESS =================
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    const chunks = textChunker(text);

    await Document.findByIdAndUpdate(documentId, {
      status: "ready",
      content: text,
      extractedText: text,
      chunks
    });

    await fs.unlink(filePath).catch(() => {});
    console.log(`✅ PDF processed successfully for document ${documentId}`);
  } catch (error) {
    console.error(`❌ Error processing PDF for document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed"
    }).catch(err => console.error("Failed to update document status:", err));
  }
};

// ================= GET ALL DOCUMENTS =================
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcards"
        }
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes"
        }
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcards" },
          quizCount: { $size: "$quizzes" }
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcards: 0,
          quizzes: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
};

// ================= GET SINGLE DOCUMENT =================
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    const flashcardCount=await Flashcard.countDocuments({ documentId:document._id,userId:req.user._id});
    const quizCount=await Quiz.countDocuments({ documentId:document._id,userId:req.user._id});

    document.lastAccessed = new Date();
    await document.save();

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE DOCUMENT =================
export const updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (req.body.title) {
      document.title = req.body.title;
      await document.save();
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// ================= DELETE DOCUMENT =================
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });
    await Document.findByIdAndDelete(document._id);

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};
