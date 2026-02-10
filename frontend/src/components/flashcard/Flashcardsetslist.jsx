import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcardService.js';
import Spinner from '../../components/common/Spinner.jsx';
import FlashcardSetCard from './flashcardsetCard.jsx';
import {
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

function FlashcardSetsList({ documentId }) {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcardSets();
  }, [documentId]);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getFlashcardsForDocument(documentId);
      
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
      fetchFlashcardSets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Spinner text="Loading flashcard sets..." />;
  }

  if (flashcardSets.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No flashcard sets available</h3>
        <p className="text-gray-600">Generate flashcards to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcardSets.map((set) => (
        <FlashcardSetCard
          key={set._id}
          set={set}
          onDelete={handleDeleteSet}
          isDeleting={deletingId === set._id}
        />
      ))}
    </div>
  );
}

export default FlashcardSetsList;