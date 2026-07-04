import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService.js";
import Spinner from "../../components/common/Spinner.jsx";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLayout } from "../../context/LayoutContext.jsx";

function QuizAnswerspage() {
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
          throw new Error(data?.message || "Failed to load quiz details");
        }
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        toast.error(error.message || "Failed to load quiz details");
        navigate(`/quizzes/${id}/results`);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return <Spinner text="Loading answer details..." fullScreen />;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="quiz-answers-page min-h-dvh bg-emerald-50/40 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="quiz-answers-header bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to results</span>
          </button>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">
            {result.title || "Quiz"} · {result.totalQuestions} questions
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-6 py-10 flex-1">
        <div className="quiz-answers-summary bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
            Answer Details
          </h1>
          <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-1">
            Review correct answers and explanations.
          </p>
        </div>

        <div className="space-y-4">
          {result.results.map((item) => (
            <div
              key={item.questionIndex}
              className="quiz-answers-card bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">
                    Question {item.questionIndex + 1}
                  </div>
                  <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-100 mt-2">
                    {item.questionText}
                  </h2>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    item.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {item.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Incorrect
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-100 dark:border-slate-800 p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <p className="text-xs uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">
                    Your Answer
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-950 dark:text-emerald-300">
                    {item.userAnswer || "No answer"}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 dark:border-slate-850 p-4 bg-white dark:bg-slate-850/50">
                  <p className="text-xs uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">
                    Correct Answer
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-950 dark:text-emerald-300">
                    {item.correctAnswer}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.options.map((option, optionIndex) => {
                  const isCorrect = option === item.correctAnswer;
                  const isUserAnswer = option === item.userAnswer;
                  const isWrongSelected = isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={`${item.questionIndex}-${optionIndex}`}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                        isCorrect
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                          : isWrongSelected
                          ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300"
                          : "border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-emerald-950 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{option}</span>
                        {isCorrect && (
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Correct
                          </span>
                        )}
                        {isWrongSelected && (
                          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                            Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-850/30">
                <p className="text-xs uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">
                  Explanation
                </p>
                <p className="mt-2 text-sm text-emerald-950 dark:text-slate-300">
                  {item.explanation?.trim()
                    ? item.explanation
                    : "No explanation provided for this question."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizAnswerspage;
