import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  FileText,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const UsersManager = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal for delete confirmation
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async (page = 1, searchQuery = search, role = roleFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: searchQuery,
        role: role !== 'all' ? role : undefined,
      });

      if (res?.data?.users) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search, roleFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      setError(null);
      await adminService.updateUserRole(user._id, newRole);
      setActionSuccess(`Role for ${user.email} updated to ${newRole}`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      setIsDeleting(true);
      setError(null);
      await adminService.deleteUser(deleteModalUser._id);
      setActionSuccess(`User ${deleteModalUser.email} permanently purged.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setDeleteModalUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs">
            {['all', 'admin', 'user'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  roleFilter === r
                    ? 'bg-accent text-black font-bold'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <Card className="p-0 overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border text-light-body dark:text-dark-body uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Storage Used</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isSelf = u._id === currentAdmin?._id || u._id === currentAdmin?.id;
                const storageMb = ((u.storageUsedBytes || 0) / (1024 * 1024)).toFixed(2);

                return (
                  <tr
                    key={u._id}
                    className="hover:bg-light-surface/60 dark:hover:bg-dark-surface/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent-dark dark:text-accent-light flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-light-heading dark:text-dark-heading truncate flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/20 text-accent-dark dark:text-accent-light font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-light-body dark:text-dark-body truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isAdmin ? 'brand' : 'neutral'}
                        size="sm"
                        icon={isAdmin ? ShieldCheck : Shield}
                      >
                        {isAdmin ? 'Admin' : 'Regular User'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-light-heading dark:text-dark-heading">
                      {u.documentsCount || 0}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-light-body dark:text-dark-body">
                      {storageMb} MB
                    </td>

                    <td className="py-3.5 px-4 text-light-body dark:text-dark-body text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleToggle(u)}
                          disabled={isSelf}
                          className="text-[11px] h-7 px-2"
                        >
                          {isAdmin ? 'Demote' : 'Make Admin'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModalUser(u)}
                          disabled={isSelf}
                          className="text-status-danger hover:bg-status-danger/10 h-7 w-7 p-0"
                          title="Purge user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-light-body dark:text-dark-body">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-body dark:text-dark-body">
          <span>
            Showing {users.length} of {pagination.total} users
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
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
              onClick={() => fetchUsers(pagination.page + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalUser)}
        onClose={() => setDeleteModalUser(null)}
        title="Confirm User Purge"
        description={`Are you sure you want to permanently delete ${deleteModalUser?.email}?`}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalUser(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteUser}
              isLoading={isDeleting}
              className="bg-status-danger hover:bg-status-danger/90 text-white"
            >
              Purge User & Data
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-light-body dark:text-dark-body">
          <p>
            This action is <strong className="text-status-danger">irreversible</strong>. It will permanently remove:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The user's account and authentication profile</li>
            <li>All associated PDF documents, OCR extracts, and vector embeddings</li>
            <li>All tabular datasets and profiled schemas</li>
            <li>All generated quizzes and timeline activity logs</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManager;
