import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Activity,
  HardDrive,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AdminDashboard } from './AdminDashboard';
import { UsersManager } from './UsersManager';
import { ActivityLogs } from './ActivityLogs';

export const AdminPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'logs'
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getStats();
      if (res?.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.warn('[AdminPage] Failed to fetch system stats:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const tabs = [
    { id: 'analytics', label: 'System Analytics & Storage', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'logs', label: 'Activity Logs & Audit', icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.admin', 'Admin Control Center')}
            </h1>
            <Badge variant="brand" size="sm" icon={ShieldAlert}>
              Root Security
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body max-w-2xl">
            Real-time platform telemetry, user permission delegation, storage garbage collection, and compliance audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isLoading}
            leftIcon={RefreshCw}
          >
            Sync All
          </Button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-light-border dark:border-dark-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-accent text-black font-bold shadow-sm'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'analytics' && (
          <AdminDashboard statsData={statsData} onRefresh={fetchStats} />
        )}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'logs' && <ActivityLogs />}
      </div>
    </div>
  );
};

export default AdminPage;
