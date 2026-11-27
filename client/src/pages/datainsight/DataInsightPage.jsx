import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  BarChart2,
  Table,
  LineChart,
  Upload,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  FileText,
  Sliders,
  Plus,
  Link,
  ChevronDown,
  RefreshCw,
  Download,
  Printer,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  Languages,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AutoChart } from '../../components/charts/AutoChart';
import { DataPreviewTable } from '../../components/datainsight/DataPreviewTable';
import { DataHealthProfile } from '../../components/datainsight/DataHealthProfile';
import { AskDataChat } from '../../components/datainsight/AskDataChat';
import { CustomChartBuilder } from '../../components/datainsight/CustomChartBuilder';
import {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  cleanDataset,
  askDataQuestion,
  getDatasetReport,
  exportDatasetFile,
} from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const DataInsightPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const datasetIdParam = searchParams.get('id');
  const tabParam = searchParams.get('tab');

  // State
  const [userDatasets, setUserDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [datasetRows, setDatasetRows] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [loadingActiveDataset, setLoadingActiveDataset] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'overview'); // 'overview' | 'ask' | 'health' | 'table' | 'report'

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState('file'); // 'file' | 'url'
  const [sheetUrl, setSheetUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Auto-clean State
  const [cleaning, setCleaning] = useState(false);

  // AI Report State
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [reportLang, setReportLang] = useState('en');
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  // Pinned Custom Charts
  const [pinnedCharts, setPinnedCharts] = useState([]);

  // Load user datasets
  const fetchUserDatasets = useCallback(async (selectFirst = false) => {
    setLoadingDatasets(true);
    try {
      const res = await getUserDatasets();
      const list = res?.data || [];
      setUserDatasets(list);

      if (list.length > 0) {
        if (!datasetIdParam || selectFirst) {
          const selected = datasetIdParam ? list.find((d) => d._id === datasetIdParam) || list[0] : list[0];
          setSearchParams({ id: selected._id, tab: activeTab });
        }
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  }, [datasetIdParam, activeTab, setSearchParams]);

  useEffect(() => {
    fetchUserDatasets();
  }, []);

  // Load active dataset details & rows
  const loadDatasetDetails = useCallback(async (id) => {
    if (!id) return;
    setLoadingActiveDataset(true);
    try {
      const res = await getDatasetById(id, 1, 500);
      setActiveDataset(res?.data?.dataset || null);
      setDatasetRows(res?.data?.rows || []);
    } catch (err) {
      console.error('Error loading dataset details:', err);
    } finally {
      setLoadingActiveDataset(false);
    }
  }, []);

  useEffect(() => {
    if (datasetIdParam) {
      loadDatasetDetails(datasetIdParam);
    }
  }, [datasetIdParam, loadDatasetDetails]);

  // Tab switch handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', tabId);
      return p;
    });
  };

  // Import handler for Excel (XLSX/XLS), CSV, and JSON
  const handleFileDrop = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      let parsedRows = [];

      // Excel parsing using browser-safe ArrayBuffer and XLSX.read
      if (ext === 'xlsx' || ext === 'xls') {
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('The uploaded Excel workbook contains no sheets.');
          }
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          if (!worksheet) {
            throw new Error(`Worksheet "${firstSheetName}" is empty or invalid.`);
          }
          parsedRows = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
          });

          if (!parsedRows || parsedRows.length === 0) {
            throw new Error('The Excel sheet contains no tabular records or rows.');
          }
        } catch (excelErr) {
          throw new Error(excelErr.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .xls document.');
        }
      }
      // CSV parsing using PapaParse
      else if (ext === 'csv' || ext === 'txt') {
        try {
          const csvText = await file.text();
          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: 'greedy',
            dynamicTyping: true,
          });
          parsedRows = (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);
          if (!parsedRows || parsedRows.length === 0) {
            throw new Error('The CSV file contains no tabular records or rows.');
          }
        } catch (csvErr) {
          throw new Error(csvErr.message || 'Failed to read CSV file. Please check file format.');
        }
      }
      // JSON parsing
      else if (ext === 'json') {
        try {
          const jsonText = await file.text();
          const parsed = JSON.parse(jsonText);
          parsedRows = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
          if (!parsedRows || parsedRows.length === 0) {
            throw new Error('The JSON file does not contain an array of row objects.');
          }
        } catch (jsonErr) {
          throw new Error(jsonErr.message || 'Invalid JSON file format.');
        }
      }

      // Ingest with both file and validated parsed rows
      const res = await uploadDataset(file, parsedRows);
      const newDataset = res?.data;
      setShowImportModal(false);
      await fetchUserDatasets();
      if (newDataset?._id) {
        setSearchParams({ id: newDataset._id, tab: 'overview' });
      }
    } catch (err) {
      console.error('Dataset upload error:', err);
      setUploadError(err.message || 'Failed to upload and parse dataset file.');
    } finally {
      setUploading(false);
      // Reset input element value to allow re-uploading the same file if needed
      if (e.target) e.target.value = '';
    }
  };

  const handleUrlImport = async (e) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;

    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadDataset({ sheetUrl: sheetUrl.trim() });
      const newDataset = res?.data;
      setShowImportModal(false);
      setSheetUrl('');
      await fetchUserDatasets();
      if (newDataset?._id) {
        setSearchParams({ id: newDataset._id, tab: 'overview' });
      }
    } catch (err) {
      console.error('Google Sheets import error:', err);
      setUploadError(err.message || 'Failed to import Google Sheets export.');
    } finally {
      setUploading(false);
    }
  };

  // Clean handler
  const handleClean = async (options) => {
    if (!activeDataset?._id) return null;
    setCleaning(true);
    try {
      const res = await cleanDataset(activeDataset._id, options);
      if (res?.data?.dataset) {
        setActiveDataset(res.data.dataset);
        setDatasetRows(res.data.sampleData || []);
      }
      return res;
    } catch (err) {
      console.error('Auto clean error:', err);
      alert(err.message || 'Failed to clean dataset.');
      return null;
    } finally {
      setCleaning(false);
    }
  };

  // Ask question handler: passes currently active/cleaned records to ensure 100% calculation accuracy
  const handleAskQuestion = async (question, language = 'en') => {
    if (!activeDataset?._id) return null;
    return await askDataQuestion(activeDataset._id, question, language, datasetRows);
  };

  // Export handler
  const handleExport = async (format = 'csv') => {
    if (!activeDataset?._id) return;
    try {
      await exportDatasetFile(activeDataset._id, format);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export dataset file.');
    }
  };

  // AI Report loader
  const handleLoadReport = async (lang = reportLang) => {
    if (!activeDataset?._id) return;
    setLoadingReport(true);
    try {
      const res = await getDatasetReport(activeDataset._id, lang);
      setReportMarkdown(res?.data?.report || '');
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'report' && activeDataset?._id && !reportMarkdown) {
      handleLoadReport('en');
    }
  }, [activeTab, activeDataset?._id, reportMarkdown]);

  return (
    <div className="space-y-6">
      {/* Top Header & Dataset Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.datainsight', 'DataInsight')}
            </h1>
            <Badge variant="brand">Module 2</Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Automated dataset profiling, smart charting recommendations, conversational queries with formula transparency, and 1-click auto-cleaning.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dataset Switcher Dropdown */}
          {userDatasets.length > 0 && (
            <div className="relative">
              <select
                value={activeDataset?._id || ''}
                onChange={(e) => setSearchParams({ id: e.target.value, tab: activeTab })}
                className="text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent max-w-[200px] sm:max-w-[240px] truncate"
              >
                {userDatasets.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.originalName} ({d.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            leftIcon={Upload}
            onClick={() => setShowImportModal(true)}
            className="bg-brand-gradient shadow-glow-cyan text-white whitespace-nowrap"
          >
            Import Dataset
          </Button>
        </div>
      </div>

      {/* Main Workspace Interface */}
      {activeDataset ? (
        <div className="space-y-6">
          {/* Module 2 Tab Bar: [Overview & Charts] | [Ask Data] | [Data Health & Cleaning] | [Preview Table] | [AI Report] */}
          <div className="flex items-center gap-2 border-b border-light-border dark:border-dark-border overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Overview & Smart Charts', icon: BarChart2 },
              { id: 'ask', label: 'Ask Data (Formulas)', icon: MessageSquare },
              { id: 'health', label: 'Data Health & Auto-Clean', icon: ShieldCheck },
              { id: 'table', label: 'Data Table', icon: Table },
              { id: 'report', label: 'AI Executive Report', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-heading text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-brand-red text-brand-red dark:border-brand-redBright dark:text-brand-redBright'
                      : 'border-transparent text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:border-light-border dark:hover:border-dark-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & SMART CHARTS + CUSTOM DASHBOARD BUILDER */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Quick Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5 space-y-0.5">
                  <span className="text-[10px] text-light-body uppercase font-bold">Rows</span>
                  <p className="text-lg font-bold font-heading text-light-heading dark:text-dark-heading">
                    {activeDataset.rowCount.toLocaleString()}
                  </p>
                </Card>
                <Card className="p-3.5 space-y-0.5">
                  <span className="text-[10px] text-light-body uppercase font-bold">Columns</span>
                  <p className="text-lg font-bold font-heading text-light-heading dark:text-dark-heading">
                    {activeDataset.columnCount}
                  </p>
                </Card>
                <Card className="p-3.5 space-y-0.5">
                  <span className="text-[10px] text-light-body uppercase font-bold">Data Health</span>
                  <p className="text-lg font-bold font-heading text-status-success">
                    {activeDataset.summaryStats?.qualityScore || 100}% Clean
                  </p>
                </Card>
                <Card className="p-3.5 space-y-0.5">
                  <span className="text-[10px] text-light-body uppercase font-bold">Format</span>
                  <p className="text-lg font-bold font-heading text-accent uppercase">
                    {activeDataset.fileType}
                  </p>
                </Card>
              </div>

              {/* Automated Smart Charts Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-light-heading dark:text-dark-heading">
                    Automated Visual Charts (SRS Item 1)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeDataset.chartRecommendations || []).map((chart, idx) => (
                    <AutoChart key={chart.id || idx} chartConfig={chart} height={280} />
                  ))}
                  {pinnedCharts.map((chart, idx) => (
                    <AutoChart key={`pinned-${idx}`} chartConfig={chart} height={280} />
                  ))}
                </div>
              </div>

              {/* Custom Dashboard Builder */}
              <CustomChartBuilder
                columns={activeDataset.columns || []}
                rows={datasetRows}
                onSaveChart={(newChart) => setPinnedCharts((prev) => [...prev, newChart])}
              />
            </motion.div>
          )}

          {/* TAB 2: ASK DATA WITH FORMULA TRANSPARENCY */}
          {activeTab === 'ask' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AskDataChat dataset={activeDataset} datasetRows={datasetRows} onAskQuestion={handleAskQuestion} />
            </motion.div>
          )}

          {/* TAB 3: DATA HEALTH & 1-CLICK AUTO-CLEAN */}
          {activeTab === 'health' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <DataHealthProfile
                dataset={activeDataset}
                onClean={handleClean}
                cleaning={cleaning}
              />
            </motion.div>
          )}

          {/* TAB 4: LIVE PREVIEW TABLE */}
          {activeTab === 'table' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <DataPreviewTable
                columns={activeDataset.columns || []}
                rows={datasetRows}
                onExport={handleExport}
              />
            </motion.div>
          )}

          {/* TAB 5: AI EXECUTIVE REPORT */}
          {activeTab === 'report' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                  <Languages className="w-3.5 h-3.5 text-light-body dark:text-dark-body ml-2 mr-1" />
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'gu', label: 'ગુજરાતી' },
                    { code: 'hi', label: 'हिन्दी' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setReportLang(l.code);
                        handleLoadReport(l.code);
                      }}
                      disabled={loadingReport}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        reportLang === l.code
                          ? 'bg-brand-red text-white shadow-xs'
                          : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (!reportMarkdown) return;
                      navigator.clipboard.writeText(reportMarkdown);
                      setReportCopied(true);
                      setTimeout(() => setReportCopied(false), 2000);
                    }}
                    leftIcon={reportCopied ? Check : Copy}
                  >
                    {reportCopied ? 'Copied' : 'Copy Report'}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.print()}
                    leftIcon={Printer}
                  >
                    Print / PDF
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLoadReport(reportLang)}
                    disabled={loadingReport}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingReport ? 'animate-spin text-brand-orange' : ''}`} />
                  </Button>
                </div>
              </div>

              {loadingReport && (
                <Card className="p-12 text-center space-y-4">
                  <div className="w-10 h-10 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto" />
                  <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                    Synthesizing Executive BI Report...
                  </h4>
                  <p className="text-xs text-light-body dark:text-dark-body">
                    Evaluating statistical thresholds, outlier anomalies, and operational recommendations.
                  </p>
                </Card>
              )}

              {!loadingReport && reportMarkdown && (
                <Card className="p-8 space-y-6">
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-light-body dark:text-dark-body leading-relaxed whitespace-pre-line space-y-4">
                    {reportMarkdown}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-16 text-center space-y-5 max-w-xl mx-auto border-dashed">
          <FileSpreadsheet className="w-16 h-16 text-brand-orange mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
              No Dataset Selected
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Upload a CSV, Excel (.xlsx/.xls) spreadsheet, JSON file, or paste a public Google Sheets URL to unlock DataInsight intelligence.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={Upload}
            onClick={() => setShowImportModal(true)}
            className="bg-brand-gradient text-white shadow-glow-cyan"
          >
            Import Tabular Dataset
          </Button>
        </Card>
      )}

      {/* Dataset Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                  Import Tabular Dataset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-light-body hover:text-light-heading"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`py-2 rounded-lg transition-all ${
                  importMode === 'file'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-light-body hover:text-light-heading'
                }`}
              >
                Upload File (CSV / Excel / JSON)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('url')}
                className={`py-2 rounded-lg transition-all ${
                  importMode === 'url'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-light-body hover:text-light-heading'
                }`}
              >
                Google Sheets Public Link
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/30 text-status-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {importMode === 'file' ? (
              <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-8 text-center hover:border-accent transition-colors relative cursor-pointer bg-light-surface/30 dark:bg-dark-surface/30">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileDrop}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileSpreadsheet className="w-12 h-12 text-accent mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {uploading ? 'Parsing and profiling records...' : 'Drop CSV, XLSX, XLS, or JSON here'}
                </p>
                <p className="text-[11px] text-light-body mt-1">
                  or click to browse from your computer (up to 50 MB)
                </p>
              </div>
            ) : (
              <form onSubmit={handleUrlImport} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-light-body dark:text-dark-body">
                    Google Sheets URL (Public view access required)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading text-xs focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                  <span className="text-[11px] text-light-body/60 block">
                    Make sure sharing is set to "Anyone with the link can view".
                  </span>
                </div>

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={uploading}
                    className="bg-brand-gradient text-white"
                  >
                    Import Sheet
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DataInsightPage;
