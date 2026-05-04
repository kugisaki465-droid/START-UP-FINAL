import React, { useState } from 'react';
import LandmarkAutocomplete from './LandmarkAutocomplete.jsx';
import { findRoute } from '../api/client.js';

const PASSENGER_TYPES = [
  { value: 'regular', label: 'Regular' },
  { value: 'student', label: 'Student (20% off)' },
  { value: 'senior',  label: 'Senior (20% off)' },
  { value: 'pwd',     label: 'PWD (20% off)' },
];

export default function RouteFinder({ onRouteFound }) {
  const [origin, setOrigin]             = useState('');
  const [destination, setDestination]   = useState('');
  const [passengerType, setPassengerType] = useState('regular');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both origin and destination.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await findRoute(origin.trim(), destination.trim(), passengerType);
      if (result.error) {
        setError(result.error);
        onRouteFound(null);
      } else {
        onRouteFound(result);
      }
    } catch (err) {
      setError('Could not connect to server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
      <h2 className="font-bold text-lg text-gray-800">Where are you going?</h2>

      <div className="space-y-3">
        <LandmarkAutocomplete
          id="origin"
          label="From"
          value={origin}
          onChange={setOrigin}
          placeholder="e.g. Gaisano Mall, Agora, City Hall"
        />

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap}
            className="text-brand-500 hover:text-brand-700 text-xl p-1 rounded-full hover:bg-brand-50 transition-colors"
            aria-label="Swap origin and destination"
          >
            ⇅
          </button>
        </div>

        <LandmarkAutocomplete
          id="destination"
          label="To"
          value={destination}
          onChange={setDestination}
          placeholder="e.g. Robinsons, BMC, BCIT Terminal"
        />
      </div>

      {/* Passenger type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          Passenger Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PASSENGER_TYPES.map(pt => (
            <label
              key={pt.value}
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-colors
                ${passengerType === pt.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <input
                type="radio"
                name="passengerType"
                value={pt.value}
                checked={passengerType === pt.value}
                onChange={() => setPassengerType(pt.value)}
                className="accent-brand-500"
              />
              {pt.label}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full text-base">
        {loading ? '🔍 Finding routes…' : '🔍 Find Route'}
      </button>
    </form>
  );
}
