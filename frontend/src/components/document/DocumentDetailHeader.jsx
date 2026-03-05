import React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

function DocumentDetailHeader({
  title,
  onBack,
  onDelete,
  isEditingTitle,
  editedTitle,
  onTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveTitle,
  savingTitle,
}) {
  return (
    <div className="mx-4 sm:mx-6 mt-4 bg-white border border-gray-200 rounded-2xl px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Documents</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {isEditingTitle ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={onTitleChange}
                  className="px-3 py-2 border-2 border-emerald-400 rounded-xl outline-none text-lg font-semibold text-gray-900 bg-white min-w-[220px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={onSaveTitle}
                    disabled={savingTitle || !editedTitle.trim()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {savingTitle ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    disabled={savingTitle}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <button
                  onClick={onStartEdit}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline-offset-4 hover:underline"
                >
                  Edit title
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailHeader;
