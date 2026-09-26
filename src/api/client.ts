/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsItem, StartupEvent, User, ChatMessage, Category } from '../types/models';
import { AuthUser, AdminOverview, ActiveSession, AdminAuditLog, UserDetailsResponse, SystemSettings } from '../types/auth';

const API_BASE = '';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vp_session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  return headers;
}

export interface UploaderLoginResponse {
  verifyToken?: string;
  otpToken?: string;
  expiresAt?: string;
  expiresInSeconds?: number;
  sessionToken?: string;
  user?: User;
}

export interface UploaderVerifyCodeResponse {
  sessionToken: string;
  user?: User;
}

export interface UploaderOtpVerifyResponse {
  sessionToken: string;
  user: User;
}

export interface UploaderOtpResendResponse {
  otpToken: string;
  verifyToken?: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export const apiClient = {
  // Addendum v2: Uploader Login & Fixed Code Verification (60s UI window)
  async loginUploader(email: string, password: string): Promise<UploaderLoginResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }
    return data;
  },

  async verifyUploaderCode(verifyToken: string, code: string): Promise<UploaderVerifyCodeResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken, code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Incorrect code. Try again.');
    }
    return data;
  },

  async restartUploaderAttempt(verifyToken?: string, email?: string, password?: string): Promise<UploaderLoginResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/restart-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Session expired. Please log in again.');
    }
    return data;
  },

  async verifyUploaderOtp(token: string, code: string): Promise<UploaderOtpVerifyResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken: token, code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Incorrect code. Try again.');
      throw err;
    }
    return data;
  },

  async resendUploaderOtp(token: string): Promise<UploaderOtpResendResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/restart-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken: token }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to restart verification');
    }
    return data;
  },

  async signupUploader(name: string, email: string, password: string): Promise<UploaderLoginResponse> {
    const res = await fetch(`${API_BASE}/api/auth/uploader/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register uploader account');
    }
    return data;
  },

  // Auth (General / Member / Admin)
  async checkEmail(email: string): Promise<{ available: boolean; valid: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) return { available: true, valid: false };
      return await res.json();
    } catch {
      return { available: true, valid: false };
    }
  },

  async login(email: string, password?: string): Promise<{ user: AuthUser; sessionToken: string }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password || '' }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Login failed');
      err.field = data.field;
      throw err;
    }
    if (data.sessionToken && typeof window !== 'undefined') {
      localStorage.setItem('vp_session_token', data.sessionToken);
      localStorage.setItem('vp_auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  async signup(payload: {
    name?: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    role?: 'viewer' | 'uploader' | 'member';
    uploadPassword?: string;
  }): Promise<{ user: AuthUser; sessionToken: string }> {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Signup failed');
      err.field = data.field;
      throw err;
    }
    if (data.sessionToken && typeof window !== 'undefined') {
      localStorage.setItem('vp_session_token', data.sessionToken);
      localStorage.setItem('vp_auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vp_session_token');
        localStorage.removeItem('vp_auth_user');
      }
    }
  },

  async getMe(): Promise<{ authenticated: boolean; user: AuthUser | null; settings: SystemSettings }> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vp_session_token');
        localStorage.removeItem('vp_auth_user');
      }
      throw new Error(data.error || 'Failed to authenticate');
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; simulationResetCode?: string }> {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
    return data;
  },

  async resetPassword(payload: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // =====================================
  // Admin Endpoints (RBAC server-checked)
  // =====================================
  async getAdminOverview(): Promise<AdminOverview> {
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin overview');
    return data;
  },

  async getAdminUsers(params?: { search?: string; status?: string; role?: string }): Promise<AuthUser[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.role && params.role !== 'all') q.append('role', params.role);

    const res = await fetch(`${API_BASE}/api/admin/users?${q.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
    return data;
  },

  async getAdminUserDetails(id: string): Promise<UserDetailsResponse> {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch member details');
    return data;
  },

  async blockUser(id: string): Promise<{ success: boolean; user: AuthUser; message: string }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to block member');
    return data;
  },

  async unblockUser(id: string): Promise<{ success: boolean; user: AuthUser; message: string }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/unblock`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unblock member');
    return data;
  },

  async updateUserStatus(id: string, status: string): Promise<{ success: boolean; user: AuthUser }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update member status');
    return data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete member');
    return data;
  },

  async getAdminSessions(): Promise<ActiveSession[]> {
    const res = await fetch(`${API_BASE}/api/admin/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch active sessions');
    return data;
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/admin/sessions/${sessionId}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke session');
    return data;
  },

  async terminateAllMemberSessions(): Promise<{ success: boolean; count: number }> {
    const res = await fetch(`${API_BASE}/api/admin/sessions/terminate-all-members`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to terminate member sessions');
    return data;
  },

  async getAdminAuditLogs(): Promise<AdminAuditLog[]> {
    const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return data;
  },

  async getAdminSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
    return data;
  },

  async updateAdminSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update system settings');
    return data;
  },

  // 1-minute email OTP
  async sendOtp(email: string, name?: string, role: string = 'uploader') {
    const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send passcode');
    return data;
  },

  async verifyOtp(email: string, code: string, name?: string, role: string = 'uploader'): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, name, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data.user;
  },

  // News CRUD
  async getNews(category?: Category | 'all', status?: 'approved' | 'pending' | 'rejected'): Promise<NewsItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status) params.append('status', status);

    const res = await fetch(`${API_BASE}/api/news?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  },

  async submitNews(
    newsData: {
      category: Category;
      headline: string;
      sourceName: string;
      sourceUrl: string;
      publishDate: string;
      summary: string;
      imageUrl?: string;
      uploaderId: string;
    },
    uploadPassword?: string
  ): Promise<NewsItem> {
    const res = await fetch(`${API_BASE}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-upload-password': uploadPassword || '',
      },
      body: JSON.stringify({
        ...newsData,
        uploadCode: uploadPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    return data;
  },

  async updateNewsStatus(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    adminId?: string
  ): Promise<NewsItem> {
    const res = await fetch(`${API_BASE}/api/news/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason, adminId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data.item || data;
  },

  // Events
  async getEvents(): Promise<StartupEvent[]> {
    const res = await fetch(`${API_BASE}/api/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  // Chat
  async getChats(userId?: string) {
    const res = await fetch(`${API_BASE}/api/chats?userId=${userId || ''}`);
    if (!res.ok) throw new Error('Failed to fetch chats');
    return res.json();
  },

  async getChatMessages(chatId: string, currentUserId?: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/api/chats/${chatId}/messages?currentUserId=${currentUserId || ''}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(
    chatId: string,
    senderId: string,
    text: string,
    recipientId?: string
  ): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, text, recipientId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  // Admin Password Management
  async getAdminPassword(): Promise<string> {
    const res = await fetch(`${API_BASE}/api/admin/password`);
    const data = await res.json();
    return data.adminUploadCode || 'STARTUP2026';
  },

  async updateAdminPassword(newPassword: string, adminId?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/admin/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, adminId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
    return data.adminUploadCode;
  },

  // Initial Full State
  async getFullState() {
    const res = await fetch(`${API_BASE}/api/state`);
    if (!res.ok) throw new Error('Failed to load application state');
    return res.json();
  },
};
