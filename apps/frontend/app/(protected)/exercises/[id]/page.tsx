'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';

interface ExerciseDetail {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string;
  is_global: boolean;
  is_favorite: boolean;
  is_custom: boolean;
}

const MG_COLOR: Record<string, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  legs: '#10b981',
  shoulders: '#f59e0b',
  biceps: 'var(--primary)',
  triceps: '#a855f7',
  core: '#06b6d4',
  cardio: '#f97316',
  full_body: '#ec4899',
};
const DIFF_COLOR: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    api
      .get<ExerciseDetail>(`/exercises/${id}`)
      .then(setExercise)
      .catch(() => router.push('/exercises'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function toggleFavorite() {
    if (!exercise || togglingFav) return;
    setTogglingFav(true);
    setExercise((e) => (e ? { ...e, is_favorite: !e.is_favorite } : e));
    try {
      await api.post(`/exercises/${id}/favorite`);
    } catch {
      setExercise((e) => (e ? { ...e, is_favorite: !e.is_favorite } : e));
    } finally {
      setTogglingFav(false);
    }
  }

  const mgColor = exercise
    ? MG_COLOR[exercise.muscle_group] || 'var(--primary)'
    : 'var(--primary)';

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      </main>
    );
  }
  if (!exercise) return null;

  const instructionSteps =
    exercise.instructions
      ?.split(/\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10) || [];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Colored top bar */}
      <div className="h-1 w-full" style={{ background: mgColor }} />

      {/* Header */}
      <div
        className="sticky top-0 z-40 px-5 py-4"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-3)' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            {exercise.is_custom && (
              <Link
                href={`/exercises/${id}/edit`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-3)',
                  border: '1px solid var(--border)',
                }}
              >
                Edit
              </Link>
            )}
            <button
              onClick={toggleFavorite}
              disabled={togglingFav}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: exercise.is_favorite
                  ? 'rgba(239,68,68,0.12)'
                  : 'var(--bg-subtle)',
                color: exercise.is_favorite ? '#ef4444' : 'var(--text-3)',
                border: `1px solid ${exercise.is_favorite ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill={exercise.is_favorite ? '#ef4444' : 'none'}
                stroke={exercise.is_favorite ? '#ef4444' : 'currentColor'}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {exercise.is_favorite ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Title + badges */}
        <div>
          <h1
            className="text-2xl font-black mb-4"
            style={{ color: 'var(--text)' }}
          >
            {exercise.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
              style={{ background: `${mgColor}18`, color: mgColor }}
            >
              {exercise.muscle_group.replace('_', ' ')}
            </span>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--text-3)',
                border: '1px solid var(--border)',
              }}
            >
              {exercise.equipment.replace('_', ' ')}
            </span>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
              style={{
                background: `${DIFF_COLOR[exercise.difficulty]}14`,
                color: DIFF_COLOR[exercise.difficulty],
              }}
            >
              {exercise.difficulty}
            </span>
            {exercise.is_custom && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(14,165,233,0.12)',
                  color: 'var(--primary)',
                }}
              >
                Custom exercise
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {exercise.description && (
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
              About
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              {exercise.description}
            </p>
          </div>
        )}

        {/* Instructions */}
        {instructionSteps.length > 0 && (
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
              How to perform
            </p>
            <div className="space-y-3">
              {instructionSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white mt-0.5"
                    style={{ background: mgColor, minWidth: '1.5rem' }}
                  >
                    {i + 1}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {step.endsWith('.') ? step : `${step}.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to workout CTA */}
        <button
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all"
          style={{
            background: 'var(--cta)',
            boxShadow: '0 4px 24px var(--cta-shadow)',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add to workout
          </div>
          <p
            className="text-xs mt-1 font-normal"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Workout logging coming in Phase 7
          </p>
        </button>

        <div className="h-4" />
      </div>
    </main>
  );
}
