import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Play, BarChart3, Trophy, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function QuizzesList({ documentId }) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  const fetchQuizzes = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId)
      );

      if (response.data.success) {
        setQuizzes(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreBadgeColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage === 0) return "bg-gray-100 text-gray-700";
    if (percentage === 100) return "bg-emerald-100 text-emerald-700";
    if (percentage >= 70) return "bg-blue-100 text-blue-700";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        const isCompleted = quiz.score !== undefined && quiz.score !== null;
        const scorePercentage = isCompleted
          ? ((quiz.score / quiz.totalQuestions) * 100).toFixed(0)
          : 0;

        return (
          <div
            key={quiz._id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-2 border-gray-100"
          >
            {/* Score Badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getScoreBadgeColor(
                  quiz.score || 0,
                  quiz.totalQuestions
                )}`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-bold">
                  Score: {quiz.score || 0}
                </span>
              </div>
              {isCompleted && (
                <div className="text-sm font-semibold text-emerald-600">
                  {scorePercentage}%
                </div>
              )}
            </div>

            {/* Quiz Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {quiz.title || "Untitled Quiz"}
            </h3>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(quiz.createdAt)}</span>
            </div>

            {/* Questions Count */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-gray-600 font-medium">
                {quiz.totalQuestions} Questions
              </p>
            </div>

            {/* Action Button */}
            {isCompleted ? (
              <button
                onClick={() => navigate(`/quizzes/${quiz._id}/results`)}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Results
              </button>
            ) : (
              <button
                onClick={() => navigate(`/quizzes/${quiz._id}`)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default QuizzesList;