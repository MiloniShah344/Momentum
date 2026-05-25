'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import ThemeToggle from '@/components/ui/ThemeToggle';

// ── Types ────────────────────────────────────────────────────────────
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
  activity_dates: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function getGreetingEmoji() {
  const h = new Date().getHours();
  return h < 12 ? '☀️' : h < 17 ? '⚡' : '🌙';
}
function formatDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
const HABIT_ICONS: Record<string, string> = {
  water: '💧',
  protein: '🥩',
  sleep: '😴',
  stretching: '🧘',
  meditation: '🧠',
  steps: '👟',
  custom: '⭐',
};
const GOAL_META: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  lose_weight: { icon: '🔥', label: 'Lose weight', color: '#ef4444' },
  build_muscle: { icon: '💪', label: 'Build muscle', color: '#0ea5e9' },
  maintain: { icon: '⚖️', label: 'Maintain fitness', color: '#10b981' },
  improve_endurance: {
    icon: '🏃',
    label: 'Improve endurance',
    color: '#f59e0b',
  },
};

// ── Skeleton ─────────────────────────────────────────────────────────
function Sk({
  h = 'h-8',
  w = 'w-full',
  round = 'rounded-xl',
}: {
  h?: string;
  w?: string;
  round?: string;
}) {
  return (
    <div
      className={`${h} ${w} ${round} animate-pulse`}
      style={{ background: 'var(--bg-subtle)' }}
    />
  );
}
function DashboardSkeleton() {
  return (
    <div className="p-5 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Sk h="h-4" w="w-32" />
          <Sk h="h-7" w="w-48" />
        </div>
        <Sk h="h-9" w="w-9" round="rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Sk h="h-16" />
        <Sk h="h-16" />
        <Sk h="h-16" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Sk h="h-16" />
          <Sk h="h-48" />
          <Sk h="h-32" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Sk h="h-44" />
          <Sk h="h-40" />
        </div>
      </div>
    </div>
  );
}

