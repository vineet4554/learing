import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/FlashcardService.js';
import Spinner from '../../components/common/Spinner.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import FlashcardSetCard from '../../components/flashcard/flashcardsetCard.jsx';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, completed, in-progress
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

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
      fetchAllFlashcardSets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const getProgressPercentage = (reviewed, total) => {
    if (!total) return 0;
    return Math.round((reviewed / total) * 100);
  };

  const getDocumentId = (set) => set.documentId?._id || set.documentId;

  // Filter and search flashcard sets
  const filteredSets = flashcardSets.filter(set => {
    const cards = set.cards || set.flashcards || [];

    const totalCards =
      typeof set.totalCards === "number" ? set.totalCards : cards.length;

    // Treat starred cards as "reviewed" for progress/filtering
    const reviewedCards =
      typeof set.reviewedCount === "number"
        ? set.reviewedCount
        : cards.filter((card) => card.isStarred).length;
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

  const documentMap = new Map();
  filteredSets.forEach((set) => {
    const documentId = getDocumentId(set);
    if (!documentId) return;

    if (!documentMap.has(documentId)) {
      documentMap.set(documentId, {
        documentId,
        documentName: set.documentId?.title || set.documentId?.fileName || 'Untitled Document',
        setCount: 0,
      });
    }

    documentMap.get(documentId).setCount += 1;
  });

  const documents = Array.from(documentMap.values());
  const selectedDocument = documents.find((doc) => doc.documentId === selectedDocumentId) || null;
  const selectedDocumentSets = selectedDocumentId
    ? filteredSets.filter((set) => getDocumentId(set) === selectedDocumentId)
    : [];

  useEffect(() => {
    if (selectedDocumentId && !documents.some((doc) => doc.documentId === selectedDocumentId)) {
      setSelectedDocumentId(null);
    }
  }, [selectedDocumentId, documents]);

  if (loading) {
    return <Spinner text="Loading flashcard sets..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl">Flashcards</h1>
            <p className="text-sm text-gray-600 sm:text-base">
              {selectedDocument
                ? `${selectedDocument.setCount} flashcard set${selectedDocument.setCount !== 1 ? 's' : ''} in ${selectedDocument.documentName}`
                : `${flashcardSets.length} flashcard set${flashcardSets.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:gap-3">
            <button
              onClick={() => setFilterBy('all')}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                filterBy === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterBy('in-progress')}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                filterBy === 'in-progress'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterBy('completed')}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                filterBy === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder={selectedDocumentId ? "Search sets in this document..." : "Search documents or flashcard sets..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2.5 pl-11 pr-3 text-sm outline-none transition-colors focus:border-emerald-400 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
            />
          </div>
        </div>
      </div>

      {filteredSets.length === 0 ? (
        <div className="rounded-2xl bg-white px-4 py-12 text-center sm:py-16">
          <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {searchQuery || filterBy !== 'all' 
              ? 'No flashcard sets found' 
              : 'No flashcard sets available'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Generate flashcards from your documents to get started'}
          </p>
        </div>
      ) : (
        selectedDocumentId ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDocumentId(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to documents
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {selectedDocumentSets.map((set) => (
                <FlashcardSetCard
                  key={set._id}
                  set={set}
                  onDelete={handleDeleteSet}
                  isDeleting={deletingId === set._id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {documents.map((document) => (
              <button
                key={document.documentId}
                onClick={() => setSelectedDocumentId(document.documentId)}
                className="rounded-2xl border-2 border-gray-100 bg-white p-5 text-left transition-all hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-lg font-bold text-gray-900">
                  {document.documentName}
                </h3>
                <p className="text-sm text-gray-600">
                  {document.setCount} flashcard set{document.setCount !== 1 ? 's' : ''} available
                </p>
              </button>
            ))}
          </div>
        )
      )}
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
    </div>
  );
}

export default FlashcardsPage;
