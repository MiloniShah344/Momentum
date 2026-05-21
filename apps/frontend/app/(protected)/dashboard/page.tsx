'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api/client';

export default function DashboardPage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  // Redirect to onboarding if profile isn't complete yet
  useEffect(() => {
    if (isInitialized && user && !user.onboarding_complete) {
      router.replace('/onboarding');
    }
  }, [user, isInitialized, router]);

  async function handleLogout() {
    await api.post('/auth/logout');
    router.push('/login');
    router.refresh();
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <svg
          className="animate-spin"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="white"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080812] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              <span className="text-white font-black">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                Momentum
              </h1>
              <p className="text-gray-500 text-xs">Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Sign out
          </button>
        </div>

        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-1">
            Welcome back, {user.display_name || user.email.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-400 text-sm">
            {user.fitness_goal
              ? `Goal: ${user.fitness_goal.replace(/_/g, ' ')}`
              : 'Ready to crush your workout?'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Day streak', value: '🔥 0', color: '#f97316' },
            {
              label: 'This week',
              value: `0/${user.workout_frequency_goal}`,
              color: '#6366f1',
            },
            { label: 'Total workouts', value: '0', color: '#22c55e' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="text-xl font-black mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
          }}
        >
          <p className="text-green-400 text-sm font-semibold">
            ✅ Phase 4 complete
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Onboarding done. Full dashboard coming in Phase 5.
          </p>
        </div>
      </div>
    </main>
  );
}
