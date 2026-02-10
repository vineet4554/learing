import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcardService.js';
import Spinner from '../../components/common/Spinner.jsx';
import FlashcardSetCard from '../../components/flashcard/flashcardsetCard.jsx';
import {
  BookOpen,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, completed, in-progress
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFlashcardSets();
  }, []);

  const fetchAllFlashcardSets = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getAllFlashcardSets();
      
      if (data.success) {
        setFlashcardSets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast.error(error.message || 'Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async (setId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this flashcard set?')) {
      return;
    }

    try {
      setDeletingId(setId);
      await flashcardService.deleteFlashcardSet(setId);
      toast.success('Flashcard set deleted successfully');
      fetchAllFlashcardSets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeletingId(null);
    }
  };

  const getProgressPercentage = (reviewed, total) => {
    if (!total) return 0;
    return Math.round((reviewed / total) * 100);
  };

  // Filter and search flashcard sets
  const filteredSets = flashcardSets.filter(set => {
    const totalCards = set.flashcards?.length || set.totalCards || 0;
    const reviewedCards = set.reviewedCount || 0;
    const progressPercentage = getProgressPercentage(reviewedCards, totalCards);

    // Search filter
    const matchesSearch = set.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         set.documentId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesFilter = true;
    if (filterBy === 'completed') {
      matchesFilter = progressPercentage === 100;
    } else if (filterBy === 'in-progress') {
      matchesFilter = progressPercentage > 0 && progressPercentage < 100;
    }

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <Spinner text="Loading flashcard sets..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">
            {flashcardSets.length} flashcard set{flashcardSets.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterBy('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterBy === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterBy('in-progress')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterBy === 'in-progress'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterBy('completed')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterBy === 'completed'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search flashcard sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
      </div>

      {/* Flashcard Sets Grid */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery || filterBy !== 'all' 
              ? 'No flashcard sets found' 
              : 'No flashcard sets available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Generate flashcards from your documents to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSets.map((set) => (
            <FlashcardSetCard
              key={set._id}
              set={set}
              onDelete={handleDeleteSet}
              isDeleting={deletingId === set._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardsPage;