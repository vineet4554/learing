import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  FileText,
  BookOpen,
  FileQuestion,
  Clock,
  TrendingUp,
  Calendar,
  Upload,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function Dashboardpage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    studyStreak: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
      
      console.log('Dashboard data:', response.data);
      
      if (response.data.success) {
        const { overview, studyStreak, recentActivity: activity } = response.data.data;
        
        // Set stats from overview
        setStats({
          totalDocuments: overview.totalDocuments || 0,
          totalFlashcards: overview.totalFlashcards || 0,
          totalQuizzes: overview.totalQuizzes || 0,
          studyStreak: studyStreak || 0,
        });

        // Combine and format recent activity
        const allActivity = [];
        
        // Add recent documents
        if (activity.documents && activity.documents.length > 0) {
          activity.documents.forEach(doc => {
            allActivity.push({
              id: doc._id,
              type: "document",
              title: doc.title,
              subtitle: doc.fileName,
              timestamp: new Date().toLocaleString(), // Use actual timestamp if available
              status: doc.status,
            });
          });
        }
        
        // Add recent flashcards
        if (activity.flashcards && activity.flashcards.length > 0) {
          activity.flashcards.forEach(flashcard => {
            allActivity.push({
              id: flashcard._id,
              type: "flashcard",
              title: `Flashcard Set: ${flashcard.documentId?.title || 'Unknown'}`,
              timestamp: new Date(flashcard.createdAt).toLocaleString(),
              documentId: flashcard.documentId?._id,
            });
          });
        }
        
        // Add recent quizzes
        if (activity.quizzes && activity.quizzes.length > 0) {
          activity.quizzes.forEach(quiz => {
            allActivity.push({
              id: quiz._id,
              type: "quiz",
              title: quiz.title,
              subtitle: `Score: ${quiz.score}/${quiz.totalQuestions}`,
              timestamp: new Date(quiz.createdAt).toLocaleString(),
              documentId: quiz.documentId?._id,
            });
          });
        }
        
        // Sort by timestamp (most recent first) and take top 10
        setRecentActivity(allActivity.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      
      setStats({
        totalDocuments: 0,
        totalFlashcards: 0,
        totalQuizzes: 0,
        studyStreak: 0,
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            {label}
          </p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div
          className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'flashcard':
        return BookOpen;
      case 'quiz':
        return FileQuestion;
      default:
        return Clock;
    }
  };

  const getActivityAction = (activity) => {
    switch (activity.type) {
      case 'document':
        return activity.status === 'failed' 
          ? 'Upload Failed' 
          : 'Uploaded Document';
      case 'flashcard':
        return 'Generated Flashcards';
      case 'quiz':
        return 'Completed Quiz';
      default:
        return 'Activity';
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.type === 'document' && activity.status !== 'failed') {
      navigate(`/documents/${activity.id}`);
    } else if (activity.type === 'flashcard' && activity.documentId) {
      navigate(`/documents/${activity.documentId}/flashcards`);
    } else if (activity.type === 'quiz') {
      navigate(`/quizzes/${activity.id}/results`);
    }
  };

  const ActivityItem = ({ activity }) => {
    const Icon = getActivityIcon(activity.type);
    const actionText = getActivityAction(activity);
    
    return (
      <div className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            activity.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Icon className={`w-4 h-4 ${
              activity.status === 'failed' ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {actionText}: {activity.title}
            </p>
            {activity.subtitle && (
              <p className="text-xs text-gray-500 mb-1">{activity.subtitle}</p>
            )}
            <p className="text-xs text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
        {activity.status !== 'failed' && (
          <button
            onClick={() => handleActivityClick(activity)}
            className="text-emerald-500 text-sm font-semibold hover:text-emerald-600 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            View
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your learning progress and activity</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Documents"
            value={stats.totalDocuments}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={BookOpen}
            label="Total Flashcards"
            value={stats.totalFlashcards}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            icon={FileQuestion}
            label="Total Quizzes"
            value={stats.totalQuizzes}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatCard
            icon={TrendingUp}
            label="Study Streak"
            value={`${stats.studyStreak} days`}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={`${activity.type}-${activity.id}-${index}`} activity={activity} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <button
                  onClick={() => navigate("/documents")}
                  className="mt-4 text-emerald-500 font-semibold hover:text-emerald-600"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboardpage;