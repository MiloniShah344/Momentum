'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';

interface WorkoutSummary {
  id: string;
  title: string;
  date: string;
  status: string;
  workout_type: string;
  duration: number;
  exercise_count: number;
  total_sets: number;
  total_volume: number;
  notes: string;
}

// Unique color per workout based on ID hash
const WORKOUT_PALETTE = [
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#3b82f6',
  '#14b8a6',
  '#a855f7',
];

function getWorkoutColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return WORKOUT_PALETTE[Math.abs(hash) % WORKOUT_PALETTE.length];
}

function WorkoutCard({ workout }: { workout: WorkoutSummary }) {
  const color = getWorkoutColor(workout.id);
  const date = new Date(workout.date + 'T12:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    },
  );

  return (
    <Link
      href={
        workout.status === 'in_progress'
          ? `/workouts/new?id=${workout.id}`
          : `/workouts/${workout.id}`
      }
      className="block rounded-2xl overflow-hidden transition-all"
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
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm truncate"
              style={{ color: 'var(--text)' }}
            >
              {workout.title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              {date}
            </p>
          </div>
          {workout.status === 'in_progress' && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full ml-2 flex-shrink-0"
              style={{
                background: 'rgba(14,165,233,0.12)',
                color: 'var(--primary)',
                border: '1px solid rgba(14,165,233,0.25)',
              }}
            >
              Continue →
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${color}18`, color }}
          >
            {workout.workout_type.replace('_', ' ')}
          </span>
          {workout.duration > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              ⏱ {workout.duration}m
            </span>
          )}
          {workout.exercise_count > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              💪 {workout.exercise_count} exercises
            </span>
          )}
          {workout.total_volume > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              📊 {workout.total_volume.toLocaleString()} kg
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [inProgress, setInProgress] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWorkouts = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: '15',
          status: 'completed',
        });
        if (search) params.set('search', search);
        const r = await api.get<{
          workouts: WorkoutSummary[];
          total_pages: number;
        }>(`/workouts?${params}`);
        setWorkouts(p === 1 ? r.workouts : (prev) => [...prev, ...r.workouts]);
        setTotalPages(r.total_pages);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  // Fetch in-progress separately so they always show at top
  const fetchInProgress = useCallback(async () => {
    const r = await api
      .get<{
        workouts: WorkoutSummary[];
      }>('/workouts?status=in_progress&limit=5')
      .catch(() => ({ workouts: [] }));
    setInProgress(r.workouts);
  }, []);

  useEffect(() => {
    fetchWorkouts(1);
  }, [fetchWorkouts]);
  useEffect(() => {
    fetchInProgress();
  }, [fetchInProgress]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div
        className="sticky top-0 z-40 px-5 py-4"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-xl font-black"
                style={{ color: 'var(--text)' }}
              >
                Workouts
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                Your workout history
              </p>
            </div>
            <Link
              href="/workouts/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'var(--cta)' }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Log Workout
            </Link>
          </div>
          <div className="relative">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-4)"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workouts..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
        {/* In-progress workouts */}
        {inProgress.length > 0 && (
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--primary)' }}
            >
              ⚡ Continue where you left off
            </p>
            <div className="space-y-2">
              {inProgress.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
            <div
              className="mt-4 mb-2 h-px"
              style={{ background: 'var(--border)' }}
            />
          </div>
        )}

        {/* Completed workouts */}
        {loading && page === 1 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: 'var(--bg-card)' }}
              />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">💪</p>
            <p
              className="font-bold text-lg mb-2"
              style={{ color: 'var(--text)' }}
            >
              No workouts logged yet
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
              Log your first workout after your gym session
            </p>
            <Link
              href="/workouts/new"
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'var(--cta)' }}
            >
              Log first workout
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {workouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => fetchWorkouts(page + 1)}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
