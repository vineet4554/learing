import React, { useState, useEffect } from "react";
import Spinner from '../../components/common/Spinner.jsx';
import progressService from '../../services/progressService.js';
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Clock,
  TrendingUp,
  BrainCircuit,
  Eye,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function Dashboardpage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, [location.key]);

  useEffect(() => {
    if (location.hash !== "#recent-activity" || loading) return;
    const section = document.getElementById("recent-activity");
    if (!section) return;
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [location.hash, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await progressService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  // Helper function to get navigation path based on activity type
  const getActivityNavigationPath = (activity) => {
    const type = activity.type?.toLowerCase() || '';
    const documentId = activity.documentId || activity.document_id;
    const quizId = activity.quizId || activity.quiz_id;

    // Navigate based on activity type
    if (type.includes('document')) {
      return documentId ? `/documents/${documentId}` : '/documents';
    } else if (type.includes('flashcard')) {
      return documentId ? `/documents/${documentId}/flashcards` : '/flashcards';
    } else if (type.includes('quiz')) {
      return quizId ? `/quizzes/${quizId}` : '/documents';
    }
    
    // Default fallback
    return documentId ? `/documents/${documentId}` : '/documents';
  };

  const handleActivityClick = (activity) => {
    const path = getActivityNavigationPath(activity);
    navigate(path);
  };

  const formatActivityTimestamp = (timestamp) => {
    if (!timestamp) return "No date available";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "No date available";
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State - only show if no data at all
  if (!dashboardData || !dashboardData.data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg mb-2">No dashboard data available.</p>
          <p className="text-gray-500 text-sm mb-6">Start by uploading your first document</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25"
          >
            Upload Your First Document
          </button>
        </div>
      </div>
    );
  }

  // Extract the nested data object
  const data = dashboardData.data || dashboardData;
  const overview = data.overview || {};
  
  const stats = [
    {
      label: 'TOTAL DOCUMENTS',
      value: overview.totalDocuments || 0,
      icon: FileText,
      bgGradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      path: '/documents',
    },
    {
      label: 'TOTAL FLASHCARDS',
      value: overview.totalFlashcards || 0,
      icon: BookOpen,
      bgGradient: 'from-cyan-400 to-blue-500',
      shadowColor: 'shadow-cyan-500/20',
      path: '/flashcards',
    },
    {
      label: 'TOTAL QUIZZES',
      value: overview.totalQuizzes || overview.toatalQuizzes || 0,
      icon: BrainCircuit,
      bgGradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
    }
  ];

  // Format recent activities - combine all activity types
  const recentActivityData = data.recentActivity || {};
  
  // Create a unified activity list
  const allActivities = [];
  
  // Add documents
  if (recentActivityData.documents && recentActivityData.documents.length > 0) {
    recentActivityData.documents.forEach(doc => {
      allActivities.push({
        id: doc._id,
        type: 'Uploaded Document',
        title: doc.title,
        documentId: doc._id,
        timestamp: doc.uploadDate || doc.updatedAt || doc.createdAt,
        icon: FileText
      });
    });
  }
  
  // Add flashcards
  if (recentActivityData.flashcards && recentActivityData.flashcards.length > 0) {
    recentActivityData.flashcards.forEach(flashcard => {
      allActivities.push({
        id: flashcard._id,
        type: 'Created Flashcard Set',
        title: flashcard.documentId?.title || 'Flashcard Set',
        documentId: flashcard.documentId?._id || flashcard.documentId,
        timestamp: flashcard.createdAt,
        icon: BookOpen
      });
    });
  }
  
  // Add quizzes
  if (recentActivityData.quizzes && recentActivityData.quizzes.length > 0) {
    recentActivityData.quizzes.forEach(quiz => {
      allActivities.push({
        id: quiz._id,
        type: 'Created Quiz',
        title: quiz.title || 'Quiz',
        documentId: quiz.documentId?._id || quiz.documentId,
        quizId: quiz._id,
        timestamp: quiz.createdAt,
        icon: BrainCircuit,
        meta: `${quiz.totalQuestions} questions`
      });
    });
  }
  
  // Sort by timestamp (most recent first)
  const recentActivities = allActivities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // Show only the 10 most recent activities

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">Dashboard</h1>
        <p className="text-gray-500">Track your learning progress and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow ${
                stat.path ? "hover:shadow-md cursor-pointer" : ""
              }`}
              onClick={() => {
                if (stat.path) navigate(stat.path);
              }}
              role={stat.path ? "button" : undefined}
              tabIndex={stat.path ? 0 : undefined}
              onKeyDown={(e) => {
                if (!stat.path) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(stat.path);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
                    {stat.label}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div id="recent-activity" className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
              const ActivityIcon = activity.icon || Clock;
              return (
                <div
                  key={activity.id || index}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ActivityIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium mb-1 break-words">
                            {activity.type}: {activity.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>
                              {formatActivityTimestamp(activity.timestamp)}
                            </span>
                            {activity.meta && (
                              <>
                                <span>|</span>
                                <span>{activity.meta}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No recent activity yet</p>
              <p className="text-gray-400 text-xs mt-1">Your activity will appear here</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboardpage;

