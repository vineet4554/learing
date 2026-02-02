import Flashcard from "../models/Flashcard.js";
import Document from "../models/Document.js";
import mongoose from "mongoose";


// ================= GET ALL FLASHCARD SETS (for current user) =================
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
      userId: req.user._id
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets
    });
  } catch (error) {
    next(error);
  }
};


// ================= GET FLASHCARDS BY DOCUMENT ID =================
export const getFlashcards = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format"
      });
    }

    const flashcardSets = await Flashcard.find({
      userId: req.user._id,
      documentId: documentId
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets
    });
  } catch (error) {
    next(error);
  }
};


// ================= GET SINGLE FLASHCARD SET BY ID =================
export const getSingleFlashcardSet = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flashcard ID format"
      });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: id,
      userId: req.user._id
    }).populate("documentId", "title fileName");

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found"
      });
    }

    res.status(200).json({
      success: true,
      data: flashcardSet
    });
  } catch (error) {
    next(error);
  }
};


// ================= REVIEW FLASHCARD =================
export const reviewFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cardIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flashcard ID format"
      });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found"
      });
    }

    if (
      typeof cardIndex !== 'number' || 
      cardIndex < 0 || 
      cardIndex >= flashcardSet.cards.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid card index"
      });
    }

    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.cards[cardIndex].reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: "Flashcard reviewed successfully",
      data: flashcardSet
    });
  } catch (error) {
    next(error);
  }
};


// ================= TOGGLE STAR FLASHCARD =================
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const { id, cardId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(cardId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    const card = flashcardSet.cards.id(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    card.isStarred = !card.isStarred;
    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: `Flashcard ${card.isStarred ? "starred" : "unstarred"} successfully`,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};



// ================= DELETE FLASHCARD SET =================
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flashcard ID format"
      });
    }

    const flashcardSet = await Flashcard.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};