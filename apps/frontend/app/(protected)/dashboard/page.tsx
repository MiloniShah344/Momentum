'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

// ── Types ─────────────────────────────────────────────────────────────

interface HabitItem {
  id: string;
  name: string;
  type: string;
  is_completed: boolean;
}

interface DashboardData {
  user: { display_name: string | null; fitness_goal: string | null };
  streak: { current: number; best: number };
  weekly: { completed: number; target: number; consistency_pct: number };
  today: { workout_done: boolean; date: string };
  habits: HabitItem[];
  weight: {
    latest: number;
    unit: string;
    trend: 'up' | 'down' | 'neutral' | null;
    change: number | null;
  } | null;
  quote: { text: string; author: string };
  recent_achievement: { title: string; unlocked_at: string } | null;
}

// ── Skeleton loader ────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>

      {/* Date */}
      <Skeleton className="h-4 w-40 mb-4" />

      {/* Streak + Weekly grid */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      {/* CTA */}
      <Skeleton className="h-16" />

      {/* Habits */}
      <Skeleton className="h-48" />

      {/* Weight */}
      <Skeleton className="h-24" />

      {/* Quote */}
      <Skeleton className="h-24" />
    </div>
  );
}

// ── Helper functions ───────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getHabitIcon(type: string): string {
  const icons: Record<string, string> = {
    water: '💧',
    protein: '🥩',
    sleep: '😴',
    stretching: '🧘',
    meditation: '🧠',
    steps: '👟',
    custom: '⭐',
  };
  return icons[type] || '⭐';
}

// ── Widget components ──────────────────────────────────────────────────

function StreakCard({ current, best }: { current: number; best: number }) {
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col justify-between relative overflow-hidden"
      style={{
        background:
          current > 0
            ? 'linear-gradient(135deg, rgba(234,88,12,0.2) 0%, rgba(220,38,38,0.15) 100%)'
            : 'rgba(255,255,255,0.03)',
        border:
          current > 0
            ? '1px solid rgba(234,88,12,0.3)'
            : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Background fire glow */}
      {current > 0 && (
        <div className="absolute -top-6 -right-6 text-6xl opacity-10 pointer-events-none">
          🔥
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-lg">{current > 0 ? '🔥' : '💤'}</span>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: current > 0 ? '#fb923c' : '#4b5563' }}
          >
            Streak
          </span>
        </div>
        <p
          className="text-5xl font-black leading-none"
          style={{ color: current > 0 ? '#fb923c' : '#1f2937' }}
        >
          {current}
        </p>
        <p
          className="text-xs mt-1.5"
          style={{ color: current > 0 ? '#fdba74' : '#4b5563' }}
        >
          {current === 1
            ? 'day streak'
            : current === 0
              ? 'no streak yet'
              : 'days strong'}
        </p>
      </div>

      {best > 0 && (
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Best: <span style={{ color: '#9ca3af' }}>{best} days</span>
        </p>
      )}
    </div>
  );
}

function WeeklyCard({
  completed,
  target,
  pct,
  workoutDone,
}: {
  completed: number;
  target: number;
  pct: number;
  workoutDone: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col justify-between"
      style={{
        background: 'rgba(139,92,246,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-lg">📅</span>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#a78bfa' }}
          >
            This week
          </span>
        </div>

        <div className="flex items-end gap-1 mb-3">
          <span className="text-4xl font-black text-white leading-none">
            {completed}
          </span>
          <span
            className="text-xl font-bold mb-0.5"
            style={{ color: '#6b7280' }}
          >
            /{target}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 rounded-full overflow-hidden mb-1.5"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
            }}
          />
        </div>
        <p className="text-xs" style={{ color: '#7c3aed' }}>
          {pct}% consistency
        </p>
      </div>

      <p className="text-xs" style={{ color: '#4b5563' }}>
        {workoutDone
          ? '✅ Done today'
          : target - completed > 0
            ? `${target - completed} more this week`
            : 'Target reached! 🎉'}
      </p>
    </div>
  );
}

function StartWorkoutButton({ workoutDone }: { workoutDone: boolean }) {
  return (
    <Link
      href="/workouts/new"
      className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
      style={{
        background: workoutDone
          ? 'rgba(34,197,94,0.1)'
          : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        border: workoutDone ? '1px solid rgba(34,197,94,0.3)' : 'none',
        boxShadow: workoutDone ? 'none' : '0 8px 32px rgba(139,92,246,0.35)',
      }}
    >
      {workoutDone ? (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span style={{ color: '#22c55e' }}>Workout done today!</span>
        </>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
          >
            <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3" />
          </svg>
          <span>Start today&apos;s workout</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </>
      )}
    </Link>
  );
}

