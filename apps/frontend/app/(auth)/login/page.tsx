'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, setTokens } from '@/lib/api/client';
import { useAuthStore, UserProfile } from '@/store/auth.store';

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const redirectTo = searchParams.get('redirect') || '/dashboard';
  const redirectTo =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') ||
        '/dashboard'
      : '/dashboard';
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await api.post<{
        user: UserProfile;
        access_token: string;
        refresh_token: string;
      }>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.access_token) {
        setTokens(result.access_token, result.refresh_token);
      }

      setUser(result.user);
      router.push(result.user.onboarding_complete ? redirectTo : '/onboarding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid var(--primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--bg-hover)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1px solid var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div>
      <div className="mb-8">
        <h2
          className="text-[1.75rem] font-black mb-2 tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Sign in to continue your momentum
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              className="flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--text-2)' }}
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
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold"
              style={{ color: 'var(--text-2)' }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors p-0.5"
              style={{ color: 'var(--text-4)' }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isLoading ? 'var(--primary-2)' : 'var(--cta)',
            boxShadow: isLoading ? 'none' : '0 4px 20px var(--cta-shadow)',
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
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-bold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
