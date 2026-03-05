import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function QuizTakepage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(id));

      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitRequest = () => {
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount === 0) {
      toast.error("Please answer at least one question before submitting.");
      setShowSubmitModal(false);
      return;
    }

    setSubmitting(true);

    try {
      // backend expects an array of { questionIndex, selectedOption }
      const payloadAnswers = Object.entries(answers).map(
        ([questionIndex, selectedOption]) => ({
          questionIndex: Number(questionIndex),
          selectedOption,
        })
      );

      const response = await axiosInstance.post(
        API_PATHS.QUIZZES.SUBMIT_QUIZ(id),
        { answers: payloadAnswers }
      );

      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        navigate(`/quizzes/${id}/results`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      const backendMsg = error.response?.data?.message;
      toast.error(backendMsg || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, quiz]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <button
            onClick={() => navigate("/documents")}
            className="text-emerald-500 font-semibold hover:text-emerald-600"
          >
            Go back to documents
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-emerald-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Exit Quiz</span>
            </button>

            <div className="text-xs text-emerald-700/80">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>

        {/* Quiz Title */}
        <div className="bg-white rounded-2xl border border-emerald-100 px-6 py-6">
          <h1 className="text-2xl font-bold text-emerald-950 mb-1">
            {quiz.title || "Quiz"}
          </h1>
          <p className="text-xs text-emerald-700/70">
            {answeredCount} answered
          </p>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-8">
          {/* Question Number Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full mb-6 text-xs font-semibold">
            Question {currentQuestionIndex + 1}
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-emerald-950 mb-8">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestionIndex] === option;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-emerald-100 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-emerald-200"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span
                      className={`text-lg ${
                        isSelected
                          ? "text-emerald-900 font-semibold"
                          : "text-emerald-950"
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold rounded-xl border border-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-emerald-100">
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-950">
                Exit Quiz
              </h3>
              <button
                onClick={() => setShowExitModal(false)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                X
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-emerald-900">
                Are you sure you want to exit? Your progress will be lost.
              </p>
            </div>

            <div className="px-6 py-5 border-t border-emerald-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-emerald-100">
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-950">
                Submit Quiz
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                X
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-emerald-900">
                Are you sure you want to submit this quiz?
              </p>
              {unansweredCount > 0 && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}.
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t border-emerald-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizTakepage;
