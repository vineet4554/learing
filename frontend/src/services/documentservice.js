import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

// Get all documents
const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to fetch documents",
    };
  }
};

// Get single document by ID
const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to fetch document",
    };
  }
};

// Upload document
const uploadDocument = async (file, title) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const res = await axiosInstance.post(
    API_PATHS.DOCUMENTS.UPLOAD,
    formData
  );

  return res.data;
};

// Update document (e.g., title)
const updateDocument = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.DOCUMENTS.UPDATE_DOCUMENT(id),
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to update document",
    };
  }
};

// Delete document
const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to delete document",
    };
  }
};

// AI Services

// Generate flashcards for document
const generateFlashcards = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate flashcards",
    };
  }
};

// Generate quiz for document
const generateQuiz = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUIZ,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate quiz",
    };
  }
};

// Generate summary for document
const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_SUMMARY,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate summary",
    };
  }
};

// Chat with document
const chatWithDocument = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      message,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to get chat response",
    };
  }
};

const documentService = {
  // Document operations
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  
  // AI operations
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chatWithDocument,
};

export default documentService;