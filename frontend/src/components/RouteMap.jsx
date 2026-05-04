import React, { useEffect, useRef } from 'react';

/**
 * Leaflet map showing the route path.
 * Loaded lazily to avoid SSR issues and reduce initial bundle.
 */
export default function RouteMap({ route }) {
  const mapRef       = useRef(null);
  const instanceRef  = useRef(null);

  useEffect(() => {
    if (!route || !route.segments || route.segments.length === 0) return;

    // Dynamically import Leaflet to keep bundle lean
    import('leaflet').then(L => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      instanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const allCoords = [];

      route.segments.forEach(seg => {
        const coords = seg.stops.map(s => [s.latitude, s.longitude]);
        allCoords.push(...coords);

        // Draw polyline for this segment
        L.polyline(coords, {
          color: seg.color || '#F59E0B',
          weight: 5,
          opacity: 0.85,
        }).addTo(map);

        // Markers for each stop
        seg.stops.forEach((stop, idx) => {
          const isFirst = idx === 0;
          const isLast  = idx === seg.stops.length - 1;

          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width:${isFirst || isLast ? 14 : 10}px;
              height:${isFirst || isLast ? 14 : 10}px;
              background:${isFirst || isLast ? seg.color || '#F59E0B' : '#fff'};
              border:2px solid ${seg.color || '#F59E0B'};
              border-radius:50%;
              box-shadow:0 1px 3px rgba(0,0,0,.3);
            "></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          L.marker([stop.latitude, stop.longitude], { icon })
            .bindPopup(`<b>${stop.name}</b>`)
            .addTo(map);
        });
      });

      // Origin marker
      const origin = route.segments[0].from;
      L.marker([origin.latitude, origin.longitude], {
        icon: L.divIcon({
          className: '',
          html: '<div style="font-size:22px;line-height:1">📍</div>',
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        }),
      }).bindPopup(`<b>Start: ${origin.name}</b>`).addTo(map);

      // Destination marker
      const dest = route.segments[route.segments.length - 1].to;
      L.marker([dest.latitude, dest.longitude], {
        icon: L.divIcon({
          className: '',
          html: '<div style="font-size:22px;line-height:1">🏁</div>',
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        }),
      }).bindPopup(`<b>End: ${dest.name}</b>`).addTo(map);

      // Fit bounds
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [20, 20] });
      }
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [route]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}
