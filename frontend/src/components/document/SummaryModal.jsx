import React from "react";
import RemarkMarkdown from "../common/RemarkMarkdown.jsx";

function SummaryModal({ isOpen, onClose, summary, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">AI Summary</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-900"
          >
            X
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <p className="text-gray-600">Generating summary...</p>
          ) : summary?.summary ? (
            <RemarkMarkdown content={summary.summary} />
          ) : (
            <p className="text-gray-600">No summary available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
