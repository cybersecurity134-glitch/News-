/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { IntelligenceProvider } from './context/IntelligenceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AmbientBackground } from './components/glass/AmbientBackground';
import { IntelligenceNavbar } from './components/intelligence/IntelligenceNavbar';
import { IntelligenceTabBar, IntelligenceTab } from './components/intelligence/IntelligenceTabBar';
import { SearchIntelligenceModal } from './components/intelligence/SearchIntelligenceModal';
import { PersonalizedOnboardingModal } from './components/intelligence/PersonalizedOnboardingModal';
import { AlertsManagerModal } from './components/intelligence/AlertsManagerModal';
import { SecureAdminDashboard } from './components/admin/SecureAdminDashboard';
import { SecureAuthModal } from './components/auth/SecureAuthModal';
import { ArticleDetailModal } from './components/intelligence/ArticleDetailModal';
import { AddNewsModal } from './components/upload/AddNewsModal';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { NewsEventItem } from './types/intelligence';
import { AlertTriangle } from 'lucide-react';

// Intelligence Views
import { HomeDashboardView } from './pages/intelligence/HomeDashboardView';
import { MyFeedView } from './pages/intelligence/MyFeedView';
import { StartupsView } from './pages/intelligence/StartupsView';
import { FundingView } from './pages/intelligence/FundingView';
import { InvestorsView } from './pages/intelligence/InvestorsView';
import { SchemesView } from './pages/intelligence/SchemesView';
import { OpportunitiesView } from './pages/intelligence/OpportunitiesView';
import { EventsView } from './pages/intelligence/EventsView';
import { ProblemsView } from './pages/intelligence/ProblemsView';
import { SavedView } from './pages/intelligence/SavedView';

function AppContent() {
  const { currentUser, isAdmin, systemSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsEventItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);

  // Authentication modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Command+K / Ctrl+K keyboard shortcut for instant intelligence search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex flex-col font-sans transition-colors duration-300">
      {/* Dynamic Ambient Fluid Nodes (Level 1 Glass Canvas) */}
      <AmbientBackground />

      {/* Emergency Maintenance Mode Notice (Section 12) */}
      {systemSettings.disableMemberAccess && !isAdmin && (
        <div className="w-full bg-rose-600/90 text-white text-xs font-bold py-2.5 px-4 text-center z-50 backdrop-blur-md flex items-center justify-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {systemSettings.emergencyMessage ||
              'EMERGENCY NOTICE: Member access is temporarily suspended by the administrator. Normal operations will resume shortly.'}
          </span>
        </div>
      )}

      {/* Top Intelligence Navbar */}
      <IntelligenceNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenAddNews={() => setIsAddNewsOpen(true)}
        onOpenAdmin={() => {
          if (!currentUser) {
            setAuthMode('login');
            setIsAuthOpen(true);
          } else if (isAdmin) {
            setIsAdminOpen(true);
          } else {
            // Non-admin user signed in: open auth modal to allow switching to an admin account
            setAuthMode('login');
            setIsAuthOpen(true);
          }
        }}
        onOpenAuth={(mode = 'login') => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 pb-28 md:pb-24 relative z-10">
        {/* Offline Status & Local Cache Resilience Banner */}
        <OfflineBanner />

        <ErrorBoundary fallbackTitle="Something went wrong.">
          {activeTab === 'home' && (
            <HomeDashboardView
              onOpenArticle={(item) => setSelectedArticle(item)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'my-feed' && (
            <MyFeedView
              onOpenArticle={(item) => setSelectedArticle(item)}
              onOpenPreferences={() => setIsPreferencesOpen(true)}
            />
          )}

          {activeTab === 'startups' && <StartupsView />}

          {activeTab === 'funding' && <FundingView />}

          {activeTab === 'investors' && <InvestorsView />}

          {activeTab === 'schemes' && <SchemesView />}

          {activeTab === 'opportunities' && <OpportunitiesView />}

          {activeTab === 'events' && <EventsView />}

          {activeTab === 'problems' && <ProblemsView />}

          {activeTab === 'saved' && (
            <SavedView onOpenArticle={(item) => setSelectedArticle(item)} />
          )}
        </ErrorBoundary>
      </main>

      {/* iOS 26 Floating Dock Tab Navigation */}
      <IntelligenceTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Search Intelligence Modal */}
      <SearchIntelligenceModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Founder Preferences Onboarding Modal */}
      <PersonalizedOnboardingModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      {/* Alerts Manager Modal */}
      <AlertsManagerModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* Secure Administrator Management Dashboard Console */}
      <SecureAdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Secure Authentication Modal (Sign In / Sign Up / Forgot Password) */}
      <SecureAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Article Detail Reader Modal */}
      <ArticleDetailModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Complete News Upload & Verification System Modal (Camera, OCR, Fact-check, Similarity) */}
      <AddNewsModal
        isOpen={isAddNewsOpen}
        onClose={() => setIsAddNewsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IntelligenceProvider>
          <AppContent />
        </IntelligenceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
