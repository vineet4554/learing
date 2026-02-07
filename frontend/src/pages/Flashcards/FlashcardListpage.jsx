import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  BookOpen,
  Trash2,
  Eye,
  Star,
  Calendar,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

function FlashcardListpage() {
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, starred, recent

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
      
      if (response.data.success) {
        setFlashcardSets(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      toast.error("Failed to load flashcard sets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId) => {
    if (!window.confirm("Are you sure you want to delete this flashcard set?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(setId));
      toast.success("Flashcard set deleted successfully");
      fetchFlashcardSets(); // Refresh the list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete flashcard set");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressColor = (reviewed, total) => {
    if (!total) return "bg-gray-200";
    const percentage = (reviewed / total) * 100;
    if (percentage === 100) return "bg-emerald-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredSets = flashcardSets.filter(set => {
    const matchesSearch = 
      set.documentId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterBy === "starred") {
      return set.cards?.some(card => card.starred);
    }
    
    if (filterBy === "recent") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(set.createdAt) > threeDaysAgo;
    }

    return true;
  });

  const FlashcardSetCard = ({ set }) => {
    const totalCards = set.cards?.length || 0;
    const reviewedCards = set.cards?.filter(card => card.reviewed)?.length || 0;
    const starredCards = set.cards?.filter(card => card.starred)?.length || 0;
    const progressPercentage = totalCards ? (reviewedCards / totalCards) * 100 : 0;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(set._id);
          }}
          className="absolute top-4 right-4 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div
          onClick={() => navigate(`/documents/${set.documentId?._id}/flashcards`)}
          className="cursor-pointer"
        >
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {set.documentId?.title || set.title || 'Untitled Flashcard Set'}
          </h3>

          {/* Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Cards</span>
              <span className="font-bold text-gray-900">{totalCards}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reviewed</span>
              <span className="font-bold text-blue-600">{reviewedCards}</span>
            </div>

            {starredCards > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-600">{starredCards} starred</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(reviewedCards, totalCards)} transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Created {formatDate(set.createdAt)}</span>
          </div>

          {/* View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/documents/${set.documentId?._id}/flashcards`);
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            Study Now
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcard sets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Flashcards</h1>
              <p className="text-gray-600">Review and study your flashcard sets</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">
                  {flashcardSets.length} {flashcardSets.length === 1 ? 'Set' : 'Sets'}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search flashcard sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-purple-400 transition-colors font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">All Sets</option>
                <option value="starred">Starred Cards</option>
                <option value="recent">Recent (3 days)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredSets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSets.map((set) => (
              <FlashcardSetCard key={set._id} set={set} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery || filterBy !== "all" 
                ? 'No flashcard sets found' 
                : 'No flashcard sets yet'}
            </p>
            {!searchQuery && filterBy === "all" && (
              <div>
                <p className="text-gray-600 mb-4">
                  Upload a document and generate flashcards to get started
                </p>
                <button
                  onClick={() => navigate("/documents")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  Go to Documents
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardListpage;