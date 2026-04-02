import React from "react";
import { ExternalLink, FileText } from "lucide-react";

function DocumentContentTab({ document, summary, getDocumentUrl, showSummary = true }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Document Viewer</h2>
          {document.filePath && (
            <a
              href={getDocumentUrl(document.filePath)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </a>
          )}
        </div>

        {document.filePath ? (
          <div className="w-full h-[400px] sm:h-[500px] lg:h-[650px]">
            <iframe
              src={getDocumentUrl(document.filePath)}
              className="w-full h-full border-0"
              title="Document Viewer"
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Document preview not available</p>
          </div>
        )}
      </div>

      {showSummary && summary && (
        <div className="bg-white rounded-2xl shadow-sm mt-6 p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Summary
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary.summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentContentTab;
