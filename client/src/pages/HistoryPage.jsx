import React from 'react';
import { Clock, FileText, BarChart3, Wrench, Search, Filter } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';

export const HistoryPage = () => {
  const { t } = useLanguage();

  const historyItems = [
    {
      id: 'h1',
      title: 'Annual_Financial_Report_2025.pdf',
      module: 'DocuMind',
      action: '3-Level Abstract & OCR',
      time: '15 minutes ago',
      icon: FileText,
      status: 'success',
    },
    {
      id: 'h2',
      title: 'Sales_Q3_Dataset.csv',
      module: 'DataInsight',
      action: 'Chart Generation & Profiling',
      time: '2 hours ago',
      icon: BarChart3,
      status: 'success',
    },
    {
      id: 'h3',
      title: 'Tax_Invoices_Combined.pdf',
      module: 'SmartTools',
      action: 'Merge PDFs (14 Pages)',
      time: 'Yesterday at 4:32 PM',
      icon: Wrench,
      status: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.history', 'History')}
            </h1>
            <Badge variant="brand" icon={Clock}>
              Activity Log
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            View, filter, and resume previous document processing and data queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={Filter}>
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            Export History
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              hoverable
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-light-heading dark:text-dark-heading">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-light-body dark:text-dark-body">
                      {item.module} • {item.action}
                    </span>
                    <span className="text-[10px] text-light-body/60 dark:text-dark-body/60 font-mono">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={item.status} size="sm">
                  Completed
                </Badge>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;
