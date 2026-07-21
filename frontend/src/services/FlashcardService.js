import axiosInstance from "../utils/axiosinstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to fetch flashcard sets",
    };
  }
};

const getFlashcardsForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to fetch flashcards",
    };
  }
};

// cardIndex: index of the card within the set
// flashcardSetId: _id of the flashcard set document
const reviewFlashcard = async (flashcardSetId, cardIndex) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(flashcardSetId),
      { cardIndex }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to review flashcard",
    };
  }
};

const toggleStar = async (flashcardSetId, cardIndex) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.TOGGLE_STAR(flashcardSetId),
      { cardIndex }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to star flashcard",
    };
  }
};

const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to delete flashcards",
    };
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashcardService;
