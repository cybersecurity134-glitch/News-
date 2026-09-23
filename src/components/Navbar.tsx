/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, AppNotification } from '../types';
import { Bell, Sun, Moon, PlusCircle, Shield, ChevronDown, User, LogOut, LogIn, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  notifications: AppNotification[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSubmit: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: (role?: 'viewer' | 'uploader') => void;
  onLogout: () => void;
  onNavigateProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  isDark,
  onToggleTheme,
  onOpenSubmit,
  onOpenNotifications,
  onOpenAuthModal,
  onLogout,
  onNavigateProfile,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifsCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.read
  ).length;

  return (
    <header
      id="ios-navbar"
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FFFFFF]/85 dark:bg-[#000000]/85 border-b border-[rgba(60,60,67,0.15)] dark:border-[rgba(84,84,88,0.5)] transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            VP
          </div>
          <div className="flex flex-col">
            <span className="ios-headline text-base tracking-tight text-[#000000] dark:text-[#FFFFFF]">
              VenturePulse
            </span>
            <span className="text-[10px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] -mt-1 font-medium hidden sm:block">
              Curated Startup Intelligence
            </span>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-2">
          {/* Submit News Button */}
          <button
            id="navbar-submit-btn"
            onClick={onOpenSubmit}
            className="px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070DF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit News</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* Notification Bell */}
          <button
            id="navbar-notif-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-[rgba(60,60,67,0.08)] dark:hover:bg-[rgba(235,235,245,0.08)] text-[#000000] dark:text-[#FFFFFF] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="navbar-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-[rgba(60,60,67,0.08)] dark:hover:bg-[rgba(235,235,245,0.08)] text-[#000000] dark:text-[#FFFFFF] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Account State or Sign In Button */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[rgba(60,60,67,0.08)] dark:hover:bg-[rgba(235,235,245,0.08)] transition-all border border-[rgba(60,60,67,0.1)] dark:border-[rgba(235,235,245,0.1)]"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-black/10"
                />
                <div className="text-left hidden md:block">
                  <span className="block text-xs font-semibold leading-none truncate max-w-[100px] text-[#000000] dark:text-[#FFFFFF]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] uppercase font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[rgba(60,60,67,0.5)]" />
              </button>

              {/* User Account Menu Dropdown (Replaces example persona switcher) */}
              {showUserMenu && (
                <div
                  id="user-switch-menu"
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.15)] dark:border-[rgba(84,84,88,0.5)] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3"
                >
                  {/* Account Summary */}
                  <div className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-black/10"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs text-[#000000] dark:text-[#FFFFFF] block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[11px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] block truncate">
                        {currentUser.email}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            currentUser.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : currentUser.role === 'uploader'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                        {currentUser.role === 'uploader' && currentUser.isApproved && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            (Verified)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateProfile();
                      }}
                      className="w-full p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2.5 text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[rgba(60,60,67,0.6)]" />
                      <span>View Profile & Credentials</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal('uploader');
                      }}
                      className="w-full p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] transition-colors text-left"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Log In with 1-Min Passcode</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full p-2 rounded-xl hover:bg-red-500/10 flex items-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Sign In Button */
            <button
              id="navbar-login-btn"
              onClick={() => onOpenAuthModal('uploader')}
              className="px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
