import React from "react";
import { ExternalLink, FileText } from "lucide-react";

function DocumentContentTab({ document, summary, getDocumentUrl, showSummary = true }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Document Viewer</h2>
          {document.filePath && (
            <a
              href={getDocumentUrl(document.filePath)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-455 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </a>
          )}
        </div>

        {document.filePath ? (
          <div className="w-full h-[500px] lg:h-[70vh]">
            <iframe
              src={getDocumentUrl(document.filePath)}
              className="w-full h-full border-0"
              title="Document Viewer"
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">Document preview not available</p>
          </div>
        )}
      </div>

      {showSummary && summary && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm mt-6 p-6 border border-gray-100 dark:border-slate-800 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
            AI Summary
          </h3>
          <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {summary.summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentContentTab;
