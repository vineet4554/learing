import React from "react";
import {
  BookOpen,
  FileQuestion,
  FileText,
  Lightbulb,
  Loader2,
} from "lucide-react";

function DocumentAiActionsTab({
  generating,
  onGenerateFlashcards,
  onOpenQuizModal,
  onGenerateSummary,
  onOpenExplainConcept,
}) {
  const arrow = "\u2192";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={onGenerateFlashcards}
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Generate Flashcards
        </h3>
        <p className="text-gray-600 mb-4">
          Create interactive flashcards from this document for effective
          studying
        </p>
        <div className="text-purple-600 font-semibold">
          {generating.flashcards ? "Generating..." : `Generate Now ${arrow}`}
        </div>
      </button>

      <button
        onClick={onOpenQuizModal}
        disabled={generating.quiz}
        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-left disabled:opacity-50"
      >
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
          {generating.quiz ? (
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          ) : (
            <FileQuestion className="w-6 h-6 text-emerald-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Generate Quiz
        </h3>
        <p className="text-gray-600 mb-4">
          Create a quiz to test your understanding of this document.
        </p>
        <div className="text-emerald-600 font-semibold">
          {generating.quiz ? "Generating..." : `Generate Now ${arrow}`}
        </div>
      </button>

      <button
        onClick={onGenerateSummary}
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Generate Summary
        </h3>
        <p className="text-gray-600 mb-4">
          Get a concise summary highlighting the key points of the document.
        </p>
        <div className="text-blue-600 font-semibold">
          {generating.summary ? "Generating..." : `Generate Now ${arrow}`}
        </div>
      </button>

      <button
        onClick={onOpenExplainConcept}
        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-left"
      >
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
          <Lightbulb className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Explain Concept
        </h3>
        <p className="text-gray-600 mb-4">
          Ask any concept from this file and get a clear explanation.
        </p>
        <div className="text-orange-600 font-semibold">{`Open Explain Chat ${arrow}`}</div>
      </button>
    </div>
  );
}

export default DocumentAiActionsTab;
