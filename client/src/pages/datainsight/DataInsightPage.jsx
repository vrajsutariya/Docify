import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FileSpreadsheet, BarChart2, Table, LineChart } from 'lucide-react';

export const DataInsightPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-white">DataInsight</h1>
            <Badge variant="secondary">Module 2</Badge>
          </div>
          <p className="text-sm text-light-text dark:text-dark-text-secondary">
            Tabular dataset profiling, automated charting recommendations, natural language questions, and formula transparency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-10 text-center hover:border-brand-orange transition-colors cursor-pointer bg-light-surface/50 dark:bg-dark-bg/50">
            <FileSpreadsheet className="w-12 h-12 text-brand-orange mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-white">Import Tabular Dataset</h3>
            <p className="text-xs text-light-text dark:text-dark-text-secondary mt-1">
              Supports CSV, XLSX, XLS, and Google Sheets exports
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <Table className="w-5 h-5 text-brand-orange" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">Auto-Profiling</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Summary stats & null audit</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-brand-red" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">Smart Visuals</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Bar, Line, Scatter, Heatmaps</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <LineChart className="w-5 h-5 text-brand-orange-bright" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">Q&A with Formulas</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Clear formula audit trail</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-base text-light-heading dark:text-white">
            Dataset History
          </h3>
          <p className="text-xs text-light-text dark:text-dark-text-secondary">
            No datasets uploaded yet. Ingest a tabular file to run instant analytics.
          </p>
        </Card>
      </div>
    </div>
  );
};
