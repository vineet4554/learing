import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService.js';
import Spinner from '../../components/common/Spinner.jsx';
import {
  Play,
  BarChart3,
  Trash2,
  Calendar,
  HelpCircle,
  Trophy,
  Clock,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

function QuizzesList({ documentId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizzesForDocument(documentId);
      
      if (data.success) {
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error(error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/quizzes/${quizId}/results`);
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      setDeletingId(quizId);
      await quizService.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      fetchQuizzes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error(error.message || 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreBadgeColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-700';
    if (percentage >= 60) return 'bg-blue-100 text-blue-700';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return <Spinner text="Loading quizzes..." />;
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes available</h3>
        <p className="text-gray-600">Generate a quiz to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        const isCompleted = quiz.completed || quiz.score > 0;
        const scorePercentage = quiz.totalQuestions > 0 
          ? Math.round((quiz.score / quiz.totalQuestions) * 100) 
          : 0;

        return (
          <div
            key={quiz._id}
            className="bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all p-6"
          >
            {/* Score Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isCompleted 
                  ? getScoreBadgeColor(quiz.score, quiz.totalQuestions)
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Trophy className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  Score: {isCompleted ? `${quiz.score}/${quiz.totalQuestions}` : '0'}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteQuiz(quiz._id, e)}
                disabled={deletingId === quiz._id}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                title="Delete quiz"
              >
                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </button>
            </div>

            {/* Quiz Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {quiz.title || 'Untitled Quiz'}
            </h3>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>CREATED {formatDate(quiz.createdAt).toUpperCase()}</span>
            </div>

            {/* Question Count */}
            <div className="flex items-center gap-2 text-gray-700 mb-6 pb-6 border-b border-gray-100">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">{quiz.totalQuestions} Questions</span>
            </div>

            {/* Action Button */}
            {isCompleted ? (
              <button
                onClick={() => handleViewResults(quiz._id)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Results
              </button>
            ) : (
              <button
                onClick={() => handleStartQuiz(quiz._id)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </button>
            )}

            {/* Score Percentage (if completed) */}
            {isCompleted && (
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-600">
                  Score: <span className="font-semibold">{scorePercentage}%</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default QuizzesList;