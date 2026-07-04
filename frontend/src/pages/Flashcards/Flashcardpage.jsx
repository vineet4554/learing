import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import flashcardService from "../../services/FlashcardService.js";
import Spinner from "../../components/common/Spinner.jsx";
import {
  ArrowLeft,
  RotateCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLayout } from "../../context/LayoutContext.jsx";

function Flashcardpage() {
  // ✅ Only documentId exists in URL
  const { id } = useParams();
  const navigate = useNavigate();
  const { setIsSidebarHidden, setIsHeaderHidden, setIsContentPaddingHidden } = useLayout();

  const [flashcards, setFlashcards] = useState([]);
  const [flashcardSetId, setFlashcardSetId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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
    if (!id) {
      toast.error("Invalid document ID");
      navigate(-1);
      return;
    }

    fetchFlashcards();
  }, [id]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);

      // ✅ Correct service call
      const data = await flashcardService.getFlashcardsForDocument(id);

      if (data.success) {
        const set = data.data?.[0];
        const cards = set?.cards || [];
        setFlashcardSetId(set?._id || null);
        setFlashcards(cards);
      } else {
        toast.error(data.message || "Failed to load flashcards");
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error(error.message || "Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleNext = async () => {
    if (currentIndex < flashcards.length - 1) {
      // Mark current card as reviewed in backend
      if (flashcardSetId != null) {
        try {
          await flashcardService.reviewFlashcard(flashcardSetId, currentIndex);

          // Update local state so UI immediately reflects reviewed status
          setFlashcards((prev) => {
            const updated = [...prev];
            const card = { ...updated[currentIndex] };
            card.reviewCount = (card.reviewCount || 0) + 1;
            card.lastReviewed = new Date().toISOString();
            updated[currentIndex] = card;
            return updated;
          });
        } catch (error) {
          console.error("Error marking card reviewed:", error);
          // Don't block navigation on review error
        }
      }

      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleToggleStar = async () => {
    const currentCard = flashcards[currentIndex];

    if (!flashcardSetId) {
      toast.error("Unable to toggle star for this card");
      return;
    }

    // Optimistic UI update
    const previous = [...flashcards];
    const updated = [...flashcards];
    updated[currentIndex] = {
      ...currentCard,
      isStarred: !currentCard.isStarred,
    };
    setFlashcards(updated);

    try {
      await flashcardService.toggleStar(flashcardSetId, currentIndex);
      toast.success(
        updated[currentIndex].isStarred
          ? "Card starred"
          : "Card unstarred"
      );
    } catch (error) {
      console.error("Error toggling star:", error);
      setFlashcards(previous);
      toast.error(error.message || "Failed to toggle star");
    }
  };

  if (loading) return <Spinner text="Loading flashcards..." fullScreen />;

  if (flashcards.length === 0) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center text-center p-6 transition-colors duration-200">
        <BookOpen className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          No flashcards found
        </h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Generate flashcards to start studying.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition shadow-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sets
        </button>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow dark:text-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Shuffle className="w-4 h-4" /> Shuffle
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-xl p-10 text-center">
          {/* Difficulty + Star */}
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wide">
              {currentCard?.difficulty || "Easy"}
            </span>

            <button
              onClick={handleToggleStar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <Star
                className={`w-5 h-5 ${
                  currentCard?.isStarred
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-slate-600"
                }`}
              />
            </button>
          </div>

          {/* Question / Answer */}
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none min-h-[160px] flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-slate-100 leading-snug">
              {isFlipped ? currentCard?.answer : currentCard?.question}
            </h2>

            <div className="mt-6 flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm">
              <RotateCw className="w-4 h-4" />
              <span>Tap to reveal {isFlipped ? "question" : "answer"}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 dark:disabled:opacity-20 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-lg font-semibold text-gray-600 dark:text-slate-400">
              {currentIndex + 1} / {flashcards.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 dark:disabled:opacity-20 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcardpage;