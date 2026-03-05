import React from "react";
import { AlertCircle } from "lucide-react";

function DocumentNotFound({ onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document not found
        </h2>
        <button
          onClick={onBack}
          className="text-emerald-500 font-semibold hover:text-emerald-600"
        >
          Go back to documents
        </button>
      </div>
    </div>
  );
}

export default DocumentNotFound;
