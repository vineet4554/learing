import React from "react";
import { useNavigate } from "react-router-dom";
import { Ghost, ArrowLeft } from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <Ghost className="w-10 h-10 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-600 text-sm">
            The page you’re looking for doesn’t exist or has been moved. Check
            the URL or go back to a safe place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
