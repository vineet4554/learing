import React from "react";

function QuizModal({
  isOpen,
  onClose,
  quizTitle,
  onTitleChange,
  quizQuestionCount,
  onQuestionCountChange,
  onSubmit,
  generating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-emerald-100">
        <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-emerald-950">Generate Quiz</h3>
          <button
            onClick={onClose}
            className="text-emerald-700 hover:text-emerald-900"
          >
            X
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={onTitleChange}
              placeholder="Enter quiz title"
              className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:border-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min={3}
              max={25}
              value={quizQuestionCount}
              onChange={onQuestionCountChange}
              className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:border-emerald-400 outline-none"
            />
            <p className="text-xs text-emerald-700/70 mt-2">
              Choose between 3 and 25 questions.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-emerald-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-50"
            disabled={generating.quiz}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={generating.quiz}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50"
          >
            {generating.quiz ? "Generating..." : "Generate Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizModal;
