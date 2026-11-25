import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Shield, Users, HardDrive, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.admin', 'Admin Panel')}
            </h1>
            <Badge variant="neutral">System Oversight</Badge>
          </div>
          <p className="text-sm text-light-body dark:text-dark-body">
            System health, storage metrics, user management, and AI token utilization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-body dark:text-dark-body">Total Users</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">12</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-body dark:text-dark-body">Uploads Storage</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">24.5 MB</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-status-success/10 text-emerald-500">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-body dark:text-dark-body">System Health</p>
            <p className="font-heading text-xl font-bold text-emerald-500">100%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-body dark:text-dark-body">Security Status</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">Armed</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
