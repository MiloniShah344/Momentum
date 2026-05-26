'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';

interface WorkoutDetail {
  id: string;
  title: string;
  date: string;
  status: string;
  workout_type: string;
  duration: number;
  notes: string;
  exercises: Array<{
    workout_exercise_id: string;
    exercise_id: string;
    exercise_name: string;
    muscle_group: string;
    order: number;
    sets: Array<{
      id: string;
      set_number: number;
      reps: number;
      weight: number;
      is_completed: boolean;
    }>;
  }>;
  summary: {
    total_volume: number;
    total_sets: number;
    total_exercises: number;
  };
}

const MG_COLOR: Record<string, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  legs: '#10b981',
  shoulders: '#f59e0b',
  biceps: '#8b5cf6',
  triceps: '#a855f7',
  core: '#06b6d4',
  cardio: '#f97316',
  full_body: '#ec4899',
};

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<WorkoutDetail>(`/workouts/${id}`)
      .then(setWorkout)
      .catch(() => router.push('/workouts'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleRepeat() {
    if (!workout) return;
    const newWorkout = await api.post<{ id: string }>('/workouts', {
      title: workout.title,
      workout_type: workout.workout_type,
    });
    for (const ex of workout.exercises) {
      await api.post(`/workouts/${newWorkout.id}/exercises`, {
        exercise_id: ex.exercise_id,
      });
    }
    router.push(`/workouts/new`);
  }

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      </main>
    );
  }
  if (!workout) return null;

  const date = new Date(workout.date + 'T12:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-5 py-4"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            style={{ color: 'var(--text-3)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </button>
          <h1
            className="flex-1 font-black text-base truncate"
            style={{ color: 'var(--text)' }}
          >
            {workout.title}
          </h1>
          {workout.status === 'completed' && (
            <button
              onClick={handleRepeat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--primary)',
                border: '1px solid var(--border)',
              }}
            >
              🔄 Repeat
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
        {/* Meta */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: 'var(--text)' }}
          >
            {date}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {workout.status === 'completed' && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: '#10b981',
                }}
              >
                ✓ Completed
              </span>
            )}
            {workout.workout_type && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-3)',
                }}
              >
                {workout.workout_type.replace('_', ' ')}
              </span>
            )}
            {workout.duration > 0 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-3)',
                }}
              >
                ⏱ {workout.duration} min
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Volume',
              value: `${workout.summary.total_volume.toLocaleString()}`,
              unit: 'kg',
            },
            {
              label: 'Sets',
              value: String(workout.summary.total_sets),
              unit: '',
            },
            {
              label: 'Exercises',
              value: String(workout.summary.total_exercises),
              unit: '',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="text-xl font-black"
                style={{ color: 'var(--primary)' }}
              >
                {s.value}
                <span className="text-sm ml-0.5">{s.unit}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Exercises */}
        {workout.exercises.map((exercise) => {
          const color = MG_COLOR[exercise.muscle_group] || 'var(--primary)';
          const completedSets = exercise.sets.filter((s) => s.is_completed);
          const volume = completedSets.reduce(
            (sum, s) => sum + Number(s.weight || 0) * Number(s.reps || 0),
            0,
          );
          return (
            <div
              key={exercise.workout_exercise_id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="h-0.5" style={{ background: color }} />
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="font-bold text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    {exercise.exercise_name}
                  </p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${color}18`, color }}
                  >
                    {exercise.muscle_group.replace('_', ' ')}
                  </span>
                </div>
                {volume > 0 && (
                  <p
                    className="text-xs mb-3"
                    style={{ color: 'var(--text-4)' }}
                  >
                    {completedSets.length} sets ·{' '}
                    {Math.round(volume).toLocaleString()} kg volume
                  </p>
                )}
                {/* Sets table */}
                <div className="space-y-1">
                  <div
                    className="flex gap-4 pb-1.5"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    {['Set', 'Reps', 'Weight', 'Status'].map((h) => (
                      <span
                        key={h}
                        className="flex-1 text-[10px] font-bold uppercase text-center"
                        style={{ color: 'var(--text-4)' }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {exercise.sets.map((set) => (
                    <div key={set.id} className="flex gap-4 py-1.5">
                      <span
                        className="flex-1 text-center text-sm font-medium"
                        style={{ color: 'var(--text-3)' }}
                      >
                        {set.set_number}
                      </span>
                      <span
                        className="flex-1 text-center text-sm font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        {set.reps || '—'}
                      </span>
                      <span
                        className="flex-1 text-center text-sm font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        {set.weight ? `${set.weight}kg` : '—'}
                      </span>
                      <span className="flex-1 text-center text-sm">
                        {set.is_completed ? (
                          <span style={{ color: '#10b981' }}>✓</span>
                        ) : (
                          <span style={{ color: 'var(--text-4)' }}>—</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {workout.notes && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Notes
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              {workout.notes}
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </main>
  );
}
