import React from "react";
import { Award, Play, BarChart3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuizCard({ quiz, onDelete, isDeleting }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartQuiz = () => {
    // Navigate to quiz taking page
    navigate(`/quizzes/${quiz._id}`);
  };

  const handleViewResults = () => {
    // Navigate to quiz results page
    navigate(`/quizzes/${quiz._id}/results`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all relative">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(quiz._id);
          }}
          className="absolute right-4 top-4 p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-60"
          disabled={isDeleting}
          title="Delete quiz"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {/* Score Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
          <Award className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Score: {quiz.score || 0}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {quiz.title || "Quiz"}
      </h3>

      {/* Created Date */}
      <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
        Created {formatDate(quiz.createdAt)}
      </p>

      {/* Questions Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 font-medium">
          {quiz.questions?.length || 0} Questions
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {quiz.score === 0 || !quiz.score ? (
          <button
            onClick={handleStartQuiz}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </button>
        ) : (
          <button
            onClick={handleViewResults}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            View Results
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizCard;