// ── Circular Progress Ring ────────────────────────────────────────────
function Ring({
  value,
  max,
  size = 130,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const r = (size - 18) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth="10"
        style={{ stroke: 'var(--bg-subtle)' }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth="10"
        stroke="url(#ring-grad)"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Activity Heatmap ──────────────────────────────────────────────────
function ActivityHeatmap({ activeDates }: { activeDates: string[] }) {
  const activeSet = new Set(activeDates);
  const days: { date: string; label: string }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
    });
  }
  const rows: (typeof days)[] = [[], [], [], []];
  days.forEach((d, i) => rows[Math.floor(i / 7)].push(d));

  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--text-3)' }}
      >
        Last 28 days
      </p>
      <div className="space-y-1.5">
        {rows.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((day) => {
              const active = activeSet.has(day.date);
              return (
                <div
                  key={day.date}
                  title={day.date}
                  className="flex-1 h-6 rounded-md transition-all"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg,#0ea5e9,#06b6d4)'
                      : 'var(--bg-subtle)',
                    border: active ? 'none' : '1px solid var(--border)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-4)' }}>
            Rest
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-4)' }}>
            Workout
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, isInitialized } = useAuthStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const r = await api.get<DashboardData>('/dashboard');
      setData(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && authUser && !authUser.onboarding_complete) {
      router.replace('/onboarding');
      return;
    }
    fetchDashboard();
  }, [isInitialized, authUser, router, fetchDashboard]);

  async function toggleHabit(habitId: string) {
    if (!data) return;
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
      await api.post('/habit-logs/toggle', {
        habit_id: habitId,
        date: new Date().toISOString().split('T')[0],
      });
    } catch {
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

  if (loading)
    return (
      <main style={{ background: 'var(--bg)' }} className="min-h-screen">
        <DashboardSkeleton />
      </main>
    );
  if (error || !data)
    return (
      <main
        style={{ background: 'var(--bg)' }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="font-bold mb-2" style={{ color: 'var(--text)' }}>
            Something went wrong
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
            {error}
          </p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--cta)' }}
          >
            Try again
          </button>
        </div>
      </main>
    );

  const name =
    data.user.display_name || authUser?.email?.split('@')[0] || 'there';
  const habitsCompleted = data.habits.filter((h) => h.is_completed).length;
  const allHabitsDone =
    data.habits.length > 0 && habitsCompleted === data.habits.length;
  const goalMeta = data.user.fitness_goal
    ? GOAL_META[data.user.fitness_goal]
    : null;

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 px-5 py-3"
        style={{
          background: 'rgba(var(--cta),0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--cta)' }}
            >
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span
              className="font-bold text-base"
              style={{ color: 'var(--text)' }}
            >
              Momentum
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/notifications"
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-3)"
                strokeWidth="1.8"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black text-white"
              style={{ background: 'var(--cta)' }}
            >
              {name[0].toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* ── Welcome ── */}
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-3)' }}
            >
              {getGreeting()} {getGreetingEmoji()}
            </p>
            <h1
              className="text-2xl font-black mt-0.5 capitalize"
              style={{ color: 'var(--text)' }}
            >
              {name}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
              {formatDate(data.today.date)}
            </p>
          </div>
          {data.today.workout_done && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done today
            </div>
          )}
        </div>

        {/* ── Quick stats bar ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: '🔥',
              value: data.streak.current,
              label: 'Day streak',
              color: 'var(--streak)',
            },
            {
              icon: '💪',
              value: data.weekly.completed,
              label: `of ${data.weekly.target} this week`,
              color: 'var(--primary)',
            },
            {
              icon: '🎯',
              value: `${habitsCompleted}/${data.habits.length}`,
              label: 'Habits today',
              color: 'var(--success)',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-3 py-3.5 text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-xl mb-0.5">{s.icon}</p>
              <p
                className="text-xl font-black leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p
                className="text-[10px] mt-1 font-medium leading-tight"
                style={{ color: 'var(--text-4)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Achievement banner ── */}
        {data.recent_achievement && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--accent)' }}
              >
                Achievement unlocked!
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {data.recent_achievement.title}
              </p>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left col */}
          <div className="lg:col-span-3 space-y-4">
            {/* Start Workout CTA */}
            <Link
              href="/workouts/new"
              className="flex items-center justify-between w-full px-6 py-5 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] group"
              style={{
                background: data.today.workout_done
                  ? 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.08))'
                  : 'var(--cta)',
                border: data.today.workout_done
                  ? '1px solid rgba(16,185,129,0.3)'
                  : 'none',
                boxShadow: data.today.workout_done
                  ? 'none'
                  : '0 8px 32px var(--cta-shadow)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {data.today.workout_done ? '✅' : '💪'}
                </span>
                <div className="text-left">
                  <p
                    className="font-black text-base leading-none"
                    style={{
                      color: data.today.workout_done ? '#10b981' : 'white',
                    }}
                  >
                    {data.today.workout_done
                      ? 'Workout complete!'
                      : "Start today's workout"}
                  </p>
                  <p
                    className="text-xs mt-1 font-medium"
                    style={{
                      color: data.today.workout_done
                        ? 'rgba(16,185,129,0.7)'
                        : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {data.today.workout_done
                      ? 'Great work — rest up 💪'
                      : 'Track sets, reps, and weight'}
                  </p>
                </div>
              </div>
              {!data.today.workout_done && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2.5"
                  className="flex-shrink-0 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </Link>

            {/* Habits widget */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    Today&apos;s Habits
                  </span>
                </div>
                {data.habits.length > 0 && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: allHabitsDone
                        ? 'rgba(16,185,129,0.12)'
                        : 'var(--bg-subtle)',
                      color: allHabitsDone ? '#10b981' : 'var(--primary)',
                      border: `1px solid ${allHabitsDone ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                    }}
                  >
                    {habitsCompleted}/{data.habits.length}
                  </span>
                )}
              </div>

              {data.habits.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-4xl mb-3">🌱</p>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-2)' }}
                  >
                    No habits set up yet
                  </p>
                  <p
                    className="text-xs mt-1 mb-4"
                    style={{ color: 'var(--text-4)' }}
                  >
                    Add habits during onboarding or in settings
                  </p>
                  <Link
                    href="/settings/profile"
                    className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: 'var(--cta)' }}
                  >
                    Set up habits
                  </Link>
                </div>
              ) : (
                <div>
                  {data.habits.map((habit, i) => (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => toggleHabit(habit.id)}
                      className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left transition-all"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-hover)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      {/* Checkbox */}
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: habit.is_completed
                            ? 'var(--cta)'
                            : 'transparent',
                          border: habit.is_completed
                            ? 'none'
                            : '1.5px solid var(--border-strong)',
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
                      <span className="text-base">
                        {HABIT_ICONS[habit.type] || '⭐'}
                      </span>
                      <span
                        className="flex-1 text-sm font-medium transition-all"
                        style={{
                          color: habit.is_completed
                            ? 'var(--text-4)'
                            : 'var(--text)',
                          textDecoration: habit.is_completed
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {habit.name}
                      </span>
                      {habit.is_completed && (
                        <span
                          className="text-xs font-semibold flex-shrink-0"
                          style={{ color: 'var(--success)' }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                  {allHabitsDone && (
                    <div
                      className="mx-5 mb-4 mt-2 rounded-xl py-2.5 text-center text-sm font-bold"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                      }}
                    >
                      🎉 All habits crushed today!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weight + Quote row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weight card */}
              {data.weight ? (
                <Link
                  href="/weight"
                  className="rounded-2xl p-5 transition-all block"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">⚖️</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: 'var(--text-3)' }}
                    >
                      Weight
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-3xl font-black"
                      style={{ color: 'var(--text)' }}
                    >
                      {data.weight.latest}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {data.weight.unit}
                    </span>
                    {data.weight.trend && (
                      <span
                        className="text-lg font-bold"
                        style={{
                          color:
                            data.weight.trend === 'up'
                              ? '#ef4444'
                              : data.weight.trend === 'down'
                                ? '#10b981'
                                : 'var(--text-4)',
                        }}
                      >
                        {data.weight.trend === 'up'
                          ? '↑'
                          : data.weight.trend === 'down'
                            ? '↓'
                            : '→'}
                      </span>
                    )}
                  </div>
                  {data.weight.change !== null && data.weight.trend && (
                    <p
                      className="text-xs mt-1.5"
                      style={{
                        color:
                          data.weight.trend === 'up'
                            ? '#ef4444'
                            : data.weight.trend === 'down'
                              ? '#10b981'
                              : 'var(--text-4)',
                      }}
                    >
                      {data.weight.trend === 'up'
                        ? '+'
                        : data.weight.trend === 'down'
                          ? '-'
                          : ''}
                      {data.weight.change} {data.weight.unit} this week
                    </p>
                  )}
                </Link>
              ) : (
                <Link
                  href="/weight"
                  className="rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px dashed var(--border-strong)`,
                  }}
                >
                  <span className="text-2xl">⚖️</span>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-3)' }}
                  >
                    Log your weight
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                    Track your progress
                  </p>
                </Link>
              )}

              {/* Goal card */}
              {goalMeta && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: 'var(--text-3)' }}
                    >
                      Your goal
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: `${goalMeta.color}18`,
                        border: `1px solid ${goalMeta.color}30`,
                      }}
                    >
                      {goalMeta.icon}
                    </div>
                    <div>
                      <p
                        className="text-base font-black"
                        style={{ color: 'var(--text)' }}
                      >
                        {goalMeta.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--text-4)' }}
                      >
                        {data.weekly.completed}/{data.weekly.target} workouts
                        this week
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-4">
            {/* Streak card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background:
                  data.streak.current > 0
                    ? 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(234,88,12,0.06))'
                    : 'var(--bg-card)',
                border:
                  data.streak.current > 0
                    ? '1px solid rgba(249,115,22,0.25)'
                    : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color:
                      data.streak.current > 0 ? '#f97316' : 'var(--text-3)',
                  }}
                >
                  Streak
                </span>
                {data.streak.best > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(249,115,22,0.1)',
                      color: '#f97316',
                    }}
                  >
                    Best: {data.streak.best}d
                  </span>
                )}
              </div>
              <div className="flex items-end gap-3">
                <span
                  className="text-6xl leading-none"
                  style={{
                    filter:
                      data.streak.current > 0
                        ? 'none'
                        : 'grayscale(1) opacity(0.3)',
                  }}
                >
                  🔥
                </span>
                <div>
                  <p
                    className="text-5xl font-black leading-none"
                    style={{
                      color:
                        data.streak.current > 0 ? '#f97316' : 'var(--text-4)',
                    }}
                  >
                    {data.streak.current}
                  </p>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{
                      color:
                        data.streak.current > 0 ? '#f97316' : 'var(--text-4)',
                    }}
                  >
                    {data.streak.current === 0
                      ? 'Log a workout!'
                      : data.streak.current === 1
                        ? 'day streak'
                        : 'days strong'}
                  </p>
                </div>
              </div>
              {data.streak.current > 0 && (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid rgba(249,115,22,0.15)' }}
                >
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'rgba(249,115,22,0.7)' }}
                  >
                    {data.streak.current >= 7
                      ? '🌟 On fire! Keep it up!'
                      : `${7 - data.streak.current} more days to hit a week streak`}
                  </p>
                </div>
              )}
            </div>

            {/* Weekly progress ring */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-4"
                style={{ color: 'var(--text-3)' }}
              >
                Weekly target
              </p>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <Ring
                    value={data.weekly.completed}
                    max={data.weekly.target}
                    size={110}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-black"
                      style={{ color: 'var(--text)' }}
                    >
                      {data.weekly.completed}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-4)' }}
                    >
                      /{data.weekly.target}
                    </span>
                  </div>
                </div>
                <div>
                  <p
                    className="text-3xl font-black"
                    style={{ color: 'var(--primary)' }}
                  >
                    {data.weekly.consistency_pct}%
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-2)' }}
                  >
                    Consistency
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{ color: 'var(--text-4)' }}
                  >
                    {data.weekly.target - data.weekly.completed > 0
                      ? `${data.weekly.target - data.weekly.completed} more this week`
                      : '🎉 Target reached!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity heatmap */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <ActivityHeatmap activeDates={data.activity_dates || []} />
            </div>
          </div>
        </div>

        {/* ── Full-width quote ── */}
        <div
          className="rounded-2xl px-6 py-5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="var(--primary)"
            className="mb-3 opacity-40"
          >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </svg>
          <p
            className="text-sm leading-relaxed italic mb-3"
            style={{ color: 'var(--text-2)' }}
          >
            {data.quote.text}
          </p>
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--text-4)' }}
          >
            — {data.quote.author}
          </p>
        </div>

        <div className="h-2" />
      </div>
    </main>
  );
}