function HabitsCard({
  habits,
  onToggle,
}: {
  habits: HabitItem[];
  onToggle: (id: string) => void;
}) {
  const completed = habits.filter((h) => h.is_completed).length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-white font-bold text-sm">
            Today&apos;s Habits
          </span>
        </div>
        {habits.length > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{
              background:
                completed === habits.length
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(139,92,246,0.15)',
              color: completed === habits.length ? '#22c55e' : '#a78bfa',
            }}
          >
            {completed}/{habits.length}
          </span>
        )}
      </div>

      {/* Habits list */}
      {habits.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-400 text-sm font-medium">
            No habits set up yet
          </p>
          <p className="text-gray-600 text-xs mt-1 mb-4">
            Add habits to track your daily consistency
          </p>
          <Link
            href="/settings/profile"
            className="inline-block text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
          >
            Go to settings
          </Link>
        </div>
      ) : (
        <div>
          {habits.map((habit, index) => (
            <button
              key={habit.id}
              type="button"
              onClick={() => onToggle(habit.id)}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all active:bg-white/[0.02]"
              style={{
                borderTop:
                  index > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {/* Custom checkbox */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: habit.is_completed
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                    : 'transparent',
                  border: habit.is_completed
                    ? 'none'
                    : '1.5px solid rgba(255,255,255,0.18)',
                }}
              >
                {habit.is_completed && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Icon + name */}
              <span className="text-base flex-shrink-0">
                {getHabitIcon(habit.type)}
              </span>
              <span
                className="flex-1 text-sm font-medium transition-all"
                style={{
                  color: habit.is_completed ? '#6b7280' : '#e5e7eb',
                  textDecoration: habit.is_completed ? 'line-through' : 'none',
                }}
              >
                {habit.name}
              </span>

              {/* Status badge */}
              {habit.is_completed && (
                <span
                  className="text-xs font-medium flex-shrink-0"
                  style={{ color: '#22c55e' }}
                >
                  Done ✓
                </span>
              )}
            </button>
          ))}

          {/* All done banner */}
          {completed === habits.length && habits.length > 0 && (
            <div
              className="mx-5 mb-4 mt-2 rounded-xl py-2.5 text-center text-sm font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
            >
              🎉 All habits done for today!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WeightCard({
  weight,
}: {
  weight: {
    latest: number;
    unit: string;
    trend: 'up' | 'down' | 'neutral' | null;
    change: number | null;
  } | null;
}) {
  if (!weight) {
    return (
      <div
        className="rounded-2xl px-5 py-5 flex items-center gap-4"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <span className="text-3xl">⚖️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Weight tracking</p>
          <p className="text-xs text-gray-500 mt-0.5">No weight logged yet</p>
        </div>
        <Link
          href="/weight"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
        >
          Log now
        </Link>
      </div>
    );
  }

  const TrendIcon = () => {
    if (weight.trend === 'up')
      return (
        <span style={{ color: weight.trend === 'up' ? '#f87171' : '#22c55e' }}>
          ↑
        </span>
      );
    if (weight.trend === 'down')
      return <span style={{ color: '#22c55e' }}>↓</span>;
    return <span style={{ color: '#6b7280' }}>→</span>;
  };

  return (
    <Link
      href="/weight"
      className="rounded-2xl px-5 py-5 flex items-center gap-4 transition-all active:scale-[0.99] block"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span className="text-3xl">⚖️</span>
      <div className="flex-1">
        <p
          className="text-xs font-medium uppercase tracking-wide mb-1"
          style={{ color: '#4b5563' }}
        >
          Current weight
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">
            {weight.latest}
          </span>
          <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
            {weight.unit}
          </span>
          {weight.trend && (
            <span className="text-base font-bold">
              <TrendIcon />
            </span>
          )}
        </div>
        {weight.trend && weight.change !== null && (
          <p
            className="text-xs mt-0.5"
            style={{
              color:
                weight.trend === 'up'
                  ? '#f87171'
                  : weight.trend === 'down'
                    ? '#22c55e'
                    : '#6b7280',
            }}
          >
            {weight.trend === 'up' ? '+' : weight.trend === 'down' ? '-' : ''}
            {weight.change} {weight.unit} from last week
          </p>
        )}
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

function QuoteCard({ quote }: { quote: { text: string; author: string } }) {
  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="rgba(139,92,246,0.4)"
        className="mb-3"
      >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
      <p className="text-gray-300 text-sm leading-relaxed italic mb-3">
        {quote.text}
      </p>
      <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>
        — {quote.author}
      </p>
    </div>
  );
}

function RecentAchievementBanner({
  achievement,
}: {
  achievement: { title: string; unlocked_at: string };
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-5 py-4"
      style={{
        background: 'rgba(234,179,8,0.08)',
        border: '1px solid rgba(234,179,8,0.2)',
      }}
    >
      <span className="text-2xl">🏆</span>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-0.5"
          style={{ color: '#eab308' }}
        >
          Achievement unlocked!
        </p>
        <p className="text-white font-bold text-sm">{achievement.title}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, isInitialized } = useAuthStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const result = await api.get<DashboardData>('/dashboard');
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Redirect to onboarding if needed
    if (isInitialized && authUser && !authUser.onboarding_complete) {
      router.replace('/onboarding');
      return;
    }
    fetchDashboard();
  }, [isInitialized, authUser, router, fetchDashboard]);

  // Habit toggle with optimistic update
  async function handleHabitToggle(habitId: string) {
    if (!data) return;

    // Optimistically update UI immediately
    setData((prev) =>
      prev
        ? {
            ...prev,
            habits: prev.habits.map((h) =>
              h.id === habitId ? { ...h, is_completed: !h.is_completed } : h,
            ),
          }
        : prev,
    );

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/habit-logs/toggle', { habit_id: habitId, date: today });
    } catch {
      // Revert on failure
      setData((prev) =>
        prev
          ? {
              ...prev,
              habits: prev.habits.map((h) =>
                h.id === habitId ? { ...h, is_completed: !h.is_completed } : h,
              ),
            }
          : prev,
      );
    }
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#080812]">
        <DashboardSkeleton />
      </main>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <main className="min-h-screen bg-[#080812] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-white font-bold mb-2">Something went wrong</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const greeting = getGreeting();
  const displayName =
    data.user.display_name || authUser?.email?.split('@')[0] || 'there';

  return (
    <main className="min-h-screen bg-[#080812]">
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-40 px-5 pt-safe"
        style={{ background: 'rgba(8,8,18,0.9)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-white font-bold text-base">Momentum</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="1.8"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-xl font-black text-sm text-white"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              {displayName[0].toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="px-5 py-5 space-y-4">
        {/* Welcome section */}
        <div className="mb-2">
          <p className="text-gray-400 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-black text-white mt-0.5 capitalize">
            {displayName} 👋
          </h1>
          <p className="text-gray-600 text-xs mt-1">
            {formatDate(data.today.date)}
          </p>
        </div>

        {/* Recent achievement (if any) */}
        {data.recent_achievement && (
          <RecentAchievementBanner achievement={data.recent_achievement} />
        )}

        {/* Streak + Weekly grid */}
        <div className="grid grid-cols-2 gap-3">
          <StreakCard current={data.streak.current} best={data.streak.best} />
          <WeeklyCard
            completed={data.weekly.completed}
            target={data.weekly.target}
            pct={data.weekly.consistency_pct}
            workoutDone={data.today.workout_done}
          />
        </div>

        {/* Start workout CTA */}
        <StartWorkoutButton workoutDone={data.today.workout_done} />

        {/* Habits */}
        <HabitsCard habits={data.habits} onToggle={handleHabitToggle} />

        {/* Weight */}
        <WeightCard weight={data.weight} />

        {/* Motivational quote */}
        <QuoteCard quote={data.quote} />

        {/* Goal reminder (if fitness goal set) */}
        {data.user.fitness_goal && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="text-2xl">
              {data.user.fitness_goal === 'lose_weight'
                ? '🔥'
                : data.user.fitness_goal === 'build_muscle'
                  ? '💪'
                  : data.user.fitness_goal === 'maintain'
                    ? '⚖️'
                    : '🏃'}
            </span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">
                Your goal
              </p>
              <p className="text-white text-sm font-semibold capitalize">
                {data.user.fitness_goal.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>
    </main>
  );
}
