import React, { useState } from 'react';
import {
  Users,
  FileText,
  HelpCircle,
  HardDrive,
  Activity,
  Trash2,
  RefreshCw,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';

const PIE_COLORS = ['#06b6d4', '#f97316', '#8b5cf6', '#10b981'];

export const AdminDashboard = ({ statsData, onRefresh }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [error, setError] = useState(null);

  const stats = statsData?.stats || {
    totalUsers: 0,
    totalDocuments: 0,
    totalDatasets: 0,
    totalQuizzes: 0,
    activeUsersToday: 0,
    totalActivities: 0,
    storage: { usedBytes: 0, usedMb: 0, totalFiles: 0, limitMb: 5120 },
  };

  const moduleBreakdown = statsData?.moduleBreakdown || [
    { name: 'DocuMind', count: stats.totalDocuments, bytes: 1000 },
    { name: 'DataInsight', count: stats.totalDatasets, bytes: 500 },
    { name: 'Quizzes', count: stats.totalQuizzes, bytes: 100 },
    { name: 'SmartTools', count: 5, bytes: 200 },
  ];

  const weeklyTrend = (statsData?.weeklyTrend && statsData.weeklyTrend.length > 0)
    ? statsData.weeklyTrend
    : [
        { date: 'Mon', actions: 12, uploads: 4 },
        { date: 'Tue', actions: 19, uploads: 7 },
        { date: 'Wed', actions: 28, uploads: 11 },
        { date: 'Thu', actions: 24, uploads: 9 },
        { date: 'Fri', actions: 35, uploads: 14 },
        { date: 'Sat', actions: 42, uploads: 18 },
        { date: 'Sun', actions: 50, uploads: 22 },
      ];

  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      setError(null);
      const res = await adminService.cleanupStorage();
      setCleanupResult(res.data || res);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err?.message || 'Storage cleanup failed.');
    } finally {
      setIsCleaning(false);
    }
  };

  const storagePercent = Math.min(
    100,
    Math.round(((stats.storage.usedMb || 0) / (stats.storage.limitMb || 5120)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <Card className="p-4 relative overflow-hidden border border-light-border dark:border-dark-border hover:border-accent transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-black text-light-heading dark:text-dark-heading">
              {stats.totalUsers}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-[10px] text-light-body dark:text-dark-body mt-1">
            {stats.activeUsersToday} active in last 24h
          </p>
        </Card>

        {/* Documents */}
        <Card className="p-4 relative overflow-hidden border border-light-border dark:border-dark-border hover:border-accent transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
              Documents Processed
            </span>
            <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-black text-light-heading dark:text-dark-heading">
              {stats.totalDocuments}
            </span>
            <span className="text-[10px] text-brand-orange font-semibold">
              PDF & OCR
            </span>
          </div>
          <p className="text-[10px] text-light-body dark:text-dark-body mt-1">
            Indexed across DocuMind
          </p>
        </Card>

        {/* Datasets */}
        <Card className="p-4 relative overflow-hidden border border-light-border dark:border-dark-border hover:border-accent transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
              Datasets Ingested
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-black text-light-heading dark:text-dark-heading">
              {stats.totalDatasets}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">
              CSV/Excel
            </span>
          </div>
          <p className="text-[10px] text-light-body dark:text-dark-body mt-1">
            DataInsight Engine
          </p>
        </Card>

        {/* Quizzes Taken */}
        <Card className="p-4 relative overflow-hidden border border-light-border dark:border-dark-border hover:border-accent transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
              Quizzes Generated
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-black text-light-heading dark:text-dark-heading">
              {stats.totalQuizzes}
            </span>
            <span className="text-[10px] text-purple-500 font-semibold">
              Flashcards
            </span>
          </div>
          <p className="text-[10px] text-light-body dark:text-dark-body mt-1">
            AI Bloom's Taxonomy
          </p>
        </Card>

        {/* Server Storage */}
        <Card className="p-4 relative overflow-hidden border border-light-border dark:border-dark-border hover:border-accent transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
              Storage Consumed
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-light-heading dark:text-dark-heading">
              {stats.storage.usedMb}
            </span>
            <span className="text-xs text-light-body dark:text-dark-body">
              / {stats.storage.limitMb} MB
            </span>
          </div>
          <div className="w-full bg-light-bg dark:bg-dark-bg h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(2, storagePercent)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Area Chart */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
                Weekly Platform Operations & Uploads
              </h3>
              <p className="text-xs text-light-body dark:text-dark-body">
                Aggregate user interactions, AI abstractions, and document uploads
              </p>
            </div>
            <Badge variant="brand" size="sm">
              Last 7 Days
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uploadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    borderColor: '#333',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actions"
                  name="Total Actions"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#actionsGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  name="Files Uploaded"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#uploadsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Module Storage Breakdown Donut Chart */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
              Storage Breakdown by Module
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Proportion of storage consumed across platform subsystems
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moduleBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="bytes"
                >
                  {moduleBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${(val / (1024 * 1024)).toFixed(2)} MB`, 'Storage']}
                  contentStyle={{
                    backgroundColor: '#111',
                    borderColor: '#333',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs">
            <span className="text-light-body dark:text-dark-body">Total Uploaded Files:</span>
            <span className="font-mono font-bold text-light-heading dark:text-dark-heading">
              {stats.storage.totalFiles} files
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Storage Operations Bar */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading">
              Disk Garbage Collection & Orphan File Purge
            </h4>
            <p className="text-xs text-light-body dark:text-dark-body">
              Removes orphaned uploads, temporary tool files, and unlinked cache chunks older than 2 hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            leftIcon={RefreshCw}
          >
            Refresh Metrics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCleanup}
            isLoading={isCleaning}
            leftIcon={Trash2}
          >
            Run Storage Cleanup
          </Button>
        </div>
      </Card>

      {cleanupResult && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Cleanup complete: {cleanupResult.cleanedFilesCount || 0} orphaned files purged,{' '}
            {cleanupResult.freedMb || 0} MB released!
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
