import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Shield, Users, HardDrive, Activity } from 'lucide-react';

export const AdminPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-white">Admin Console</h1>
            <Badge variant="neutral">System Oversight</Badge>
          </div>
          <p className="text-sm text-light-text dark:text-dark-text-secondary">
            System health, storage metrics, user management, and AI token utilization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red-bright">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-text dark:text-dark-text-secondary">Total Users</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-white">--</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-orange/10 text-brand-orange-bright">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-text dark:text-dark-text-secondary">Uploads Storage</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-white">0 MB</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-text dark:text-dark-text-secondary">System Health</p>
            <p className="font-heading text-xl font-bold text-emerald-500">100%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-light-text dark:text-dark-text-secondary">Security Status</p>
            <p className="font-heading text-xl font-bold text-light-heading dark:text-white">Armed</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
