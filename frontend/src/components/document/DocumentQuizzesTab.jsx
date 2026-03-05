import React from "react";
import { FileQuestion, Loader2, Plus, Sparkles } from "lucide-react";
import QuizzesList from "../quizzes/QuizzesList.jsx";

function DocumentQuizzesTab({
  documentId,
  document,
  quizCount,
  onCountChange,
  generating,
  onOpenQuizModal,
  refreshKey,
}) {
  const resolvedCount =
    typeof quizCount === "number"
      ? quizCount
      : typeof document.quizCount === "number"
        ? document.quizCount
        : null;
  const hasCount = typeof resolvedCount === "number";
  const displayCount = hasCount ? resolvedCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
          <p className="text-gray-600 mt-1">
            {!hasCount
              ? "Loading quizzes..."
              : displayCount > 0
                ? `${displayCount} quiz${displayCount > 1 ? "zes" : ""} available`
                : "No quizzes generated yet"}
          </p>
        </div>
        <button
          onClick={onOpenQuizModal}
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

      {hasCount && displayCount === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a quiz to test your knowledge on this document.
          </p>
          <button
            onClick={onOpenQuizModal}
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
      ) : (
        <QuizzesList
          documentId={documentId}
          refreshKey={refreshKey}
          onCountChange={onCountChange}
          showEmptyState={false}
        />
      )}
    </div>
  );
}

export default DocumentQuizzesTab;
