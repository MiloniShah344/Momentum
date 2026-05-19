'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user arrived here via a valid reset link
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsValidSession(!!session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isValidSession) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">⛔</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Invalid or expired link
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Password updated
        </h2>
        <p className="text-gray-400 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-2">
        Set new password
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
