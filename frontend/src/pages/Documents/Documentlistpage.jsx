import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import documentService from "../../services/documentservice.js";
import Spinner from "../../components/common/Spinner.jsx";
import {
  FileText,
  Upload,
  Trash2,
  Clock,
  BookOpen,
  FileQuestion,
  Search,
  Plus,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";

export default function DocumentListPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getDocuments();

      const docsArray = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setDocuments(docsArray);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, TXT, DOCX allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max file size is 10MB");
      return;
    }

    setUploadFile(file);

    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.error("Provide title and file");
      return;
    }

    try {
      setUploading(true);

      const res = await documentService.uploadDocument(uploadFile, uploadTitle);

      if (res?.success === false) {
        throw new Error(res?.message || "Upload failed");
      }

      toast.success("Uploaded successfully");
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setPendingDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeleting(true);
      await documentService.deleteDocument(pendingDeleteId);
      toast.success("Deleted");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setPendingDeleteId(null);
    }
  };

  const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (date) => {
    if (!date) return "";

    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins} min ago`;
    if (hrs < 24) return `${hrs} hr ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const filtered = (documents || []).filter((d) =>
    (d?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DocumentCard = ({ doc }) => (
    <div
      className="docs-card bg-white/85 backdrop-blur rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-2xl transition relative group cursor-pointer border border-gray-100"
      onClick={() => navigate(`/documents/${doc._id}`)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteRequest(doc._id);
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center mb-4 sm:mb-5 shadow-lg">
        <FileText className="text-white w-7 h-7" />
      </div>

      <h3 className="font-semibold text-gray-900 line-clamp-1 text-base sm:text-lg mb-1">
        {doc.title || "Untitled"}
      </h3>

      <p className="text-xs text-gray-500 mb-4">{formatFileSize(doc.fileSize)}</p>

      <div className="flex gap-4 text-xs font-semibold mb-4">
        <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
          <BookOpen className="w-4 h-4" /> {doc.flashcardCount || 0}
        </span>
        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <FileQuestion className="w-4 h-4" /> {doc.quizCount || 0}
        </span>
      </div>

      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <Clock className="w-4 h-4" /> {formatTime(doc.createdAt)}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="documents-page-shell min-h-full rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="documents-sticky-header sticky top-0 z-30 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 transition flex-shrink-0"
            >
              <ArrowLeft />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate">
                My Documents <Sparkles className="w-5 h-5 text-emerald-500" />
              </h1>
              <p className="hidden sm:block text-sm text-gray-500">Organize your smart learning files</p>
            </div>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl shadow-lg hover:shadow-2xl transition text-sm sm:text-base flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Upload</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Search + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="relative mb-6 sm:mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your documents..."
            className="docs-search-input w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 rounded-2xl outline-none focus:border-emerald-400 shadow-sm bg-white"
          />
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <FileText className="mx-auto w-16 h-16 mb-4 opacity-40" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm">Upload a file to get started</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="documents-upload-modal bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-xl"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-6">Upload Document</h2>

            <form onSubmit={handleUpload} className="space-y-5">
              <input
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Document title"
                className="w-full border-2 rounded-2xl px-4 py-3 outline-none focus:border-emerald-400"
              />

              <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-emerald-400 transition">
                <Upload className="mb-3 w-6 h-6" />
                <span className="text-sm font-medium">
                  {uploadFile ? uploadFile.name : "Choose PDF, TXT, or DOCX"}
                </span>
                <input type="file" hidden accept=".pdf,.txt,.docx" onChange={handleFileChange} />
              </label>

              <button
                disabled={uploading}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete document?"
        description="This will permanently remove the document and its related content."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (deleting) return;
          setDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
