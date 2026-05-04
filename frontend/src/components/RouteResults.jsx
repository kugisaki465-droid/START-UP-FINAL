import React, { useState } from 'react';
import RouteMap from './RouteMap.jsx';

const OPTIMIZE_LABELS = {
  fare:      '💰 Cheapest',
  distance:  '📏 Shortest',
  time:      '⚡ Fastest',
  transfers: '🔄 Fewest Transfers',
};

export default function RouteResults({ result, onFeedback }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showMap, setShowMap]         = useState(false);
  const [showSteps, setShowSteps]     = useState(true);

  if (!result || !result.routes || result.routes.length === 0) return null;

  const route = result.routes[selectedIdx];

  return (
    <div className="space-y-4">
      {/* Origin → Destination header */}
      <div className="card flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-700 truncate">{result.origin.name}</span>
        <span className="text-gray-400 shrink-0">→</span>
        <span className="font-semibold text-gray-700 truncate">{result.destination.name}</span>
      </div>

      {/* Route option tabs */}
      {result.routes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {result.routes.map((r, i) => (
            <button
              key={i}
              onClick={() => { setSelectedIdx(i); setShowMap(false); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                ${selectedIdx === i
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
            >
              {OPTIMIZE_LABELS[r.optimizedFor] || `Option ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Route summary card */}
      <div className="card space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBadge icon="💰" label="Total Fare" value={`₱${route.totalFare.toFixed(2)}`} />
          <StatBadge icon="⏱️" label="Est. Time"  value={`~${route.totalTimeMin} min`} />
          <StatBadge icon="🔄" label="Transfers"  value={route.transfers} />
        </div>

        {/* Segment pills */}
        <div className="flex flex-wrap gap-2">
          {route.segments.map((seg, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: seg.color || '#F59E0B' }}
            >
              {seg.routeType === 'jeepney' ? '🚌' : '🛺'} [{seg.routeCode}] {seg.routeName}
            </span>
          ))}
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSteps(s => !s)}
            className="flex-1 text-sm border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition-colors font-medium"
          >
            {showSteps ? '▲ Hide Steps' : '▼ Show Steps'}
          </button>
          <button
            onClick={() => setShowMap(m => !m)}
            className="flex-1 text-sm border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition-colors font-medium"
          >
            {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="card p-0 overflow-hidden rounded-2xl" style={{ height: 300 }}>
          <RouteMap route={route} />
        </div>
      )}

      {/* Step-by-step instructions */}
      {showSteps && (
        <div className="card space-y-2">
          <h3 className="font-bold text-gray-800">Step-by-Step Instructions</h3>
          <ol className="space-y-2">
            {route.instructions.map((step, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Feedback */}
      <button
        onClick={() => onFeedback(route.segments[0]?.routeId)}
        className="w-full text-sm text-gray-500 hover:text-brand-600 py-2 transition-colors"
      >
        📝 Report an issue or suggest a correction
      </button>
    </div>
  );
}

function StatBadge({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl py-2 px-1">
      <div className="text-lg">{icon}</div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold text-gray-800 text-sm">{value}</div>
    </div>
  );
}
