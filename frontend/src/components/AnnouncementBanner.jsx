import React, { useEffect, useState } from 'react';
import { getAnnouncements } from '../api/client.js';

const TYPE_STYLES = {
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  alert:   'bg-red-50 border-red-200 text-red-800',
};

const TYPE_ICONS = { info: 'ℹ️', warning: '⚠️', alert: '🚨' };

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(() => {}); // silent fail — offline mode
  }, []);

  const visible = announcements.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-3 space-y-2">
      {visible.map(ann => (
        <div
          key={ann.id}
          className={`flex items-start gap-2 border rounded-xl px-3 py-2 text-sm ${TYPE_STYLES[ann.type] || TYPE_STYLES.info}`}
        >
          <span className="mt-0.5 shrink-0">{TYPE_ICONS[ann.type] || 'ℹ️'}</span>
          <div className="flex-1">
            <span className="font-semibold">{ann.title}: </span>
            {ann.body}
          </div>
          <button
            onClick={() => setDismissed(prev => new Set([...prev, ann.id]))}
            className="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
