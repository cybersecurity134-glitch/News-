/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  UserX,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  LogOut,
  Sliders,
  History,
  FileText,
  Lock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { AuthUser, AdminOverview, ActiveSession, AdminAuditLog, UserDetailsResponse, SystemSettings } from '../../types/auth';
import { VerificationQueueView } from './VerificationQueueView';

interface SecureAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'members' | 'sessions' | 'audit' | 'settings' | 'sources' | 'verification';

export const SecureAdminDashboard: React.FC<SecureAdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateSettingsState } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    pauseRegistrations: false,
    disableMemberAccess: false,
    emergencyMessage: 'Member access is temporarily suspended for system maintenance.',
  });

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'pending' | 'suspended'>('all');

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dialog states
  const [blockingTarget, setBlockingTarget] = useState<AuthUser | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<AuthUser | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [ovData, usersData, sessionsData, auditData, settingsData] = await Promise.all([
        apiClient.getAdminOverview(),
        apiClient.getAdminUsers(),
        apiClient.getAdminSessions(),
        apiClient.getAdminAuditLogs(),
        apiClient.getAdminSettings(),
      ]);

      setOverview(ovData);
      setUsers(usersData);
      setSessions(sessionsData);
      setAuditLogs(auditData);
      setSettings(settingsData);
      updateSettingsState(settingsData);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to load administrator data.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [updateSettingsState]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // Poll every 15s for live session tracking
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchData]);

  if (!isOpen) return null;

  // Filter members list
  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q));
    return matchesStatus && matchesSearch;
  });

  // Confirm and execute blocking
  const handleConfirmBlock = async () => {
    if (!blockingTarget) return;
    try {
      const res = await apiClient.blockUser(blockingTarget.id);
      setActionNotice({
        type: 'success',
        message: res.message || `Member ${blockingTarget.email} blocked successfully.`,
      });
      setBlockingTarget(null);
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to block member.',
      });
    }
  };

  // Execute unblocking
  const handleUnblock = async (user: AuthUser) => {
    try {
      const res = await apiClient.unblockUser(user.id);
      setActionNotice({
        type: 'success',
        message: res.message || `Member ${user.email} restored to active status.`,
      });
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to unblock member.',
      });
    }
  };

  // Change member status
  const handleChangeStatus = async (userId: string, newStatus: string) => {
    try {
      await apiClient.updateUserStatus(userId, newStatus);
      setActionNotice({
        type: 'success',
        message: `Member status updated to ${newStatus}.`,
      });
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to change status.',
      });
    }
  };

  // Confirm and execute user deletion
  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    try {
      await apiClient.deleteUser(deletingTarget.id);
      setActionNotice({
        type: 'success',
        message: `Member ${deletingTarget.email} has been deleted.`,
      });
      setDeletingTarget(null);
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to delete member.',
      });
    }
  };

  // Terminate a single session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.revokeSession(sessionId);
      setActionNotice({
        type: 'success',
        message: 'Session terminated immediately.',
      });
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to revoke session.',
      });
    }
  };

  // Emergency terminate all member sessions
  const handleTerminateAllMemberSessions = async () => {
    if (!window.confirm('Terminate all active member sessions immediately? All members will be required to log in again.')) {
      return;
    }
    try {
      const res = await apiClient.terminateAllMemberSessions();
      setActionNotice({
        type: 'success',
        message: `Revoked ${res.count} active member session(s).`,
      });
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to terminate member sessions.',
      });
    }
  };

  // View user details modal
  const handleViewDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await apiClient.getAdminUserDetails(userId);
      setSelectedUserDetails(details);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to fetch member details.',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Toggle Pause Registrations (Section 11)
  const handleTogglePauseRegistrations = async () => {
    try {
      const updated = !settings.pauseRegistrations;
      const res = await apiClient.updateAdminSettings({ pauseRegistrations: updated });
      setSettings(res.settings);
      updateSettingsState(res.settings);
      setActionNotice({
        type: 'success',
        message: updated
          ? 'New member registrations have been paused.'
          : 'New member registrations are now enabled.',
      });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to update registration settings.',
      });
    }
  };

  // Toggle Emergency Member Access Control (Section 12)
  const handleToggleDisableMemberAccess = async () => {
    const updated = !settings.disableMemberAccess;
    const promptText = updated
      ? 'EMERGENCY ACTION: Disable all normal member access to the application? All member sessions will be immediately invalidated. Administrator access will remain active.'
      : 'Restore normal member access to the application?';

    if (!window.confirm(promptText)) return;

    try {
      const res = await apiClient.updateAdminSettings({ disableMemberAccess: updated });
      setSettings(res.settings);
      updateSettingsState(res.settings);
      setActionNotice({
        type: 'success',
        message: updated
          ? 'Emergency lockdown activated: Member access suspended.'
          : 'Normal member access has been restored.',
      });
      fetchData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to update emergency access mode.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Secure Administrator Management Dashboard"
    >
      <div
        className="w-full max-w-5xl liquid-glass-modal rounded-3xl p-3.5 sm:p-6 md:p-7 my-auto shadow-2xl space-y-5 sm:space-y-6 border border-white/20 dark:border-white/10 max-h-[94dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#00C7BE] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-white/20 dark:bg-black/30 backdrop-blur-xs flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl text-[var(--text-primary)]">
                  Administrator Console
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-teal)]/15 text-[var(--accent-teal)] uppercase tracking-wider">
                  Verified Role: Admin
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Secure member management, active session telemetry, access controls, and audit logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors tap-target-44"
              title="Refresh live metrics and sessions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--accent-primary)]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Notices */}
        {actionNotice && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="p-1 hover:opacity-75"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Metric Cards (Section 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Members */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)]">
              <span className="uppercase text-[10px]">Total Members</span>
              <Users className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {overview?.totalMembers ?? users.filter((u) => u.role === 'member').length}
            </p>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Registered accounts
            </span>
          </div>

          {/* Currently Active Members (Section 6) */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)]">
              <span className="uppercase text-[10px]">Currently Active</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">
                {overview?.activeMembers ?? sessions.filter((s) => s.isCurrentlyActive).length}
              </p>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Active within 15 min
            </span>
          </div>

          {/* Blocked Members (Section 8) */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)]">
              <span className="uppercase text-[10px]">Blocked Members</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-500">
              {overview?.blockedMembers ?? users.filter((u) => u.status === 'blocked').length}
            </p>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Login access stopped
            </span>
          </div>

          {/* New Members */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)]">
              <span className="uppercase text-[10px]">New Members</span>
              <UserPlus className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {overview?.newMembersCount ?? 0}
            </p>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Registered in last 7 days
            </span>
          </div>
        </div>

        {/* Global Security Controls Bar (Sections 11 & 12) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
              <Sliders className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Global Login & Emergency Access Controls</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">Server-enforced RBAC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pause Registrations Toggle (Section 11) */}
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Pause New Member Registrations
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {settings.pauseRegistrations
                    ? 'Registration disabled: New signups paused.'
                    : 'Registration enabled: New users can create accounts.'}
                </p>
              </div>
              <button
                onClick={handleTogglePauseRegistrations}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors tap-target-44 ${
                  settings.pauseRegistrations
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {settings.pauseRegistrations ? 'Paused' : 'Enabled'}
              </button>
            </div>

            {/* Emergency Member Access Toggle (Section 12) */}
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Emergency Access Control
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {settings.disableMemberAccess
                    ? 'Lockdown Active: Member access suspended.'
                    : 'Normal: Members have full terminal access.'}
                </p>
              </div>
              <button
                onClick={handleToggleDisableMemberAccess}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors tap-target-44 ${
                  settings.disableMemberAccess
                    ? 'bg-rose-600 text-white shadow-md animate-pulse'
                    : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)] hover:text-rose-500'
                }`}
              >
                {settings.disableMemberAccess ? 'Active Lockdown' : 'Normal Access'}
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto text-xs font-bold no-scrollbar flex-nowrap">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 tap-target-44 ${
              activeTab === 'members'
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 tap-target-44 ${
              activeTab === 'sessions'
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Active Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 tap-target-44 ${
              activeTab === 'audit'
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 tap-target-44 ${
              activeTab === 'verification'
                ? 'bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>News Verification & Review</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1: MEMBER MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* Search & Filters (Section 5) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email, name, or phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              {/* Status Filter Pills (Section 18) */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold p-1 rounded-2xl bg-black/5 dark:bg-white/5">
                {(['all', 'active', 'blocked', 'pending', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl uppercase tracking-wider transition-all ${
                      statusFilter === st
                        ? 'bg-white dark:bg-white/20 text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Member List Table (Section 5) */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 text-[10px] uppercase font-extrabold text-[var(--text-tertiary)] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                        No members found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isAdminAccount = user.role === 'admin' || user.email === 'cybersecurity134@gmail.com';
                      return (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          {/* Member */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-extrabold flex items-center justify-center text-xs">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                  {user.name || 'Member'}
                                  {isAdminAccount && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] font-extrabold uppercase">
                                      Admin
                                    </span>
                                  )}
                                </p>
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                  ID: {user.id.slice(0, 12)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-secondary)]">
                            {user.email}
                          </td>

                          {/* Account Status Badge (Section 18) */}
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-500'
                                  : user.status === 'blocked'
                                  ? 'bg-rose-500/15 text-rose-500'
                                  : user.status === 'suspended'
                                  ? 'bg-amber-500/15 text-amber-500'
                                  : 'bg-blue-500/15 text-blue-500'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-emerald-500'
                                    : user.status === 'blocked'
                                    ? 'bg-rose-500'
                                    : user.status === 'suspended'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                              {user.status}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>

                          {/* Created */}
                          <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetails(user.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                title="View member details and login history"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Block / Unblock Actions (Sections 8 & 9) */}
                              {!isAdminAccount && (
                                <>
                                  {user.status === 'blocked' ? (
                                    <button
                                      onClick={() => handleUnblock(user)}
                                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-[10px] flex items-center gap-1"
                                      title="Restore member access"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>Unblock</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setBlockingTarget(user)}
                                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-[10px] flex items-center gap-1"
                                      title="Stop member login access"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Block</span>
                                    </button>
                                  )}

                                  {/* Delete Member (Section 19) */}
                                  <button
                                    onClick={() => setDeletingTarget(user)}
                                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-tertiary)] hover:text-rose-500"
                                    title="Delete member account permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: ACTIVE LOGIN TRACKING (Section 6) */}
        {/* ========================================== */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  Active Authenticated Member Sessions
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Members with active sessions or recent interactions within the 15-minute activity window
                </p>
              </div>

              <button
                onClick={handleTerminateAllMemberSessions}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto tap-target-44"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminate All Member Sessions</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 text-[10px] uppercase font-extrabold text-[var(--text-tertiary)] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Member Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Login Time</th>
                    <th className="px-4 py-3">Last Activity</th>
                    <th className="px-4 py-3">Client / IP</th>
                    <th className="px-4 py-3">Session Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                        No active authenticated sessions currently detected.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.sessionId} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-primary)] font-bold">
                          {sess.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              sess.role === 'admin'
                                ? 'bg-[var(--accent-teal)]/20 text-[var(--accent-teal)]'
                                : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]'
                            }`}
                          >
                            {sess.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                          {new Date(sess.createdAt).toLocaleTimeString()} ({new Date(sess.createdAt).toLocaleDateString()})
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                          {new Date(sess.lastActivityAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)] max-w-xs truncate">
                          {sess.ipOrUa}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                              sess.isCurrentlyActive
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : 'bg-amber-500/15 text-amber-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sess.isCurrentlyActive ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {sess.isCurrentlyActive ? 'Active Now' : 'Idle'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRevokeSession(sess.sessionId)}
                            className="px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-rose-500/20 hover:text-rose-500 text-[10px] font-bold text-[var(--text-secondary)] transition-colors"
                            title="Force invalidate this session"
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: ADMIN AUDIT LOGS (Section 17) */}
        {/* ========================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Security & Administrative Audit Trail
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Cryptographic immutable log of administrative actions, status transitions, and security events
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 text-[10px] uppercase font-extrabold text-[var(--text-tertiary)] border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)] font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-secondary)]">
                          {log.adminEmail}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-secondary)]">
                          {log.targetEmail || '—'}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)] font-mono max-w-xs truncate">
                          {log.metadata ? JSON.stringify(log.metadata) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: NEWS VERIFICATION & EDITORIAL REVIEW */}
        {/* ========================================== */}
        {activeTab === 'verification' && (
          <VerificationQueueView />
        )}

        {/* ========================================== */}
        {/* BLOCK CONFIRMATION MODAL (Section 8 & 21) */}
        {/* ========================================== */}
        {blockingTarget && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            role="alertdialog"
          >
            <div
              className="w-full max-w-md liquid-glass-modal rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <UserX className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  Block Member Account?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  "Are you sure you want to block this account? The member will no longer be able to access the application."
                </p>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-xs font-bold text-rose-500">
                  {blockingTarget.email}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setBlockingTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBlock}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-colors"
                >
                  Block Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DELETE CONFIRMATION MODAL (Section 19) */}
        {/* ========================================== */}
        {deletingTarget && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            role="alertdialog"
          >
            <div
              className="w-full max-w-md liquid-glass-modal rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  Delete Member Permanently?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  This will completely remove the member profile and terminate all active sessions. This action cannot be undone.
                </p>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-xs font-bold text-[var(--text-primary)]">
                  {deletingTarget.email}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeletingTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MEMBER DETAILS & LOGIN HISTORY MODAL (Section 7) */}
        {/* ========================================== */}
        {selectedUserDetails && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
          >
            <div
              className="w-full max-w-lg liquid-glass-modal rounded-3xl p-6 shadow-2xl space-y-4 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[var(--accent-primary)]" />
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Member Security & Login History
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUserDetails(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                  <p className="font-extrabold text-sm text-[var(--text-primary)]">
                    {selectedUserDetails.user.name || 'Member'}
                  </p>
                  <p className="font-mono text-xs text-[var(--text-secondary)]">
                    {selectedUserDetails.user.email}
                  </p>
                  {selectedUserDetails.user.phone && (
                    <p className="text-xs text-[var(--text-tertiary)]">{selectedUserDetails.user.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Account Status</span>
                    <p className="font-bold text-[var(--text-primary)] uppercase">{selectedUserDetails.history.accountStatus}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Total Logins</span>
                    <p className="font-bold text-[var(--text-primary)]">{selectedUserDetails.history.numberOfLogins}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Last Successful Login</span>
                    <p className="font-bold text-[var(--text-primary)]">
                      {selectedUserDetails.history.lastLoginAt !== 'Never logged in'
                        ? new Date(selectedUserDetails.history.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Account Created</span>
                    <p className="font-bold text-[var(--text-primary)]">
                      {new Date(selectedUserDetails.history.accountCreationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status modifier dropdown inside details */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">Update Member Status:</span>
                  <select
                    value={selectedUserDetails.user.status}
                    onChange={(e) => {
                      handleChangeStatus(selectedUserDetails.user.id, e.target.value);
                      setSelectedUserDetails(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
