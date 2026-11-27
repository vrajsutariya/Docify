import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  BarChart3,
  Wrench,
  Key,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getActivityLogs({
        page,
        limit: 20,
        search,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (res?.data?.logs) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to load activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, moduleFilter, statusFilter]);

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `docify-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'documind':
        return FileText;
      case 'datainsight':
        return BarChart3;
      case 'smarttools':
        return Wrench;
      case 'auth':
        return Key;
      case 'admin':
        return Shield;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by action, user or details..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Module Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs shrink-0">
            {['all', 'documind', 'datainsight', 'smarttools', 'auth', 'admin'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModuleFilter(m)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all text-[11px] ${
                  moduleFilter === m
                    ? 'bg-accent text-black font-bold'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                {m === 'all' ? 'All' : m}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportLogsAsJson}
            disabled={logs.length === 0}
            leftIcon={Download}
            className="shrink-0 text-xs"
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border text-light-body dark:text-dark-body uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {logs.map((log) => {
                const Icon = getModuleIcon(log.module);
                const isSuccess = log.status === 'success';

                return (
                  <tr
                    key={log._id}
                    className="hover:bg-light-surface/60 dark:hover:bg-dark-surface/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-status-danger shrink-0" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-light-body dark:text-dark-body font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-light-heading dark:text-dark-heading capitalize">
                        <Icon className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light shrink-0" />
                        <span>{log.module}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border font-semibold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-light-heading dark:text-dark-heading font-medium truncate max-w-[140px]">
                      {log.userEmail}
                    </td>

                    <td className="py-3 px-4 text-light-body dark:text-dark-body text-[11px] leading-relaxed">
                      {log.details || '—'}
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-light-body dark:text-dark-body">
                    No activity logs recorded matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-body dark:text-dark-body">
          <span>
            Showing {logs.length} of {pagination.total} audit entries
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs px-2">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogs;
