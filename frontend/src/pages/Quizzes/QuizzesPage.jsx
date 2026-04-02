import React, { useEffect, useState } from "react";
import { ArrowLeft, FileQuestion, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner.jsx";
import QuizCard from "../../components/quizzes/QuizCard.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import documentService from "../../services/documentservice.js";
import quizService from "../../services/quizService.js";

function QuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    fetchAllQuizzes();
  }, []);

  const fetchAllQuizzes = async () => {
    try {
      setLoading(true);

      const docsRes = await documentService.getDocuments();
      const docs =
        docsRes?.data && Array.isArray(docsRes.data)
          ? docsRes.data
          : Array.isArray(docsRes)
          ? docsRes
          : [];

      if (docs.length === 0) {
        setQuizzes([]);
        return;
      }

      const results = await Promise.allSettled(
        docs.map((doc) => quizService.getQuizzesForDocument(doc._id))
      );

      const allQuizzes = results
        .filter((r) => r.status === "fulfilled" && r.value?.success)
        .flatMap((r) => r.value.data || []);

      allQuizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(allQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error(error?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (quizId) => {
    setPendingDelete(quizId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeletingId(pendingDelete);
      await quizService.deleteQuiz(pendingDelete);
      toast.success("Quiz deleted");
      await fetchAllQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error(error?.message || "Failed to delete quiz");
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const getDocumentId = (quiz) => quiz.documentId?._id || quiz.documentId;

  const documentsMap = new Map();
  quizzes.forEach((quiz) => {
    const documentId = getDocumentId(quiz);
    if (!documentId) return;

    if (!documentsMap.has(documentId)) {
      documentsMap.set(documentId, {
        documentId,
        documentName: quiz.documentId?.title || quiz.documentId?.fileName || "Untitled Document",
        quizCount: 0,
      });
    }

    documentsMap.get(documentId).quizCount += 1;
  });

  const documentCards = Array.from(documentsMap.values());
  const selectedDocument = documentCards.find((doc) => doc.documentId === selectedDocumentId) || null;
  const selectedDocumentQuizzes = selectedDocumentId
    ? quizzes.filter((quiz) => getDocumentId(quiz) === selectedDocumentId)
    : [];

  useEffect(() => {
    if (selectedDocumentId && !documentCards.some((doc) => doc.documentId === selectedDocumentId)) {
      setSelectedDocumentId(null);
    }
  }, [selectedDocumentId, documentCards]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner text="Loading quizzes..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-500 mt-1">
          {selectedDocument
            ? `${selectedDocument.quizCount} quiz set${selectedDocument.quizCount !== 1 ? "s" : ""} in ${selectedDocument.documentName}`
            : "All your generated quizzes in one place"}
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <FileQuestion className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <p className="text-lg font-semibold text-gray-900">No quizzes yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Generate quizzes from your documents to see them here.
          </p>
          <button
            onClick={() => navigate("/documents")}
            className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-600 hover:to-teal-600"
          >
            Go to Documents
          </button>
        </div>
      ) : (
        selectedDocumentId ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDocumentId(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to documents
            </button>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {selectedDocumentQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  onDelete={handleDeleteRequest}
                  isDeleting={deletingId === quiz._id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {documentCards.map((document) => (
              <button
                key={document.documentId}
                onClick={() => setSelectedDocumentId(document.documentId)}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">
                  {document.documentName}
                </h3>
                <p className="text-sm text-gray-600">
                  {document.quizCount} quiz set{document.quizCount !== 1 ? "s" : ""} available
                </p>
              </button>
            ))}
          </div>
        )
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete quiz?"
        description="This will permanently remove the quiz and its results."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (deletingId) return;
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        loading={deletingId !== null}
      />
    </div>
  );
}

export default QuizzesPage;
