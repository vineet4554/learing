import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Plus } from "lucide-react";
import QuizzesList from "../Quizzes/QuizTakepage"; // adjust path if needed
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  BookOpen,
  FileQuestion,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

function DocumentDetailpage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [generating, setGenerating] = useState({
    flashcards: false,
    quiz: false,
    summary: false,
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
      );
      
      if (response.data.success) {
        setDocument(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document");
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGenerating({ ...generating, flashcards: true });
    
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_FLASHCARDS,
        { documentId: id }
      );
      
      if (response.data.success) {
        toast.success("Flashcards generated successfully!");
        setActiveTab("flashcards");
        fetchDocument(); // Refresh to get updated counts
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error(error.response?.data?.message || "Failed to generate flashcards");
    } finally {
      setGenerating({ ...generating, flashcards: false });
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerating({ ...generating, quiz: true });
    
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUIZ,
        { documentId: id }
      );
      
      if (response.data.success) {
        toast.success("Quiz generated successfully!");
        setActiveTab("quizzes");
        fetchDocument(); // Refresh to get updated counts
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setGenerating({ ...generating, quiz: false });
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating({ ...generating, summary: true });
    
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_SUMMARY,
        { documentId: id }
      );
      
      if (response.data.success) {
        toast.success("Summary generated!");
        setDocument({ ...document, summary: response.data.data.summary });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setGenerating({ ...generating, summary: false });
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
        documentId: id,
        message: chatInput,
      });

      if (response.data.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.data.response,
          timestamp: new Date(),
        };
        setChatMessages([...chatMessages, userMessage, aiMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
      toast.success("Document deleted successfully");
      navigate("/documents");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: "content", label: "Content" },
    { id: "chat", label: "Chat" },
    { id: "ai-actions", label: "AI Actions" },
    { id: "flashcards", label: "Flashcards" },
    { id: "quizzes", label: "Quizzes" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document not found</h2>
          <button
            onClick={() => navigate("/documents")}
            className="text-emerald-500 font-semibold hover:text-emerald-600"
          >
            Go back to documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Documents</span>
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-emerald-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Document Viewer */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Document Viewer</h2>
                {document.fileUrl && (
  <a
    href={document.fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
  >
    <ExternalLink className="w-4 h-4" />
    Open in new tab
  </a>
)}

              </div>
              
              {document.fileUrl ? (
                <div className="w-full h-[600px]">
                  <iframe
                    src={document.fileUrl}
                    className="w-full h-full border-0"
                    title="Document Viewer"
                  />
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Document preview not available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[600px] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Start a conversation about this document</p>
                  <p className="text-sm text-gray-500">Ask questions, request explanations, or get insights</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl px-6 py-4 ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <ThumbsUp className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <ThumbsDown className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <MessageCircle className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-6 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AI Actions Tab */}
        {activeTab === "ai-actions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generate Flashcards */}
            <button
              onClick={handleGenerateFlashcards}
              disabled={generating.flashcards}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                {generating.flashcards ? (
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                ) : (
                  <BookOpen className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Flashcards</h3>
              <p className="text-gray-600 mb-4">
                Create interactive flashcards from this document for effective studying
              </p>
              <div className="text-purple-600 font-semibold">
                {generating.flashcards ? "Generating..." : "Generate Now →"}
              </div>
            </button>

            {/* Generate Quiz */}
            {/* Quizzes Tab */}
{activeTab === "quizzes" && (
  <div>
    {/* Header with Generate Button */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <p className="text-gray-600 mt-1">
          {document.quizCount > 0
            ? `${document.quizCount} quiz${document.quizCount > 1 ? 'zes' : ''} available`
            : "No quizzes generated yet"}
        </p>
      </div>
      <button
        onClick={handleGenerateQuiz}
        disabled={generating.quiz}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
      >
        {generating.quiz ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            Generate Quiz
          </>
        )}
      </button>
    </div>

    {/* Quizzes Grid */}
    {document.quizCount > 0 ? (
      <QuizzesList documentId={id} />
    ) : (
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
        <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes yet</h3>
        <p className="text-gray-600 mb-6">
          Generate a quiz to test your knowledge on this document
        </p>
        <button
          onClick={handleGenerateQuiz}
          disabled={generating.quiz}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {generating.quiz ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Your First Quiz
            </>
          )}
        </button>
      </div>
    )}
  </div>
)}

            {/* Generate Summary */}
            <button
              onClick={handleGenerateSummary}
              disabled={generating.summary}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                {generating.summary ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Summary</h3>
              <p className="text-gray-600 mb-4">
                Get a concise summary highlighting the key points of the document
              </p>
              <div className="text-blue-600 font-semibold">
                {generating.summary ? "Generating..." : "Generate Now →"}
              </div>
            </button>

            {/* AI Chat */}
            <button
              onClick={() => setActiveTab("chat")}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chat with Document</h3>
              <p className="text-gray-600 mb-4">
                Ask questions and get instant answers about the document content
              </p>
              <div className="text-orange-600 font-semibold">Start Chatting →</div>
            </button>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === "flashcards" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Flashcards</h3>
            <p className="text-gray-600 mb-6">
              {document.flashcardCount > 0
                ? `${document.flashcardCount} flashcard${document.flashcardCount > 1 ? 's' : ''} available`
                : "No flashcards generated yet"}
            </p>
            {document.flashcardCount > 0 ? (
              <button
                onClick={() => navigate(`/documents/${id}/flashcards`)}
                className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Study Flashcards
              </button>
            ) : (
              <button
                onClick={handleGenerateFlashcards}
                disabled={generating.flashcards}
                className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {generating.flashcards ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Flashcards
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <FileQuestion className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quizzes</h3>
            <p className="text-gray-600 mb-6">
              {document.quizCount > 0
                ? `${document.quizCount} quiz${document.quizCount > 1 ? 'zes' : ''} available`
                : "No quizzes generated yet"}
            </p>
            {document.quizCount > 0 ? (
              <button
                onClick={() => toast.info("Quiz list coming soon!")}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <FileQuestion className="w-5 h-5" />
                View Quizzes
              </button>
            ) : (
              <button
                onClick={handleGenerateQuiz}
                disabled={generating.quiz}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {generating.quiz ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentDetailpage;