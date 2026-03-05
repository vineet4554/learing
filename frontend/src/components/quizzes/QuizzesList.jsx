import React, { useState, useEffect } from "react";
import quizService from "../../services/quizService.js";
import QuizCard from "./QuizCard.jsx";
import { Loader2, FileQuestion } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal.jsx";

function QuizzesList({
  documentId,
  refreshKey = 0,
  onCountChange,
  showEmptyState = true,
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [documentId, refreshKey]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzesForDocument(documentId);

      if (response?.success) {
        const nextQuizzes = response.data || [];
        setQuizzes(nextQuizzes);
        if (onCountChange) onCountChange(nextQuizzes.length);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
      if (onCountChange) onCountChange(0);
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
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error(error.message || "Failed to delete quiz");
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="text-center py-12">
        <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No quizzes found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={handleDeleteRequest}
            isDeleting={deletingId === quiz._id}
          />
        ))}
      </div>
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
    </>
  );
}

export default QuizzesList;
