'use client';

import { useAuthStore } from '@/store/auth.store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">💪 Momentum</h1>
            <p className="text-gray-400 text-sm mt-0.5">Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-gray-800 hover:border-gray-700"
          >
            Sign out
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            Welcome back! 👋
          </h2>
          <p className="text-gray-400 text-sm">
            Logged in as <span className="text-gray-200">{user?.email}</span>
          </p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">🔥 0</p>
            <p className="text-gray-500 text-xs mt-1">Day streak</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">0/5</p>
            <p className="text-gray-500 text-xs mt-1">This week</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">0</p>
            <p className="text-gray-500 text-xs mt-1">Total workouts</p>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-medium">
            ✅ Phase 3 complete
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Auth is working. Dashboard content coming in Phase 5.
          </p>
        </div>
      </div>
    </main>
  );
}
