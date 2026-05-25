'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api, clearTokens } from '@/lib/api/client';
import ThemeToggle from '@/components/ui/ThemeToggle';

const SECTIONS = [
  {
    href: '/settings/profile',
    icon: '👤',
    label: 'Profile',
    desc: 'Name, height, weight, goals',
  },
  {
    href: '/settings/reminders',
    icon: '🔔',
    label: 'Reminders',
    desc: 'Workout and habit reminders',
  },
  {
    href: '/settings/account',
    icon: '🔐',
    label: 'Account',
    desc: 'Password and security',
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await api.post('/auth/logout').catch(() => {});
    clearTokens();
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-black"
              style={{ color: 'var(--text)' }}
            >
              Settings
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
              Manage your Momentum account
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Profile card */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black text-white"
            style={{ background: 'var(--cta)' }}
          >
            {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate" style={{ color: 'var(--text)' }}>
              {user?.display_name || 'Your name'}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-3)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Section links */}
        <div className="space-y-2 mb-8">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all group block"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--border-strong)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--border)')
              }
            >
              <span className="text-2xl flex-shrink-0">{section.icon}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm"
                  style={{ color: 'var(--text)' }}
                >
                  {section.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {section.desc}
                </p>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-4)"
                strokeWidth="2"
                className="flex-shrink-0"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-colors"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
            color: '#ef4444',
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
