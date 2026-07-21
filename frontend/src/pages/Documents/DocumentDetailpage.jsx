import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lightbulb, MessageSquare, X } from "lucide-react";
import axiosInstance from "../../utils/axiosinstance.js";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths.js";
import documentService from "../../services/documentservice.js";
import aiService from "../../services/aiService.js";
import toast from "react-hot-toast";
import DocumentDetailHeader from "../../components/document/DocumentDetailHeader.jsx";
import DocumentTabs from "../../components/document/DocumentTabs.jsx";
import DocumentContentTab from "../../components/document/DocumentContentTab.jsx";
import DocumentChatTab from "../../components/document/DocumentChatTab.jsx";
import DocumentAiActionsTab from "../../components/document/DocumentAiActionsTab.jsx";
import DocumentFlashcardsTab from "../../components/document/DocumentFlashcardsTab.jsx";
import DocumentQuizzesTab from "../../components/document/DocumentQuizzesTab.jsx";
import QuizModal from "../../components/document/QuizModal.jsx";
import ExplainConceptModal from "../../components/document/ExplainConceptModal.jsx";
import SummaryModal from "../../components/document/SummaryModal.jsx";
import DocumentLoadingState from "../../components/document/DocumentLoadingState.jsx";
import DocumentNotFound from "../../components/document/DocumentNotFound.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import { useLayout } from "../../context/LayoutContext.jsx";

