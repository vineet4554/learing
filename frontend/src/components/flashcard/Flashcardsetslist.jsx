import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/FlashcardService.js';
import Spinner from '../../components/common/Spinner.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import FlashcardSetCard from './Flashcardsetcard.jsx';
import {
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

function FlashcardSetsList({
  documentId,
  refreshKey = 0,
  onCountChange,
  showEmptyState = true,
}) {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => {
    fetchFlashcardSets();
  }, [documentId, refreshKey]);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getFlashcardsForDocument(documentId);
      
      if (data.success) {
        const sets = (data.data || []).map((set) => {
          const cards = set.cards || [];

          const totalCards = cards.length;
          // Treat starred cards as "reviewed" for progress
          const reviewedCount = cards.filter((card) => card.isStarred).length;
          const starredCount = reviewedCount;

          return {
            ...set,
            totalCards,
            reviewedCount,
            starredCount,
          };
        });

        setFlashcardSets(sets);
        if (onCountChange) onCountChange(sets.length);
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast.error(error.message || 'Failed to load flashcard sets');
      if (onCountChange) onCountChange(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = (setId, e) => {
    e.stopPropagation();
    setPendingDelete(setId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeletingId(pendingDelete);
      await flashcardService.deleteFlashcardSet(pendingDelete);
      toast.success('Flashcard set deleted successfully');
      fetchFlashcardSets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  if (loading) {
    return <Spinner text="Loading flashcard sets..." />;
  }

  if (flashcardSets.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No flashcard sets available</h3>
        <p className="text-gray-600">Generate flashcards to get started</p>
      </div>
    );
  }

  return (
    <>
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
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete flashcard set?"
        description="This will permanently remove the flashcard set and its cards."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (deletingId) return;
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        loading={deletingId !== null}
      />
    </>
  );
}

export default FlashcardSetsList;
