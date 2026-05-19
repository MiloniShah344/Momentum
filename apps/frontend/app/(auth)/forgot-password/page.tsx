'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) {
        setError(error.message);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Check your inbox
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          If an account exists for{' '}
          <span className="text-gray-300 font-medium">{email}</span>, we sent a
          reset link. Check your spam folder too.
        </p>
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-2">
        Reset your password
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember it?{' '}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
