import React from 'react';

export default function Header() {
  return (
    <header className="bg-brand-500 text-white shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label="bus">🚌</span>
        <div>
          <h1 className="text-xl font-bold leading-tight">SakaySmart Butuan</h1>
          <p className="text-brand-100 text-xs">Smart commuting guide for Butuan City</p>
        </div>
      </div>
    </header>
  );
}
