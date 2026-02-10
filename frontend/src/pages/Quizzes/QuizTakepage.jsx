import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
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

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers({
      ...answers,
      [questionId]: selectedOption,
    });
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

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZZES.SUBMIT_QUIZ(id),
        { answers }
      );

      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        navigate(`/quizzes/${id}/results`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
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
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit Quiz</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {answeredCount} answered
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz.title || "Quiz"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          {/* Question Number Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg mb-6">
            <span className="font-semibold">Question {currentQuestionIndex + 1}</span>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion._id] === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion._id, option)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-300"
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
                          : "text-gray-900"
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
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Question Grid */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Questions</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quiz.questions.map((question, index) => {
              const isAnswered = answers[question._id] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={question._id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                    isCurrent
                      ? "bg-emerald-500 text-white shadow-lg scale-110"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard Hint */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Use ← → arrow keys to navigate between questions
        </p>
      </div>
    </div>
  );
}

export default QuizTakepage;