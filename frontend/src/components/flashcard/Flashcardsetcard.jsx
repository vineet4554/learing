import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Trash2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

function FlashcardSetCard({ set, onDelete, isDeleting }) {
  const navigate = useNavigate();

  const cards = set.cards || set.flashcards || [];

  const totalCards =
    typeof set.totalCards === "number" ? set.totalCards : cards.length;

  // In this UI, we treat "starred" cards as "reviewed"
  const starredCards =
    typeof set.starredCount === "number"
      ? set.starredCount
      : cards.filter((card) => card.isStarred).length;

  const reviewedCards =
    typeof set.reviewedCount === "number"
      ? set.reviewedCount
      : starredCards;

  const documentId = set.documentId?._id || set.documentId;

  const getProgressPercentage = (reviewed, total) => {
    if (!total) return 0;
    return Math.round((reviewed / total) * 100);
  };

  const progressPercentage = getProgressPercentage(reviewedCards, totalCards);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getPercentageBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-700';
    if (percentage >= 50) return 'bg-blue-100 text-blue-700';
    if (percentage >= 25) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `CREATED ${diffInMinutes} MINUTE${diffInMinutes !== 1 ? 'S' : ''} AGO`;
    } else if (diffInHours < 24) {
      return `CREATED ${diffInHours} HOUR${diffInHours !== 1 ? 'S' : ''} AGO`;
    } else {
      return `CREATED ${diffInDays} DAY${diffInDays !== 1 ? 'S' : ''} AGO`;
    }
  };

  const handleStudy = () => {
    navigate(`/documents/${set.documentId?._id}/flashcards`)
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(set._id, e);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all p-4 sm:p-6 cursor-pointer ${
        progressPercentage === 100
          ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-lg'
          : 'border-gray-100 hover:border-emerald-200 hover:shadow-lg'
      }`}
      onClick={handleStudy}
    >
      {/* Icon & Delete */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          title="Delete flashcard set"
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
        {set.title || set.documentId?.title || 'Flashcard Set'}
      </h3>

      {/* Created Date */}
      <p className="text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
        {formatTimeAgo(set.createdAt)}
      </p>

      {/* Card Count & Progress Badge */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-medium text-gray-700">
          {totalCards} Cards
        </span>
        {progressPercentage > 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold ${getPercentageBadgeColor(progressPercentage)}`}>
            <TrendingUp className="w-3 h-3" />
            {progressPercentage}%
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-900 font-semibold">
            {reviewedCards}/{totalCards} reviewed
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(progressPercentage)} transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Study Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStudy();
        }}
        className="w-full flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
      >
        <Sparkles className="w-4 h-4" />
        Study Now
      </button>
    </div>
  );
}

export default FlashcardSetCard;
