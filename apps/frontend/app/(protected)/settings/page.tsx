'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

const settingsSections = [
  {
    href: '/settings/profile',
    icon: '👤',
    label: 'Profile',
    description: 'Name, height, weight, goals',
  },
  {
    href: '/settings/reminders',
    icon: '🔔',
    label: 'Reminders',
    description: 'Workout and habit reminders',
  },
  {
    href: '/settings/account',
    icon: '🔐',
    label: 'Account',
    description: 'Password, security, sessions',
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await api.post('/auth/logout');
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#080812] p-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your Momentum account</p>
        </div>

        {/* Profile summary */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold truncate">
              {user?.display_name || 'Your name'}
            </p>
            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
          </div>
        </div>

        {/* Section links */}
        <div className="space-y-2 mb-8">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-2xl flex-shrink-0">{section.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">
                  {section.label}
                </p>
                <p className="text-gray-500 text-xs">{section.description}</p>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4b5563"
                strokeWidth="2"
                className="flex-shrink-0 group-hover:stroke-gray-300 transition-colors"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-colors"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: '#f87171',
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
