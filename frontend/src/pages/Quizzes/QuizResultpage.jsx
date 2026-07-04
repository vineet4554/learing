import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService.js";
import Spinner from "../../components/common/Spinner.jsx";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLayout } from "../../context/LayoutContext.jsx";

function QuizResultpage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setIsSidebarHidden, setIsHeaderHidden, setIsContentPaddingHidden } = useLayout();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsSidebarHidden(true);
    setIsHeaderHidden(true);
    setIsContentPaddingHidden(true);
    return () => {
      setIsSidebarHidden(false);
      setIsHeaderHidden(false);
      setIsContentPaddingHidden(false);
    };
  }, [setIsSidebarHidden, setIsHeaderHidden, setIsContentPaddingHidden]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(id);
        if (data?.success) {
          setResult(data.data);
        } else {
          throw new Error(data?.message || "Failed to load quiz results");
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        toast.error(error.message || "Failed to load quiz results");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return <Spinner text="Loading quiz results..." fullScreen />;
  }

  if (!result) {
    return null;
  }

  const { score, totalQuestions, correctAnswers, incorrectAnswers } = result;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="quiz-result-page min-h-dvh bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="quiz-result-header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to quiz</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl w-full mx-auto px-6 py-10 space-y-8 flex-1">
        {/* Hero */}
        <div className="quiz-result-hero relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-400/10 blur-3xl" />

          <div className="relative p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  <Trophy className="w-4 h-4" />
                  Prime Results
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Quiz Results
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  You answered {score} out of {totalQuestions} questions correctly.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center w-28 h-28 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-3xl font-bold">
                      <span>{percentage}</span>
                      <Percent className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-300 dark:text-slate-400 mt-1">Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Correct</p>
                      <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                        {correctAnswers ?? score}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Incorrect</p>
                      <p className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                        {incorrectAnswers ?? totalQuestions - score}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="quiz-result-stat bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Questions
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {totalQuestions}
            </p>
          </div>
          <div className="quiz-result-stat bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Accuracy
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {percentage}%
            </p>
          </div>
          <div className="quiz-result-stat bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Missed
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {incorrectAnswers ?? totalQuestions - score}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pb-6">
          <button
            onClick={() => navigate(`/quizzes/${id}`)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            Retake Quiz
          </button>

          <button
            onClick={() => navigate(`/quizzes/${id}/answers`)}
            className="quiz-result-secondary-btn inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Detail Answers
          </button>

          <button
            onClick={() => navigate("/documents")}
            className="quiz-result-secondary-btn inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizResultpage;
