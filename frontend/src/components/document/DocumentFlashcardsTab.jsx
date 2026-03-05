import React from "react";
import { BookOpen, Loader2, Plus, Sparkles } from "lucide-react";
import FlashcardSetsList from "../flashcard/FlashcardSetsList.jsx";

function DocumentFlashcardsTab({
  documentId,
  document,
  flashcardCount,
  onCountChange,
  generating,
  onGenerateFlashcards,
  refreshKey,
}) {
  const resolvedCount =
    typeof flashcardCount === "number"
      ? flashcardCount
      : typeof document.flashcardCount === "number"
        ? document.flashcardCount
        : null;
  const hasCount = typeof resolvedCount === "number";
  const displayCount = hasCount ? resolvedCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <p className="text-gray-600 mt-1">
            {!hasCount
              ? "Loading flashcards..."
              : displayCount > 0
                ? `${displayCount} flashcard set${displayCount > 1 ? "s" : ""} available`
                : "No flashcards generated yet"}
          </p>
        </div>
        <button
          onClick={onGenerateFlashcards}
          disabled={generating.flashcards}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
        >
          {generating.flashcards ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Generate Flashcards
            </>
          )}
        </button>
      </div>

      {hasCount && displayCount === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No flashcard sets yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate flashcards from this document to start studying.
          </p>
          <button
            onClick={onGenerateFlashcards}
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
        </div>
      ) : (
        <FlashcardSetsList
          documentId={documentId}
          refreshKey={refreshKey}
          onCountChange={onCountChange}
          showEmptyState={false}
        />
      )}
    </div>
  );
}

export default DocumentFlashcardsTab;
