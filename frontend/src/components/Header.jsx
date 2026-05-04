import React, { useState } from 'react';

export default function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="bus">🚌</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">SakaySmart Butuan</h1>
            <p className="text-orange-100 text-xs">Smart commuting guide</p>
          </div>
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 rounded-xl px-3 py-2 transition-colors"
            >
              <div className="w-7 h-7 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-sm">
                {user.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-24 truncate">
                {user.full_name}
              </span>
              <span className="text-xs">{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.full_name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
