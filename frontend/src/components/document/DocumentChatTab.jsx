import React, { useEffect, useRef } from "react";
import {
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import RemarkMarkdown from "../common/RemarkMarkdown.jsx";

function DocumentChatTab({
  chatMessages,
  chatLoading,
  chatInput,
  onChatInputChange,
  onChatSubmit,
  isActive = true,
  emptyTitle = "Start a conversation",
  emptyDescription = "Ask questions, request explanations, or get insights",
  inputPlaceholder = "Ask a question...",
}) {
  const endRef = useRef(null);

  const scrollToLatest = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToLatest();
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setTimeout(() => {
      scrollToLatest();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [isActive]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {emptyTitle}
            </p>
            <p className="text-sm text-gray-500">
              {emptyDescription}
            </p>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-6 py-5 ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-900"
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
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-6 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onChatSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={onChatInputChange}
            placeholder={inputPlaceholder}
            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocumentChatTab;
