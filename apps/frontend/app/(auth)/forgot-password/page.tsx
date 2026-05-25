'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await api.post<{
        message: string;
        dev_reset_token?: string;
      }>('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      // Dev mode: backend returns the token directly so you can test
      // without a real email service. Redirect straight to reset page.
      if (result.dev_reset_token) {
        router.push(`/reset-password?token=${result.dev_reset_token}`);
        return;
      }

      // Production: token was emailed, show confirmation
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border-strong)',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid rgba(139,92,246,0.7)';
    e.target.style.boxShadow = '0 0 0 3px var(--bg-hover)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };

  // ── Submitted state ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-6">📬</div>
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
          Check your inbox
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          If an account exists for
        </p>
        <p className="text-white font-semibold text-sm mb-4">{email}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          we&apos;ve sent a password reset link. Check your spam folder too.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: 'var(--primary-3)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back to login
        </Link>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[1.75rem] font-black text-white mb-2 tracking-tight">
          Forgot your password?
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          No problem. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <span className="text-red-400 mt-0.5 flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <p className="text-red-400 text-sm leading-snug">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
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
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isLoading
              ? 'rgba(139,92,246,0.5)'
              : 'linear-gradient(135deg, var(--primary), var(--primary-2))',
            boxShadow: isLoading ? 'none' : '0 4px 24px var(--cta-shadow)',
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending reset link...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}
