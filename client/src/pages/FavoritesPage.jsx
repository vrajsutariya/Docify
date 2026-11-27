import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  FileText,
  BarChart3,
  Wrench,
  Bookmark,
  ExternalLink,
  Trash2,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import { historyService } from '../services/historyService';

export const FavoritesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await historyService.getFavorites();
      if (res?.data?.favorites) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      console.warn('Failed to fetch favorites:', err);
      setError(err?.message || 'Failed to load favorite items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favId) => {
    try {
      await historyService.toggleFavorite(favId);
      setFavorites((prev) => prev.filter((item) => item._id !== favId));
    } catch (err) {
      console.warn('Failed to remove favorite:', err);
    }
  };

  const handleLaunch = (fav) => {
    if (fav.module === 'documind') {
      navigate('/documind');
    } else if (fav.module === 'datainsight') {
      navigate('/datainsight');
    } else if (fav.module === 'smarttools') {
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
        return Bookmark;
    }
  };

  const filteredFavorites = favorites.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.module === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.favorites', 'Favorites & Bookmarks')}
            </h1>
            <Badge variant="warning" icon={Star}>
              {favorites.length} Pinned
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Fast 1-click access to your essential documents, custom datasets, and high-frequency SmartTools.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'documind', label: 'DocuMind' },
            { id: 'datainsight', label: 'DataInsight' },
            { id: 'smarttools', label: 'SmartTools' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-amber-500/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Favorites Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFavorites.map((fav) => {
          const Icon = getModuleIcon(fav.module, fav.itemType);

          return (
            <Card
              key={fav._id}
              hoverable
              className="group flex flex-col justify-between p-5 border border-light-border dark:border-dark-border hover:border-amber-500/60 transition-all rounded-2xl"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(fav._id)}
                    title="Remove from favorites"
                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                  >
                    <Star className="w-4 h-4 fill-amber-500" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                    {fav.module}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading group-hover:text-amber-500 transition-colors mt-0.5 truncate">
                    {fav.title}
                  </h3>
                  <p className="text-xs text-light-body dark:text-dark-body mt-1 line-clamp-2 leading-relaxed">
                    {fav.summary || fav.action || 'Saved workspace item'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-light-border/60 dark:border-dark-border/60 flex items-center justify-between">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLaunch(fav)}
                  rightIcon={ExternalLink}
                  className="w-full justify-between"
                >
                  Launch Workspace
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredFavorites.length === 0 && !isLoading && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border space-y-3">
          <Star className="w-10 h-10 text-amber-500/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-light-heading dark:text-dark-heading">
              No favorites saved yet
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
              Click the star icon on any document, dataset, or history item to bookmark it here for instant access.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/smarttools')}>
              Explore SmartTools
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/documind')}>
              Upload Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
