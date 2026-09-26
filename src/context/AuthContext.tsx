/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, SystemSettings } from '../types/auth';
import { apiClient } from '../api/client';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  systemSettings: SystemSettings;
  login: (email: string, password?: string) => Promise<AuthUser>;
  signup: (payload: {
    email: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    phone?: string;
    role?: any;
    uploadPassword?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; simulationResetCode?: string }>;
  resetPassword: (payload: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; message: string }>;
  refreshMe: () => Promise<AuthUser | null>;
  updateSettingsState: (settings: Partial<SystemSettings>) => void;
  // Legacy / fallback helpers
  loginWithOtpUser: (user: any, sessionToken?: string) => void;
  switchUser: (user: any) => void;
  loginUploader: (email: string, password: string) => Promise<any>;
  verifyUploaderOtp: (otpToken: string, code: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vp_auth_user';
const TOKEN_KEY = 'vp_session_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    pauseRegistrations: false,
    disableMemberAccess: false,
    emergencyMessage: 'Member access is temporarily suspended for system maintenance.',
  });

  // Strict server-side verification helper
  const refreshMe = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiClient.getMe();
      if (res.authenticated && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
      } else {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
      if (res.settings) {
        setSystemSettings(res.settings);
      }
      return res.user;
    } catch {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }, []);

  // Restore stored session and verify with server
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const cachedUser = localStorage.getItem(STORAGE_KEY);
          if (cachedUser) {
            setCurrentUser(JSON.parse(cachedUser));
          }
          await refreshMe();
        } catch {
          // handled in refreshMe
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Heartbeat every 2 minutes to keep active session updated and sync settings
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        refreshMe().catch(() => {});
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [refreshMe]);

  const login = async (email: string, password?: string): Promise<AuthUser> => {
    const res = await apiClient.login(email, password);
    setCurrentUser(res.user);
    // Refresh to get full server settings
    refreshMe().catch(() => {});
    return res.user;
  };

  const signup = async (payload: {
    email: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    phone?: string;
    role?: any;
    uploadPassword?: string;
  }): Promise<AuthUser> => {
    const res = await apiClient.signup(payload);
    setCurrentUser(res.user);
    refreshMe().catch(() => {});
    return res.user;
  };

  const logout = async (): Promise<void> => {
    await apiClient.logout();
    setCurrentUser(null);
  };

  const forgotPassword = async (email: string) => {
    return await apiClient.forgotPassword(email);
  };

  const resetPassword = async (payload: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }) => {
    return await apiClient.resetPassword(payload);
  };

  const updateSettingsState = (settings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));
  };

  const loginWithOtpUser = (user: any, sessionToken?: string) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (sessionToken) localStorage.setItem(TOKEN_KEY, sessionToken);
  };

  const switchUser = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const loginUploader = async (email: string, password: string) => {
    return await apiClient.loginUploader(email, password);
  };

  const verifyUploaderOtp = async (otpToken: string, code: string) => {
    const res = await apiClient.verifyUploaderOtp(otpToken, code);
    if (res.user) {
      setCurrentUser(res.user as any);
    }
    return res;
  };

  // STRICT RBAC CHECK:
  // Admin role is confirmed server-side in currentUser.role === 'admin'
  const isAdmin = currentUser?.role === 'admin';

  const contextValue = React.useMemo(
    () => ({
      currentUser,
      isLoading,
      isAdmin,
      systemSettings,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      refreshMe,
      updateSettingsState,
      loginWithOtpUser,
      switchUser,
      loginUploader,
      verifyUploaderOtp,
    }),
    [
      currentUser,
      isLoading,
      isAdmin,
      systemSettings,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      refreshMe,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
