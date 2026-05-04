import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Header from './components/Header.jsx';
import RouteFinder from './components/RouteFinder.jsx';
import RouteResults from './components/RouteResults.jsx';
import RouteDirectory from './components/RouteDirectory.jsx';
import AnnouncementBanner from './components/AnnouncementBanner.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const TABS = [
  { id: 'finder',    label: '🔍 Find Route' },
  { id: 'directory', label: '🗺️ Routes' },
];

// ─── Main App (shown after login) ─────────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]       = useState('finder');
  const [routeResult, setRouteResult]   = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  function handleFeedback(routeId) {
    setSelectedRouteId(routeId);
    setFeedbackOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={logout} />
      <OfflineBanner />
      <AnnouncementBanner />

      {/* Tab bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'finder') setRouteResult(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors
                ${activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        {activeTab === 'finder' && (
          <>
            <RouteFinder onRouteFound={setRouteResult} />
            {routeResult && (
              <RouteResults result={routeResult} onFeedback={handleFeedback} />
            )}
          </>
        )}
        {activeTab === 'directory' && <RouteDirectory />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        SakaySmart Butuan v2.0 · Logged in as <strong>{user?.full_name}</strong>
      </footer>

      {feedbackOpen && (
        <FeedbackModal
          routeId={selectedRouteId}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Auth Gate ─────────────────────────────────────────────────────────────────
function AuthGate() {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  // Loading spinner while checking stored token
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-bounce">🚌</div>
          <p className="text-lg font-semibold">Loading SakaySmart…</p>
        </div>
      </div>
    );
  }

  // Not logged in → show auth pages
  if (!user) {
    return showSignup
      ? <SignupPage onSwitch={() => setShowSignup(false)} />
      : <LoginPage  onSwitch={() => setShowSignup(true)} />;
  }

  // Logged in → show dashboard
  return <Dashboard />;
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