function DocumentDetailpage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setIsSidebarHidden, setIsHeaderHidden, setIsContentPaddingHidden } = useLayout();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [isAIFocusMode, setIsAIFocusMode] = useState(false);
  const [generating, setGenerating] = useState({
    flashcards: false,
    quiz: false,
    summary: false,
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [quizCount, setQuizCount] = useState(null);
  const [quizRefreshKey, setQuizRefreshKey] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(null);
  const [flashcardRefreshKey, setFlashcardRefreshKey] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [conceptLoading, setConceptLoading] = useState(false);
  const [conceptMessages, setConceptMessages] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [assistantMode, setAssistantMode] = useState("chat");

  useEffect(() => {
    setQuizCount(null);
    setQuizRefreshKey(0);
    setFlashcardCount(null);
    setFlashcardRefreshKey(0);
    fetchDocument();
    fetchChatHistory();
    fetchConceptHistory();
  }, [id]);

  useEffect(() => {
    setIsSidebarHidden(isAIFocusMode);
    setIsHeaderHidden(isAIFocusMode);
    setIsContentPaddingHidden(isAIFocusMode);
    return () => {
      setIsSidebarHidden(false);
      setIsHeaderHidden(false);
      setIsContentPaddingHidden(false);
    };
  }, [isAIFocusMode, setIsSidebarHidden, setIsHeaderHidden, setIsContentPaddingHidden]);

  const fetchConceptHistory = async () => {
    try {
      const response = await aiService.getConceptHistory(id);
      if (response?.success) {
        const messages = (response.data || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        setConceptMessages(messages);
      }
    } catch (error) {
      console.error("Error fetching concept history:", error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setChatHistoryLoading(true);
      const response = await aiService.getChatHistory(id);
      if (response?.success) {
        const messages = (response.data || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        setChatMessages(messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error(error.message || "Failed to load chat history");
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const fetchDocument = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
      );
      
      if (response.data.success) {
        setDocument(response.data.data);
        setEditedTitle(response.data.data.title || "");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document");
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || !document) return;

    try {
      setSavingTitle(true);
      const res = await documentService.updateDocument(document._id, {
        title: editedTitle.trim(),
      });

      if (res?.success === false) {
        throw new Error(res?.message || "Failed to update title");
      }

      toast.success("Title updated successfully");
      const updatedDoc =
        res?.data && typeof res.data === "object" ? res.data : document;

      setDocument((prev) => ({
        ...prev,
        ...(updatedDoc || {}),
        title: editedTitle.trim(),
      }));
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Update title error:", error);
      toast.error(error?.message || "Failed to update title");
    } finally {
      setSavingTitle(false);
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
        setFlashcardCount(null);
        setFlashcardRefreshKey((prev) => prev + 1);
        fetchDocument();
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error(error.response?.data?.message || "Failed to generate flashcards");
    } finally {
      setGenerating({ ...generating, flashcards: false });
    }
  };

  const handleGenerateQuiz = async ({ title, numberOfQuestions, topicName } = {}) => {
    setGenerating({ ...generating, quiz: true });
    
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUIZ,
        { documentId: id, title, numberOfQuestions, topicName }
      );
      
      if (response.data.success) {
        toast.success("Quiz generated successfully!");
        setActiveTab("quizzes");
        setQuizCount(null);
        setQuizRefreshKey((prev) => prev + 1);
        setShowQuizModal(false);
        fetchDocument();
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setGenerating({ ...generating, quiz: false });
    }
  };

  const openQuizModal = () => {
    setQuizTitle(document?.title ? `Quiz: ${document.title}` : "");
    setQuizTopic("");
    setQuizQuestionCount(5);
    setShowQuizModal(true);
  };

  const openExplainConceptModal = () => {
    setShowExplainModal(true);
  };

  const handleQuizModalSubmit = () => {
    const trimmedTitle = quizTitle.trim();
    const trimmedTopic = quizTopic.trim();
    const count = Number(quizQuestionCount);

    if (!trimmedTitle) {
      toast.error("Please enter a quiz title.");
      return;
    }
    if (!Number.isInteger(count) || count < 3 || count > 25) {
      toast.error("Number of questions must be between 3 and 25.");
      return;
    }

    handleGenerateQuiz({
      title: trimmedTitle,
      numberOfQuestions: count,
      topicName: trimmedTopic || undefined,
    });
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
        setSummary(response.data.data);
        setShowSummaryModal(true);
      } else {
        toast.error(response.data.message || "Failed to generate summary");
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

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await aiService.chat(id, userMessage.content);

      if (!response?.success) {
        const backendMsg = response?.message || "Chat request failed on the server";
        toast.error(backendMsg);
        return;
      }

      const aiMessage = {
        role: "assistant",
        content:
          response?.data?.answer ||
          "No response returned",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const backendMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to get response";
      toast.error(backendMsg);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExplainConceptSubmit = async (e) => {
    e.preventDefault();
    if (!conceptInput.trim()) return;

    const userMessage = {
      role: "user",
      content: conceptInput.trim(),
      timestamp: new Date(),
    };

    setConceptMessages((prev) => [...prev, userMessage]);
    setConceptInput("");
    setConceptLoading(true);

    try {
      const data = await aiService.explainConcept(id, userMessage.content);
      const explanation =
        data?.explanation || "No explanation returned";

      setConceptMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: explanation,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Explain concept error:", error);
      const backendMsg =
        error?.response?.data?.message || error?.message || "Failed to explain concept";
      toast.error(backendMsg);
    } finally {
      setConceptLoading(false);
    }
  };

  const getDocumentUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
    return `${BASE_URL}${normalizedPath}`;
  };

  const handleDeleteRequest = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeletingDocument(true);
      await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
      toast.success("Document deleted successfully");
      navigate("/documents");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeletingDocument(false);
      setDeleteModalOpen(false);
    }
  };

  const tabs = [
    { id: "content", label: "Content" },
    { id: "chat", label: "Chat" },
    { id: "ai-actions", label: "AI Option" },
    { id: "flashcards", label: "Flashcards" },
    { id: "quizzes", label: "Quizzes" },
  ];

  const handleTabChange = (tabId) => {
    if (tabId !== "content") {
      setIsAIFocusMode(false);
    }

    setActiveTab(tabId);
  };

  const handleExitAIFocus = () => {
    setIsAIFocusMode(false);
    setActiveTab("content");
  };

  if (loading) {
    return <DocumentLoadingState />;
  }

  if (!document) {
    return <DocumentNotFound onBack={() => navigate("/documents")} />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/50 shadow-sm transition-colors duration-200">
      <DocumentDetailHeader
        title={document.title}
        onBack={() => navigate("/documents")}
        onDelete={handleDeleteRequest}
        isEditingTitle={isEditingTitle}
        editedTitle={editedTitle}
        onTitleChange={(e) => setEditedTitle(e.target.value)}
        onStartEdit={() => setIsEditingTitle(true)}
        onCancelEdit={() => {
          setIsEditingTitle(false);
          setEditedTitle(document.title || "");
        }}
        onSaveTitle={handleTitleSave}
        savingTitle={savingTitle}
      />

      <DocumentTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className={`${isAIFocusMode ? "w-full max-w-none px-4 sm:px-6 py-6" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"} transition-all duration-200`}>
        {/* Content Tab */}
        {activeTab === "content" && (
          isAIFocusMode ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 dark:border-slate-800 bg-emerald-50/70 dark:bg-slate-850 p-4">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block text-sm font-semibold text-emerald-950 dark:text-emerald-300 px-1 truncate max-w-xs lg:max-w-md">
                    {document.title}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                  <button
                    onClick={() => setAssistantMode("chat")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      assistantMode === "chat"
                        ? "bg-emerald-600 text-white"
                        : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat With Document
                  </button>
                  <button
                    onClick={() => setAssistantMode("explain")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      assistantMode === "explain"
                        ? "bg-emerald-600 text-white"
                        : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Explain Concept
                  </button>
                </div>

                <button
                  onClick={handleExitAIFocus}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-350 transition hover:bg-gray-100 dark:hover:bg-slate-750"
                >
                  <X className="h-4 w-4" />
                  Close AI Help
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DocumentContentTab
                  document={document}
                  summary={summary}
                  getDocumentUrl={getDocumentUrl}
                  showSummary={false}
                />

                {assistantMode === "chat" ? (
                  <DocumentChatTab
                    chatMessages={chatMessages}
                    chatLoading={chatLoading || chatHistoryLoading}
                    chatInput={chatInput}
                    onChatInputChange={(e) => setChatInput(e.target.value)}
                    onChatSubmit={handleChatSubmit}
                    isActive={activeTab === "content" && isAIFocusMode && assistantMode === "chat"}
                    emptyTitle="Chat with your document"
                    emptyDescription="Ask questions directly from the document content."
                    inputPlaceholder="Ask about this document..."
                  />
                ) : (
                  <DocumentChatTab
                    chatMessages={conceptMessages}
                    chatLoading={conceptLoading}
                    chatInput={conceptInput}
                    onChatInputChange={(e) => setConceptInput(e.target.value)}
                    onChatSubmit={handleExplainConceptSubmit}
                    isActive={activeTab === "content" && isAIFocusMode && assistantMode === "explain"}
                    emptyTitle="Explain any concept"
                    emptyDescription="Type a concept name and get a clear explanation from this document."
                    inputPlaceholder="Ask a concept (e.g. recursion, balance sheet, photosynthesis)"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setAssistantMode("chat");
                    setIsAIFocusMode(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  <MessageSquare className="h-4 w-4" />
                  AI Help
                </button>
              </div>
              <DocumentContentTab
                document={document}
                summary={summary}
                getDocumentUrl={getDocumentUrl}
              />
            </div>
          )
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <DocumentChatTab
            chatMessages={chatMessages}
            chatLoading={chatLoading || chatHistoryLoading}
            chatInput={chatInput}
            onChatInputChange={(e) => setChatInput(e.target.value)}
            onChatSubmit={handleChatSubmit}
            isActive={activeTab === "chat"}
          />
        )}

        {/* AI Actions Tab */}
        {activeTab === "ai-actions" && (
          <DocumentAiActionsTab
            generating={generating}
            onGenerateFlashcards={handleGenerateFlashcards}
            onOpenQuizModal={openQuizModal}
            onGenerateSummary={handleGenerateSummary}
            onOpenExplainConcept={openExplainConceptModal}
          />
        )}

        {/* Flashcards Tab */}
        {activeTab === "flashcards" && (
          <DocumentFlashcardsTab
            documentId={id}
            document={document}
            flashcardCount={flashcardCount}
            onCountChange={setFlashcardCount}
            generating={generating}
            onGenerateFlashcards={handleGenerateFlashcards}
            refreshKey={flashcardRefreshKey}
          />
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <DocumentQuizzesTab
            documentId={id}
            document={document}
            quizCount={quizCount}
            onCountChange={setQuizCount}
            generating={generating}
            onOpenQuizModal={openQuizModal}
            refreshKey={quizRefreshKey}
          />
        )}
      </div>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        quizTitle={quizTitle}
        onTitleChange={(e) => setQuizTitle(e.target.value)}
        quizTopic={quizTopic}
        onTopicChange={(e) => setQuizTopic(e.target.value)}
        quizQuestionCount={quizQuestionCount}
        onQuestionCountChange={(e) => setQuizQuestionCount(e.target.value)}
        onSubmit={handleQuizModalSubmit}
        generating={generating}
      />
      <ExplainConceptModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        messages={conceptMessages}
        input={conceptInput}
        loading={conceptLoading}
        onInputChange={(e) => setConceptInput(e.target.value)}
        onSubmit={handleExplainConceptSubmit}
      />
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={summary}
        loading={generating.summary}
      />
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete document?"
        description="This will permanently remove the document and its related content."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (deletingDocument) return;
          setDeleteModalOpen(false);
        }}
        loading={deletingDocument}
      />
    </div>
  );
}

export default DocumentDetailpage;
