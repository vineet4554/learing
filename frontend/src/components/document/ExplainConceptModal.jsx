import React from "react";
import { Lightbulb, Loader2, Send } from "lucide-react";
import RemarkMarkdown from "../common/RemarkMarkdown.jsx";

function ExplainConceptModal({
  isOpen,
  onClose,
  messages,
  input,
  loading,
  onInputChange,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Explain Concept</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-900"
          >
            X
          </button>
        </div>

        <div className="h-[420px] overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              Ask a concept and get a clear explanation from this file.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <RemarkMarkdown content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={onInputChange}
              disabled={loading}
              placeholder="Ask a concept (e.g. what is recursion?)"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExplainConceptModal;
