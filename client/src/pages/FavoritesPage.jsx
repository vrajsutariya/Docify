import React from 'react';
import { Star, FileText, BarChart3, Wrench, Bookmark } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';

export const FavoritesPage = () => {
  const { t } = useLanguage();

  const favoriteItems = [
    {
      id: 'f1',
      title: 'Company_Policy_2026.pdf',
      module: 'DocuMind',
      notes: 'Indexed with 42 citations & quiz deck',
      icon: FileText,
    },
    {
      id: 'f2',
      title: 'Global_Supply_Chain_Analytics.xlsx',
      module: 'DataInsight',
      notes: 'Saved dashboard: 4 charts pinned',
      icon: BarChart3,
    },
    {
      id: 'f3',
      title: 'PDF Watermark & Signature Preset',
      module: 'SmartTools',
      notes: 'Reusable company confidential watermark',
      icon: Wrench,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.favorites', 'Favorites')}
            </h1>
            <Badge variant="warning" icon={Star}>
              Saved Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Quickly access your pinned documents, datasets, and frequently used tools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {favoriteItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} hoverable className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
                  <Icon className="w-5 h-5" />
                </div>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-dark dark:text-accent-light font-semibold">
                  {item.module}
                </span>
                <h3 className="font-heading font-semibold text-sm text-light-heading dark:text-dark-heading mt-0.5 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-light-body dark:text-dark-body mt-1">
                  {item.notes}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="secondary" size="sm">
                  Launch
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesPage;
