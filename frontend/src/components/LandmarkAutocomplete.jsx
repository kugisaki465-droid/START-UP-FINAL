import React, { useState, useEffect, useRef } from 'react';
import { searchLandmarks } from '../api/client.js';

export default function LandmarkAutocomplete({ value, onChange, placeholder, label, id }) {
  const [query, setQuery]         = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const debounceRef               = useRef(null);
  const containerRef              = useRef(null);

  // Sync external value
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // pass raw text up too

    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLandmarks(val);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function select(landmark) {
    setQuery(landmark.name);
    onChange(landmark.name);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="input-field"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
          Searching…
        </span>
      )}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto"
        >
          {suggestions.map(lm => (
            <li
              key={lm.id}
              role="option"
              onClick={() => select(lm)}
              className="px-4 py-2.5 cursor-pointer hover:bg-brand-50 text-sm flex items-center gap-2"
            >
              <span className="text-base">
                {lm.type === 'terminal' ? '🚉' : lm.type === 'market' ? '🏪' : lm.type === 'landmark' ? '📍' : '🔵'}
              </span>
              <div>
                <div className="font-medium">{lm.name}</div>
                {lm.barangay && <div className="text-xs text-gray-400">{lm.barangay}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
