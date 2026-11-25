import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FileSpreadsheet, BarChart2, Table, LineChart, Upload } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DataInsightPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.datainsight', 'DataInsight')}
            </h1>
            <Badge variant="brand">Tabular Analytics</Badge>
          </div>
          <p className="text-sm text-light-body dark:text-dark-body">
            {t('modules.datainsightDesc', 'Tabular dataset profiling, automated charting recommendations, natural language questions, and formula transparency.')}
          </p>
        </div>

        <Button variant="primary" leftIcon={Upload}>
          Import Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-10 text-center hover:border-accent dark:hover:border-accent-light transition-colors cursor-pointer bg-light-surface/50 dark:bg-dark-surface/50 group">
            <FileSpreadsheet className="w-12 h-12 text-accent-dark dark:text-accent-light mx-auto mb-3 group-hover:scale-105 transition-transform" />
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading">
              Import Tabular Dataset
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body mt-1">
              Supports CSV, XLSX, XLS, and Google Sheets exports
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <Table className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">Auto-Profiling</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Summary stats & null audit</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">Smart Visuals</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Bar, Line, Scatter, Heatmaps</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <LineChart className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">Q&A with Formulas</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Clear formula audit trail</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading">
            Dataset History
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body">
            No datasets uploaded yet in this workspace. Import a CSV or XLSX spreadsheet to automatically generate profile statistics and charts.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default DataInsightPage;
