import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
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
} from "lucide-react";
import toast from "react-hot-toast";

function Documentlistpage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
      
      if (response.data.success) {
        setDocuments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF, TXT, or DOCX file");
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setUploadFile(file);
      // Auto-fill title from filename
      if (!uploadTitle) {
        const fileName = file.name.split('.').slice(0, -1).join('.');
        setUploadTitle(fileName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);

      const response = await axiosInstance.post(
        API_PATHS.DOCUMENTS.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success("Document uploaded successfully!");
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadTitle("");
        fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(docId));
      toast.success("Document deleted successfully");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Uploaded ${diffMins} minutes ago`;
    if (diffHours < 24) return `Uploaded ${diffHours} hours ago`;
    return `Uploaded ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DocumentCard = ({ doc }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(doc._id);
        }}
        className="absolute top-4 right-4 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div
        onClick={() => navigate(`/documents/${doc._id}`)}
        className="cursor-pointer"
      >
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {doc.title || 'Untitled Document'}
        </h3>

        {/* File size */}
        <p className="text-sm text-gray-600 mb-4">
          {formatFileSize(doc.fileSize || 0)}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-purple-600">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">
              {doc.flashcardCount || 0} Flashcards
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <FileQuestion className="w-4 h-4" />
            <span className="text-sm font-medium">
              {doc.quizCount || 0} Quizzes
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{formatTimestamp(doc.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
            <p className="text-gray-600">Manage and organize your learning materials</p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="text-emerald-500 font-semibold hover:text-emerald-600"
              >
                Upload your first document
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            {/* Close button */}
            <button
              onClick={() => {
                setUploadModalOpen(false);
                setUploadFile(null);
                setUploadTitle("");
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Document
            </h2>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Enter document title"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-emerald-400 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {uploadFile ? uploadFile.name : 'Choose file (PDF, TXT, DOCX)'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold py-3.5 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documentlistpage;