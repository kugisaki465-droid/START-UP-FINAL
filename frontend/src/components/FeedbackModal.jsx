import React, { useState } from 'react';
import { submitFeedback } from '../api/client.js';

export default function FeedbackModal({ routeId, onClose }) {
  const [message, setMessage] = useState('');
  const [rating, setRating]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Please write at least 5 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitFeedback({ message: message.trim(), rating: rating || null, routeId });
      setSuccess(true);
    } catch {
      setError('Could not submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">📝 Send Feedback</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-2">
            <div className="text-4xl">🙏</div>
            <p className="font-semibold text-gray-800">Thank you for your feedback!</p>
            <p className="text-sm text-gray-500">Your input helps improve Transee.</p>
            <button onClick={onClose} className="btn-primary mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Rate this route (optional)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Your message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe the issue or suggestion (e.g. wrong stop order, missing route, fare change…)"
                className="input-field resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{message.length}/1000</p>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Sending…' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
