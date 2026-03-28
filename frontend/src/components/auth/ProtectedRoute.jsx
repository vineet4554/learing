import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.jsx";
import AppLayout from "../layout/AppLayout.jsx";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/80 bg-white/80 px-8 py-6 text-center shadow-sm backdrop-blur">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-700">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <AppLayout />;
};

export default ProtectedRoute;
