import React, { useEffect, useState } from 'react';
import { getRoutes, getRouteDetails } from '../api/client.js';

export default function RouteDirectory() {
  const [routes, setRoutes]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    getRoutes()
      .then(setRoutes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(routeId) {
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
      return;
    }
    setDetailsLoading(true);
    try {
      const details = await getRouteDetails(routeId);
      setSelectedRoute(details);
    } catch {
      setSelectedRoute(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  if (loading) return <div className="card text-center text-gray-500">Loading routes…</div>;
  if (routes.length === 0) return <div className="card text-center text-gray-500">No routes available.</div>;

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-gray-800">All Routes</h2>
      {routes.map(r => (
        <div key={r.id} className="card space-y-2">
          <button
            onClick={() => handleSelect(r.id)}
            className="w-full text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: r.color || '#F59E0B' }}
              />
              <span className="font-semibold text-gray-800">[{r.code}] {r.name}</span>
            </div>
            <span className="text-xs text-gray-400 uppercase">{r.type}</span>
          </button>

          {selectedRoute?.id === r.id && (
            <div className="border-t border-gray-100 pt-2 space-y-2 text-sm">
              {detailsLoading ? (
                <p className="text-gray-400">Loading details…</p>
              ) : (
                <>
                  {selectedRoute.description && (
                    <p className="text-gray-600">{selectedRoute.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Base Fare: ₱{selectedRoute.base_fare?.toFixed(2) || '13.00'}</span>
                    <span>Per km: ₱{selectedRoute.per_km_rate?.toFixed(2) || '1.80'}</span>
                  </div>
                  {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Stops:</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                        {selectedRoute.stops.map(s => (
                          <li key={s.id}>{s.name}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
