import React, { useState } from 'react';
import Header from './components/Header.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import RouteFinder from './components/RouteFinder.jsx';
import RouteResults from './components/RouteResults.jsx';
import RouteDirectory from './components/RouteDirectory.jsx';
import AnnouncementBanner from './components/AnnouncementBanner.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';

const TABS = [
  { id: 'finder',    label: '🔍 Find Route' },
  { id: 'directory', label: '🗺️ Routes' },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState('finder');
  const [routeResult, setRouteResult]   = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  function handleRouteFound(result) {
    setRouteResult(result);
  }

  function handleFeedback(routeId) {
    setSelectedRouteId(routeId);
    setFeedbackOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
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
                  ? 'text-brand-600 border-b-2 border-brand-500'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        {activeTab === 'finder' && (
          <>
            <RouteFinder onRouteFound={handleRouteFound} />
            {routeResult && (
              <RouteResults result={routeResult} onFeedback={handleFeedback} />
            )}
          </>
        )}
        {activeTab === 'directory' && <RouteDirectory />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        SakaySmart Butuan v1.0 · Helping commuters navigate Butuan City
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
