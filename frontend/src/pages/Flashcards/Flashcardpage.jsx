import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  ArrowLeft,
  RotateCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Shuffle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

function Flashcardpage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, [id]);

  const fetchFlashcards = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(id));
      if (response.data?.success) {
        const cards = response.data.data?.[0]?.cards || [];
        setFlashcards(cards);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Failed to load flashcards");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* Top Header - Matching the Breadcrumb style */}
      <div className="px-8 py-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sets
        </button>
      </div>

      {/* Main Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[450px] flex flex-col overflow-hidden">
          
          {/* Card Meta Info */}
          <div className="p-6 flex justify-between items-start">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wider">
              {currentCard?.difficulty || "EASY"}
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Star className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Question/Answer Area */}
          <div 
            className="flex-1 flex flex-col items-center justify-center px-12 text-center cursor-pointer"
            onClick={handleFlip}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-snug">
              {isFlipped ? currentCard?.answer : currentCard?.question}
            </h2>
            
            <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
              <RotateCw className="w-4 h-4" />
              <span>Click to reveal {isFlipped ? 'question' : 'answer'}</span>
            </div>
          </div>

          {/* Footer Controls within the card */}
          <div className="p-8 flex justify-center items-center gap-8">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              disabled={currentIndex === 0}
              className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <span className="text-lg font-medium text-gray-500">
              {currentIndex + 1} / {flashcards.length}
            </span>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === flashcards.length - 1}
              className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcardpage;