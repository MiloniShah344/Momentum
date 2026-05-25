'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const result = await api.post<{
        user: UserProfile;
        access_token: string;
        refresh_token: string;
      }>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        display_name: displayName.trim(),
      });

      if (result.access_token) {
        setTokens(result.access_token, result.refresh_token);
      }

      setUser(result.user);
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Signup failed. Please try again.',
      );
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
  const strengthColor =
    password.length < 4
      ? '#ef4444'
      : password.length < 7
        ? '#f97316'
        : password.length < 10
          ? '#f59e0b'
          : '#10b981';
  const strengthLabel =
    password.length < 4
      ? 'Weak'
      : password.length < 7
        ? 'Fair'
        : password.length < 10
          ? 'Good'
          : 'Strong';

  return (
    <div>
      <div className="mb-8">
        <h2
          className="text-[1.75rem] font-black mb-2 tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Create your account
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Start tracking your fitness — it&apos;s free
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Name */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--text-2)' }}
          >
            Your name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Alex Johnson"
            required
            autoComplete="name"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--text-2)' }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
              className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: 'var(--text-4)' }}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{
                    background:
                      password.length >= i * 3
                        ? strengthColor
                        : 'var(--bg-subtle)',
                  }}
                />
              ))}
              <span
                className="text-xs ml-1 font-semibold"
                style={{ color: strengthColor }}
              >
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--text-2)' }}
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all"
              style={{
                ...inputStyle,
                border:
                  confirmPassword && confirmPassword !== password
                    ? '1px solid rgba(239,68,68,0.6)'
                    : confirmPassword && confirmPassword === password
                      ? '1px solid rgba(16,185,129,0.6)'
                      : inputStyle.border,
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: 'var(--text-4)' }}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            {confirmPassword && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2">
                {confirmPassword === password ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </span>
            )}
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
              Creating account...
            </span>
          ) : (
            'Create free account'
          )}
        </button>
        <p className="text-center text-xs" style={{ color: 'var(--text-4)' }}>
          By signing up you agree to our Terms and Privacy Policy
        </p>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
