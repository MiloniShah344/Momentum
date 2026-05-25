'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  description: string;
  is_global: boolean;
  is_favorite: boolean;
  is_custom: boolean;
}
interface ExercisesResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  total_pages: number;
  has_next: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────
const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'cardio',
  'full_body',
];
const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'resistance_band',
  'cardio_machine',
  'other',
];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

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

// ── Exercise Card ─────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onFavoriteToggle,
}: {
  exercise: Exercise;
  onFavoriteToggle: (id: string) => void;
}) {
  const mgColor = MG_COLOR[exercise.muscle_group] || 'var(--primary)';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all group relative"
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
      {/* Color top bar */}
      <div className="h-1 w-full" style={{ background: mgColor }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/exercises/${exercise.id}`} className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm leading-snug group-hover:text-[color:var(--primary)] transition-colors"
              style={{ color: 'var(--text)' }}
            >
              {exercise.name}
            </h3>
          </Link>
          {/* Favorite button */}
          <button
            type="button"
            onClick={() => onFavoriteToggle(exercise.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: exercise.is_favorite
                ? 'rgba(239,68,68,0.12)'
                : 'var(--bg-subtle)',
              border: `1px solid ${exercise.is_favorite ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={exercise.is_favorite ? '#ef4444' : 'none'}
              stroke={exercise.is_favorite ? '#ef4444' : 'var(--text-3)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${mgColor}18`, color: mgColor }}
          >
            {exercise.muscle_group.replace('_', ' ')}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--text-3)',
              border: '1px solid var(--border)',
            }}
          >
            {exercise.equipment.replace('_', ' ')}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{
              background: `${DIFF_COLOR[exercise.difficulty]}14`,
              color: DIFF_COLOR[exercise.difficulty],
            }}
          >
            {exercise.difficulty}
          </span>
          {exercise.is_custom && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(14,165,233,0.12)',
                color: 'var(--primary)',
              }}
            >
              Custom
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Exercise Modal ─────────────────────────────────────────────
function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (e: Exercise) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    muscle_group: 'chest',
    equipment: 'barbell',
    difficulty: 'beginner',
    description: '',
    instructions: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await api.post<Exercise>('/exercises', form);
      onCreated(result);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create exercise.',
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all';
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>
            Create custom exercise
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: 'var(--bg-subtle)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-3)"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {error && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <p className="text-sm" style={{ color: '#ef4444' }}>
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Exercise name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Cable Fly"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Muscle group',
                key: 'muscle_group',
                opts: MUSCLE_GROUPS,
              },
              { label: 'Equipment', key: 'equipment', opts: EQUIPMENT },
              { label: 'Difficulty', key: 'difficulty', opts: DIFFICULTIES },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label
                  className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-3)' }}
                >
                  {label}
                </label>
                <select
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className={`${inputClass} capitalize`}
                  style={inputStyle}
                >
                  {opts.map((o) => (
                    <option key={o} value={o}>
                      {o.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Brief description of the exercise..."
              rows={2}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Instructions
            </label>
            <textarea
              value={form.instructions}
              onChange={(e) =>
                setForm((p) => ({ ...p, instructions: e.target.value }))
              }
              placeholder="Step-by-step instructions..."
              rows={3}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
            style={{
              background: 'var(--cta)',
              boxShadow: '0 4px 20px var(--cta-shadow)',
            }}
          >
            {saving ? 'Creating...' : 'Create exercise'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const [tab, setTab] = useState<'all' | 'favorites' | 'custom'>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    muscle_group: '',
    equipment: '',
    difficulty: '',
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const fetchExercises = useCallback(
    async (p = 1, replace = true) => {
      if (tab === 'favorites') {
        try {
          const r = await api.get<{ exercises: Exercise[]; total: number }>(
            '/exercises/favorites',
          );
          setExercises(r.exercises);
          setTotal(r.total);
          setHasNext(false);
        } finally {
          setLoading(false);
        }
        return;
      }

      const params = new URLSearchParams({ page: String(p), limit: '24' });
      if (search) params.set('search', search);
      if (filters.muscle_group)
        params.set('muscle_group', filters.muscle_group);
      if (filters.equipment) params.set('equipment', filters.equipment);
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (tab === 'custom') params.set('custom_only', 'true');

      try {
        const r = await api.get<ExercisesResponse>(`/exercises?${params}`);
        const list =
          tab === 'custom'
            ? r.exercises.filter((e) => e.is_custom)
            : r.exercises;
        setExercises((prev) => (replace ? list : [...prev, ...list]));
        setTotal(r.total);
        setHasNext(r.has_next);
        setPage(p);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tab, search, filters],
  );

  // Debounced fetch on search/filter changes
  useEffect(() => {
    setLoading(true);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchExercises(1, true), 300);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [fetchExercises]);

  async function handleFavoriteToggle(id: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, is_favorite: !e.is_favorite } : e,
      ),
    );
    try {
      await api.post(`/exercises/${id}/favorite`);
    } catch {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_favorite: !e.is_favorite } : e,
        ),
      );
    }
  }

  function handleCreated(exercise: Exercise) {
    setExercises((prev) => [{ ...exercise }, ...prev]);
    setTotal((t) => t + 1);
  }

  function clearFilters() {
    setFilters({ muscle_group: '', equipment: '', difficulty: '' });
    setSearch('');
  }

  const tabs = [
    { key: 'all', label: 'All exercises' },
    { key: 'favorites', label: '♥ Favorites' },
    { key: 'custom', label: '✦ My exercises' },
  ] as const;

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-xl font-black"
                style={{ color: 'var(--text)' }}
              >
                Exercise Library
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                {total} exercises
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
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
              Create
            </button>
          </div>

          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-4)"
                strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:
                  activeFiltersCount > 0
                    ? 'var(--bg-hover)'
                    : 'var(--bg-subtle)',
                border:
                  activeFiltersCount > 0
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border)',
                color:
                  activeFiltersCount > 0 ? 'var(--primary)' : 'var(--text-3)',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter drawer */}
          {showFilters && (
            <div
              className="mt-3 rounded-2xl p-4 space-y-3"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {[
                {
                  label: 'Muscle group',
                  key: 'muscle_group',
                  opts: MUSCLE_GROUPS,
                },
                { label: 'Equipment', key: 'equipment', opts: EQUIPMENT },
                { label: 'Difficulty', key: 'difficulty', opts: DIFFICULTIES },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {opts.map((opt) => {
                      const active =
                        filters[key as keyof typeof filters] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setFilters((p) => ({
                              ...p,
                              [key]: active ? '' : opt,
                            }))
                          }
                          className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                          style={{
                            background: active
                              ? 'var(--primary)'
                              : 'var(--bg-subtle)',
                            color: active ? 'white' : 'var(--text-3)',
                            border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                          }}
                        >
                          {opt.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs font-semibold"
                style={{ color: 'var(--danger)' }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 mt-3 p-1 rounded-xl"
            style={{ background: 'var(--bg-subtle)' }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                  color: tab === t.key ? 'var(--text)' : 'var(--text-4)',
                  boxShadow:
                    tab === t.key ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="max-w-4xl mx-auto px-5 py-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse"
                style={{ background: 'var(--bg-card)' }}
              />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">{tab === 'favorites' ? '♥' : '🔍'}</p>
            <p className="font-bold mb-2" style={{ color: 'var(--text)' }}>
              {tab === 'favorites' ? 'No favorites yet' : 'No exercises found'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-4)' }}>
              {tab === 'favorites'
                ? 'Tap ♥ on any exercise to save it here'
                : 'Try adjusting your search or filters'}
            </p>
            {(search || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'var(--cta)' }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {hasNext && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={async () => {
                    setLoadingMore(true);
                    await fetchExercises(page + 1, false);
                  }}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}
