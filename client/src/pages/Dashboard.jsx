import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Clock,
  Trash2,
  Search,
  RefreshCw,
  HardDrive,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { DropZone } from '../components/upload/DropZone';
import { getFileIcon } from '../components/upload/FilePreview';
import {
  getUserDocuments,
  deleteDocument,
  formatBytes,
} from '../services/documentService';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Deletion modal state
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success banner
  const [notification, setNotification] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await getUserDocuments({
        page: 1,
        limit: 20,
        search: searchQuery,
        fileType: selectedType !== 'all' ? selectedType : undefined,
      });

      const docs = res?.data?.documents || [];
      const total = res?.data?.total || docs.length;

      setDocuments(docs);
      setTotalCount(total);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = (newDoc) => {
    setNotification({
      type: 'success',
      message: `"${newDoc.originalName}" uploaded and indexed successfully!`,
    });
    fetchDocuments();
    setTimeout(() => setNotification(null), 6000);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete._id);
      setDocToDelete(null);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDocuMind = (docId) => {
    navigate(`/documind?docId=${docId}`);
  };

  // Metrics calculation
  const totalStorage = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const ocrCount = documents.filter((d) => d.ocrProcessed).length;

  return (
    <div className="space-y-10 py-4 max-w-7xl mx-auto">
      {/* Top Welcome / Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.dashboard', 'Workspace Dashboard')}
            </h1>
            <Badge variant="brand" size="sm" icon={Sparkles}>
              AI Ready
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Ingest, analyze, and extract insights across English, Gujarati, and Hindi documents.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-2 text-xs">
            <BookOpen className="w-4 h-4 text-accent-dark dark:text-accent-light" />
            <div>
              <p className="text-[10px] text-light-body dark:text-dark-body">Documents</p>
              <p className="font-mono font-bold text-light-heading dark:text-dark-heading">{totalCount}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <div>
              <p className="text-[10px] text-light-body dark:text-dark-body">OCR Extracted</p>
              <p className="font-mono font-bold text-light-heading dark:text-dark-heading">{ocrCount}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-2 text-xs">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-[10px] text-light-body dark:text-dark-body">Storage Used</p>
              <p className="font-mono font-bold text-light-heading dark:text-dark-heading">{formatBytes(totalStorage)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-center justify-between gap-3 text-xs sm:text-sm text-status-success"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs underline hover:opacity-80 font-semibold"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTRAL HERO ACTION: Universal File Upload Engine matching SRS */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <Badge variant="brand" size="md">
            Universal Ingestion Pipeline
          </Badge>
          <h2 className="font-heading text-2xl font-bold text-light-heading dark:text-dark-heading">
            Upload & Ingest Document
          </h2>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body max-w-lg mx-auto">
            Instant digital text extraction, Gujarati & Hindi OCR parsing, and page-by-page mapping for deep RAG intelligence.
          </p>
        </div>

        <DropZone
          onUploadSuccess={handleUploadSuccess}
          autoUpload={true}
        />
      </section>

      {/* RECENT DOCUMENTS SECTION */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-dark dark:text-accent-light" />
            <h2 className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">
              Recent Documents
            </h2>
            <Badge variant="neutral" size="sm" className="font-mono">
              {totalCount} total
            </Badge>
          </div>

          {/* Search & Refresh Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:border-accent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl text-xs bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:border-accent"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
              <option value="image">Images</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              isLoading={refreshing}
              title="Refresh document list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-1/3">
                  <Skeleton variant="avatar" className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="title" />
                    <Skeleton variant="text" />
                  </div>
                </div>
                <Skeleton variant="text" className="w-24" />
                <Skeleton variant="text" className="w-32" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-dashed border-light-border dark:border-dark-border space-y-3">
            <FileText className="w-12 h-12 text-light-body dark:text-dark-body mx-auto opacity-50" />
            <h3 className="font-heading text-base font-semibold text-light-heading dark:text-dark-heading">
              {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
              Drag and drop your PDF, DOCX, TXT, or scanned image in the upload box above to get started with Docify AI.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => {
              const { icon: DocIcon, color, bg, label } = getFileIcon(doc.originalName, doc.mimeType);

              // Status badge determination: Ready, Processing, OCR
              const isOCR = doc.ocrProcessed;
              const isReady = Boolean(doc.extractedText && doc.extractedText.length > 0);

              return (
                <motion.div
                  key={doc._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group p-4 sm:p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-brand-red dark:hover:border-brand-redBright hover:shadow-soft dark:hover:shadow-soft-dark transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => handleOpenDocuMind(doc._id)}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className={`p-3 rounded-xl shrink-0 ${bg} ${color}`}>
                      <DocIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-semibold text-sm sm:text-base text-light-heading dark:text-dark-heading truncate max-w-xs sm:max-w-md group-hover:text-brand-red dark:group-hover:text-brand-redBright transition-colors">
                          {doc.originalName}
                        </span>

                        <Badge variant="neutral" size="sm" className="text-[10px] uppercase font-mono">
                          {label}
                        </Badge>

                        {/* Status Badges: Ready, OCR, Processing */}
                        {isOCR ? (
                          <Badge variant="brand" size="sm" icon={Sparkles} className="text-[10px]">
                            OCR Scanned
                          </Badge>
                        ) : isReady ? (
                          <Badge variant="success" size="sm" icon={CheckCircle2} className="text-[10px]">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm" icon={Clock} className="text-[10px]">
                            Processing
                          </Badge>
                        )}

                        {doc.detectedLanguage && doc.detectedLanguage !== 'unknown' && (
                          <Badge variant="info" size="sm" className="text-[10px] uppercase font-mono">
                            {doc.detectedLanguage === 'gu'
                              ? 'ગુજરાતી'
                              : doc.detectedLanguage === 'hi'
                              ? 'हिन्दी'
                              : 'EN'}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-light-body dark:text-dark-body">
                        <span>{formatBytes(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.pageCount || 1} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                        {doc.wordCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{doc.wordCount.toLocaleString()} words</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          ~{doc.readingTimeMinutes || 1} min
                        </span>
                        <span>•</span>
                        <span className="text-[11px]">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div
                    className="flex items-center gap-2 self-end md:self-center shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDocuMind(doc._id)}
                      rightIcon={ArrowRight}
                      className="text-xs bg-brand-gradient shadow-glow-cyan"
                    >
                      DocuMind
                    </Button>

                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-2 rounded-xl text-light-body dark:text-dark-body hover:text-status-error dark:hover:text-status-error hover:bg-status-error/10 transition-colors"
                      title="Delete document"
                      aria-label="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="Delete Document"
        description="This action will permanently delete the document, its extracted text, and its storage record."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDocToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
              leftIcon={Trash2}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-light-heading dark:text-dark-heading">
          Are you sure you want to permanently delete{' '}
          <strong className="text-brand-red dark:text-brand-redBright">
            {docToDelete?.originalName}
          </strong>
          ?
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;
