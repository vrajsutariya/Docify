import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  BarChart3,
  Wrench,
  Search,
  Filter,
  Star,
  Trash2,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useLanguage } from '../context/LanguageContext';
import { historyService } from '../services/historyService';

export const HistoryPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchHistory = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await historyService.getHistory({
        page,
        limit: 15,
        search,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
      });

      if (res?.data?.items) {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to fetch history timeline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, moduleFilter]);

  const handleToggleFavorite = async (item) => {
    try {
      const res = await historyService.toggleFavorite(item._id || item.itemId);
      const updatedItem = res?.data?.item;
      setItems((prev) =>
        prev.map((it) =>
          it._id === item._id ? { ...it, isFavorite: updatedItem?.isFavorite ?? !it.isFavorite } : it
        )
      );
    } catch (err) {
      console.warn('Failed to toggle favorite:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      await historyService.clearHistory(false);
      setSuccessMsg('History cleared successfully (favorites preserved).');
      setTimeout(() => setSuccessMsg(null), 3000);
      setClearModalOpen(false);
      fetchHistory(1);
    } catch (err) {
      setError(err?.message || 'Failed to clear history.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleReopen = (item) => {
    if (item.module === 'documind') {
      navigate('/documind');
    } else if (item.module === 'datainsight') {
      navigate('/datainsight');
    } else if (item.module === 'smarttools') {
      navigate('/smarttools');
    } else {
      navigate('/dashboard');
    }
  };

  const getModuleIcon = (module, itemType) => {
    if (itemType === 'quiz') return HelpCircle;
    switch (module) {
      case 'documind':
        return FileText;
      case 'datainsight':
        return BarChart3;
      case 'smarttools':
        return Wrench;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.history', 'Activity History')}
            </h1>
            <Badge variant="brand" icon={Clock}>
              Timeline
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Chronological audit of all your processed documents, datasets, quiz assessments, and file utilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClearModalOpen(true)}
            leftIcon={Trash2}
            className="text-status-danger hover:bg-status-danger/10 text-xs"
          >
            Clear Non-Starred
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by title or action..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'documind', label: 'DocuMind' },
            { id: 'datainsight', label: 'DataInsight' },
            { id: 'smarttools', label: 'SmartTools' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModuleFilter(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                moduleFilter === m.id
                  ? 'bg-accent text-black font-bold shadow-sm'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Timeline Cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = getModuleIcon(item.module, item.itemType);
          const isStarred = item.isFavorite;

          return (
            <Card
              key={item._id}
              hoverable
              className="flex items-center justify-between p-4 border border-light-border dark:border-dark-border hover:border-accent transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(item)}
                  title={isStarred ? 'Remove star' : 'Star as favorite'}
                  className="p-1 rounded-lg text-light-body dark:text-dark-body hover:text-amber-500 transition-colors shrink-0"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isStarred ? 'text-amber-500 fill-amber-500' : 'text-light-body dark:text-dark-body'
                    }`}
                  />
                </button>

                <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-light-heading dark:text-dark-heading truncate">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-accent-dark dark:text-accent-light capitalize">
                      {item.module}
                    </span>
                    <span className="text-[11px] text-light-body dark:text-dark-body">
                      • {item.action || item.summary || 'Processed'}
                    </span>
                    <span className="text-[10px] text-light-body/60 dark:text-dark-body/60 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReopen(item)}
                  rightIcon={ExternalLink}
                  className="text-xs"
                >
                  Reopen
                </Button>
              </div>
            </Card>
          );
        })}

        {items.length === 0 && !isLoading && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border space-y-2">
            <Clock className="w-10 h-10 text-light-body dark:text-dark-body mx-auto opacity-40" />
            <h3 className="font-heading text-base font-semibold text-light-heading dark:text-dark-heading">
              No activity records found
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Actions you perform across DocuMind, DataInsight, and SmartTools will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="p-3 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-body dark:text-dark-body">
          <span>
            Showing {items.length} of {pagination.total} entries
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchHistory(pagination.page - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchHistory(pagination.page + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Activity Timeline"
        description="Are you sure you want to clear your timeline? Any starred favorites will remain safe."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClearHistory}
              isLoading={isClearing}
              className="bg-status-danger hover:bg-status-danger/90 text-white"
            >
              Clear Timeline
            </Button>
          </>
        }
      >
        <p className="text-xs text-light-body dark:text-dark-body">
          This will delete non-favorite entries from your personal activity view. Stored files and analysis results will not be deleted.
        </p>
      </Modal>
    </div>
  );
};

export default HistoryPage;
