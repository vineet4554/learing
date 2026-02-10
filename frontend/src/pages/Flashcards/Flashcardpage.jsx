import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcardService.js";
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

function Flashcardpage() {
  // ✅ Only documentId exists in URL
  const { id } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const cards = data.data?.[0]?.cards || [];
        setFlashcards(cards);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error(error.message || "Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
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

  if (loading) return <Spinner text="Loading flashcards..." />;

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No flashcards found
        </h2>
        <p className="text-gray-600 mb-6">
          Generate flashcards to start studying.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sets
        </button>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm hover:shadow transition"
        >
          <Shuffle className="w-4 h-4" /> Shuffle
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          {/* Difficulty + Star */}
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wide">
              {currentCard?.difficulty || "Easy"}
            </span>

            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <Star className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Question / Answer */}
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none min-h-[160px] flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-snug">
              {isFlipped ? currentCard?.answer : currentCard?.question}
            </h2>

            <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm">
              <RotateCw className="w-4 h-4" />
              <span>Tap to reveal {isFlipped ? "question" : "answer"}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-lg font-semibold text-gray-600">
              {currentIndex + 1} / {flashcards.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
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