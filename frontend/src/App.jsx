import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/Authcontext.jsx";

import Registerpage from "./pages/Auth/Registerpage.jsx";
import Loginpage from "./pages/Auth/Loginpage.jsx";
import Homepage from "./pages/Homepage.jsx";
import Dashboardpage from "./pages/Dashboard/Dashboardpage.jsx";
import Documentlistpage from "./pages/Documents/Documentlistpage.jsx";
import DocumentDetailpage from "./pages/Documents/DocumentDetailpage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import FlashcardListpage from "./pages/Flashcards/FlashcardListpage.jsx";
import Flashcardpage from "./pages/Flashcards/Flashcardpage.jsx";
import QuizzesPage from "./pages/Quizzes/QuizzesPage.jsx";
import QuizTakepage from "./pages/Quizzes/QuizTakepage.jsx";
import QuizResultpage from "./pages/Quizzes/QuizResultpage.jsx";
import QuizAnswerspage from "./pages/Quizzes/QuizAnswerspage.jsx";
import Profilepage from "./pages/Profile/Profilepage.jsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/80 bg-white/80 px-8 py-6 text-center shadow-sm backdrop-blur">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-700">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />
        <Route path="/home" element={<Homepage />} />

        <Route path="/register" element={<Registerpage />} />
        <Route path="/login" element={<Loginpage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboardpage />} />
          <Route path="/documents" element={<Documentlistpage />} />
          <Route path="/documents/:id" element={<DocumentDetailpage />} />
          <Route path="/flashcards" element={<FlashcardListpage />} />
          <Route path="/documents/:id/flashcards" element={<Flashcardpage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizTakepage />} />
          <Route path="/quizzes/:id/results" element={<QuizResultpage />} />
          <Route path="/quizzes/:id/answers" element={<QuizAnswerspage />} />
          <Route path="/profile" element={<Profilepage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
