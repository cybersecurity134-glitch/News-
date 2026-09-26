/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { IntelligenceProvider } from './context/IntelligenceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AmbientBackground } from './components/glass/AmbientBackground';
import { IntelligenceNavbar } from './components/intelligence/IntelligenceNavbar';
import { IntelligenceTabBar, IntelligenceTab } from './components/intelligence/IntelligenceTabBar';
import { AppOpeningAnimation } from './components/brand/AppOpeningAnimation';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { FpsDebugOverlay } from './components/shared/FpsDebugOverlay';
import { NewsEventItem } from './types/intelligence';
import { AlertTriangle } from 'lucide-react';

// Code-split and lazy-load views so only the current screen's bundle is parsed
const HomeDashboardView = lazy(() =>
  import('./pages/intelligence/HomeDashboardView').then((m) => ({ default: m.HomeDashboardView }))
);
const MyFeedView = lazy(() =>
  import('./pages/intelligence/MyFeedView').then((m) => ({ default: m.MyFeedView }))
);
const StartupsView = lazy(() =>
  import('./pages/intelligence/StartupsView').then((m) => ({ default: m.StartupsView }))
);
const FundingView = lazy(() =>
  import('./pages/intelligence/FundingView').then((m) => ({ default: m.FundingView }))
);
const InvestorsView = lazy(() =>
  import('./pages/intelligence/InvestorsView').then((m) => ({ default: m.InvestorsView }))
);
const SchemesView = lazy(() =>
  import('./pages/intelligence/SchemesView').then((m) => ({ default: m.SchemesView }))
);
const OpportunitiesView = lazy(() =>
  import('./pages/intelligence/OpportunitiesView').then((m) => ({ default: m.OpportunitiesView }))
);
const EventsView = lazy(() =>
  import('./pages/intelligence/EventsView').then((m) => ({ default: m.EventsView }))
);
const ProblemsView = lazy(() =>
  import('./pages/intelligence/ProblemsView').then((m) => ({ default: m.ProblemsView }))
);
const SavedView = lazy(() =>
  import('./pages/intelligence/SavedView').then((m) => ({ default: m.SavedView }))
);

// Code-split and lazy-load heavy modals
const SearchIntelligenceModal = lazy(() =>
  import('./components/intelligence/SearchIntelligenceModal').then((m) => ({
    default: m.SearchIntelligenceModal,
  }))
);
const PersonalizedOnboardingModal = lazy(() =>
  import('./components/intelligence/PersonalizedOnboardingModal').then((m) => ({
    default: m.PersonalizedOnboardingModal,
  }))
);
const AlertsManagerModal = lazy(() =>
  import('./components/intelligence/AlertsManagerModal').then((m) => ({
    default: m.AlertsManagerModal,
  }))
);
const SecureAdminDashboard = lazy(() =>
  import('./components/admin/SecureAdminDashboard').then((m) => ({
    default: m.SecureAdminDashboard,
  }))
);
const SecureAuthModal = lazy(() =>
  import('./components/auth/SecureAuthModal').then((m) => ({
    default: m.SecureAuthModal,
  }))
);
const ArticleDetailModal = lazy(() =>
  import('./components/intelligence/ArticleDetailModal').then((m) => ({
    default: m.ArticleDetailModal,
  }))
);
const AddNewsModal = lazy(() =>
  import('./components/upload/AddNewsModal').then((m) => ({
    default: m.AddNewsModal,
  }))
);
const SettingsModal = lazy(() =>
  import('./components/settings/SettingsModal').then((m) => ({
    default: m.SettingsModal,
  }))
);

function AppContent() {
  const { currentUser, isAdmin, systemSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsEventItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      {/* App Opening Animation with Globe and Growth Trajectory */}
      <AppOpeningAnimation minDurationMs={1800} />

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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 pb-28 md:pb-24 relative z-10">
        {/* Offline Status & Local Cache Resilience Banner */}
        <OfflineBanner />

        <ErrorBoundary fallbackTitle="Something went wrong.">
          <Suspense fallback={null}>
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
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* iOS 26 Floating Dock Tab Navigation */}
      <IntelligenceTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Hidden Debug FPS & Frame-time Overlay (toggle with long press on brand logo or Shift+F) */}
      <FpsDebugOverlay />

      {/* Heavy Modals code-split & lazy-loaded inside Suspense */}
      <Suspense fallback={null}>
        {/* Search Intelligence Modal (rendered on-demand) */}
        {isSearchOpen && (
          <SearchIntelligenceModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        )}

        {/* Founder Preferences Onboarding Modal */}
        {isPreferencesOpen && (
          <PersonalizedOnboardingModal
            isOpen={isPreferencesOpen}
            onClose={() => setIsPreferencesOpen(false)}
          />
        )}

        {/* Alerts Manager Modal */}
        {isAlertsOpen && (
          <AlertsManagerModal
            isOpen={isAlertsOpen}
            onClose={() => setIsAlertsOpen(false)}
          />
        )}

        {/* Secure Administrator Management Dashboard Console */}
        {isAdminOpen && (
          <SecureAdminDashboard
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />
        )}

        {/* Secure Authentication Modal (Sign In / Sign Up / Forgot Password) */}
        {isAuthOpen && (
          <SecureAuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authMode}
            onSuccess={(user) => {
              if (user.role === 'admin') {
                setIsAdminOpen(true);
              } else if (user.role === 'uploader') {
                setActiveTab('my-feed');
              } else {
                setActiveTab('home');
              }
            }}
          />
        )}

        {/* Article Detail Reader Modal */}
        {selectedArticle && (
          <ArticleDetailModal
            item={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}

        {/* Complete News Upload & Verification System Modal (Camera, OCR, Fact-check, Similarity) */}
        {isAddNewsOpen && (
          <AddNewsModal
            isOpen={isAddNewsOpen}
            onClose={() => setIsAddNewsOpen(false)}
          />
        )}

        {/* Global Settings & Appearance Modal (Theme, Color Palettes, Custom Accent Engine) */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </Suspense>
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
