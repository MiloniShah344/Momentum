'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────
interface SetState {
  id: string | null;
  set_number: number;
  reps: string;
  weight: string;
  is_completed: boolean;
  saving: boolean;
}
interface ExerciseState {
  workout_exercise_id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  order: number;
  sets: SetState[];
  previous: Array<{ reps: number; weight: number }>;
  expanded: boolean;
}
interface ExerciseOption {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  is_favorite?: boolean;
}
interface CompletionResult {
  summary: {
    total_volume: number;
    total_sets: number;
    total_exercises: number;
    duration_minutes: number;
  };
  new_prs: Array<{ exercise_name: string; weight: number; reps: number }>;
  new_streak: number;
  new_achievements: Array<{ title: string }>;
}

const WORKOUT_TYPES = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'upper', label: 'Upper' },
  { value: 'lower', label: 'Lower' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'custom', label: 'Custom' },
];

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

// ── Set Row ────────────────────────────────────────────────────────────
function SetRow({
  set,
  prevSet,
  onChange,
  onComplete,
  onDelete,
}: {
  set: SetState;
  prevSet?: { reps: number; weight: number };
  onChange: (field: 'reps' | 'weight', val: string) => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 py-2.5 px-1"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span
        className="w-7 text-center text-xs font-bold flex-shrink-0"
        style={{ color: 'var(--text-3)' }}
      >
        {set.set_number}
      </span>
      <span
        className="w-20 text-center text-xs flex-shrink-0"
        style={{ color: 'var(--text-4)' }}
      >
        {prevSet ? `${prevSet.reps}×${prevSet.weight}` : '—'}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={set.reps}
        onChange={(e) => onChange('reps', e.target.value)}
        placeholder="0"
        className="flex-1 text-center py-1.5 rounded-lg text-sm font-bold outline-none"
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          minWidth: 0,
        }}
      />
      <input
        type="number"
        inputMode="decimal"
        value={set.weight}
        onChange={(e) => onChange('weight', e.target.value)}
        placeholder="0"
        className="flex-1 text-center py-1.5 rounded-lg text-sm font-bold outline-none"
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          minWidth: 0,
        }}
      />
      <button
        type="button"
        onClick={onComplete}
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
        style={{
          background: set.is_completed ? 'var(--success)' : 'var(--bg-subtle)',
          border: `1px solid ${set.is_completed ? 'transparent' : 'var(--border)'}`,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={set.is_completed ? 'white' : 'var(--text-4)'}
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{ color: 'var(--text-4)' }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Exercise Picker (with Favorites tab) ──────────────────────────────
function ExercisePicker({
  onSelect,
  onClose,
}: {
  onSelect: (ex: ExerciseOption) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [mgFilter, setMgFilter] = useState('');
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'favorites') {
        const r = await api.get<{ exercises: ExerciseOption[] }>(
          '/exercises/favorites',
        );
        setExercises(r.exercises);
      } else {
        const p = new URLSearchParams({ limit: '60' });
        if (search) p.set('search', search);
        if (mgFilter) p.set('muscle_group', mgFilter);
        const r = await api.get<{ exercises: ExerciseOption[] }>(
          `/exercises?${p}`,
        );
        setExercises(r.exercises);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, search, mgFilter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, 300);
  }, [load]);

  const MG_GROUPS = [
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={onClose} style={{ color: 'var(--text-3)' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {tab === 'all' && (
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="flex-1 py-2 text-sm outline-none"
            style={{ background: 'transparent', color: 'var(--text)' }}
          />
        )}
        {tab === 'favorites' && (
          <span
            className="flex-1 text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Favorite exercises
          </span>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex px-5 pt-3 gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {[
          { key: 'all', label: '📚 All Exercises' },
          { key: 'favorites', label: '♥ Favorites' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'all' | 'favorites')}
            className="pb-3 px-1 text-xs font-bold transition-all"
            style={{
              color: tab === t.key ? 'var(--primary)' : 'var(--text-4)',
              borderBottom:
                tab === t.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Muscle group chips — only for "All" tab */}
      {tab === 'all' && (
        <div
          className="flex gap-2 px-5 py-3 overflow-x-auto flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setMgFilter('')}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
            style={{
              background: !mgFilter ? 'var(--primary)' : 'var(--bg-subtle)',
              color: !mgFilter ? 'white' : 'var(--text-3)',
            }}
          >
            All
          </button>
          {MG_GROUPS.map((mg) => (
            <button
              key={mg}
              onClick={() => setMgFilter(mg === mgFilter ? '' : mg)}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 capitalize"
              style={{
                background:
                  mgFilter === mg
                    ? MG_COLOR[mg] || 'var(--primary)'
                    : 'var(--bg-subtle)',
                color: mgFilter === mg ? 'white' : 'var(--text-3)',
              }}
            >
              {mg.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: 'var(--bg-card)' }}
              />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{tab === 'favorites' ? '♥' : '🔍'}</p>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-3)' }}
            >
              {tab === 'favorites' ? 'No favorites yet' : 'No exercises found'}
            </p>
            {tab === 'favorites' && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
                Tap ♥ on exercises in the library to save them here
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex) => {
              const c = MG_COLOR[ex.muscle_group] || 'var(--primary)';
              return (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-2 h-8 rounded-full flex-shrink-0"
                    style={{ background: c }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {ex.name}
                    </p>
                    <p
                      className="text-xs capitalize"
                      style={{ color: 'var(--text-4)' }}
                    >
                      {ex.muscle_group?.replace('_', ' ')} ·{' '}
                      {ex.equipment?.replace('_', ' ')}
                    </p>
                  </div>
                  {ex.is_favorite && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: '#ef4444' }}
                    >
                      ♥
                    </span>
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Completion Modal ───────────────────────────────────────────────────
function CompletionModal({
  result,
  onClose,
}: {
  result: CompletionResult;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-5xl mb-3">🎉</p>
            <h2
              className="text-2xl font-black"
              style={{ color: 'var(--text)' }}
            >
              Workout saved!
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
              {result.summary.duration_minutes > 0
                ? `${result.summary.duration_minutes} minutes logged`
                : 'Great session logged!'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: 'Volume',
                value:
                  result.summary.total_volume > 0
                    ? `${result.summary.total_volume.toLocaleString()}kg`
                    : '—',
              },
              { label: 'Sets', value: String(result.summary.total_sets) },
              { label: 'Streak', value: `🔥 ${result.new_streak}` },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center rounded-2xl py-3"
                style={{ background: 'var(--bg-subtle)' }}
              >
                <p
                  className="text-lg font-black"
                  style={{ color: 'var(--text)' }}
                >
                  {s.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {result.new_prs.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--accent)' }}
              >
                🏆 New PRs!
              </p>
              {result.new_prs.map((pr) => (
                <p
                  key={pr.exercise_name}
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {pr.exercise_name} — {pr.weight}kg × {pr.reps}
                </p>
              ))}
            </div>
          )}
          {result.new_achievements.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{
                background: 'rgba(14,165,233,0.08)',
                border: '1px solid rgba(14,165,233,0.2)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--primary)' }}
              >
                ✨ Achievement unlocked!
              </p>
              {result.new_achievements.map((a) => (
                <p
                  key={a.title}
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {a.title}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'var(--cta)' }}
          >
            View workout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Logger (inner — uses useSearchParams) ─────────────────────────
function WorkoutLoggerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [previous, setPrevious] = useState<
    Record<string, Array<{ reps: number; weight: number }>>
  >({});
  const [form, setForm] = useState({
    title: 'My Workout',
    date: new Date().toISOString().split('T')[0],
    workout_type: 'custom',
    duration: '',
    notes: '',
  });
  const [status, setStatus] = useState<
    'loading' | 'active' | 'saving' | 'done'
  >('loading');
  const [showPicker, setShowPicker] = useState(false);
  const [completionResult, setResult] = useState<CompletionResult | null>(null);
  const [error, setError] = useState('');
  const saveDebounce = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  // ── Initialize ──────────────────────────────────────────────────────
  useEffect(() => {
    if (existingId) {
      // Continue existing workout
      api
        .get<{
          id: string;
          title: string;
          date: string;
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
        }>(`/workouts/${existingId}`)
        .then((data) => {
          setWorkoutId(data.id);
          setForm({
            title: data.title,
            date: data.date,
            workout_type: data.workout_type || 'custom',
            duration: data.duration ? String(data.duration) : '',
            notes: data.notes || '',
          });
          setExercises(
            data.exercises.map((ex) => ({
              workout_exercise_id: ex.workout_exercise_id,
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercise_name,
              muscle_group: ex.muscle_group,
              order: ex.order,
              sets: ex.sets.map((s) => ({
                id: s.id,
                set_number: s.set_number,
                reps: String(s.reps || ''),
                weight: String(s.weight || ''),
                is_completed: s.is_completed,
                saving: false,
              })),
              previous: [],
              expanded: true,
            })),
          );
          setStatus('active');
        })
        .catch(() => {
          setError('Failed to load workout.');
        });
    } else {
      // New workout
      api
        .post<{ id: string }>('/workouts', { title: 'My Workout' })
        .then((w) => {
          setWorkoutId(w.id);
          setStatus('active');
        })
        .catch(() => setError('Failed to create workout. Please try again.'));
    }
  }, [existingId]);

  // ── Fetch previous performance ────────────────────────────────────────
  const loadPrevious = useCallback(async () => {
    if (!workoutId || exercises.length === 0) return;
    try {
      const prev = await api.get<
        Record<string, { sets: Array<{ reps: number; weight: number }> }>
      >(`/workouts/${workoutId}/previous`);
      const map: Record<string, Array<{ reps: number; weight: number }>> = {};
      Object.entries(prev).forEach(([eid, data]) => {
        map[eid] = data.sets;
      });
      setPrevious(map);
    } catch {}
  }, [workoutId, exercises.length]);

  useEffect(() => {
    loadPrevious();
  }, [loadPrevious]);

  // ── Auto-save form fields ──────────────────────────────────────────────
  function saveFormField(updates: Record<string, string | number>) {
    if (!workoutId) return;
    const key = 'form';
    if (saveDebounce.current[key]) clearTimeout(saveDebounce.current[key]);
    saveDebounce.current[key] = setTimeout(() => {
      api.patch(`/workouts/${workoutId}`, updates).catch(() => {});
    }, 800);
  }

  // ── Add exercise ──────────────────────────────────────────────────────
  async function handleSelectExercise(ex: ExerciseOption) {
    if (!workoutId) return;
    setShowPicker(false);
    try {
      const we = await api.post<{
        workout_exercise_id: string;
        exercise_id: string;
        exercise_name: string;
        muscle_group: string;
        order: number;
      }>(`/workouts/${workoutId}/exercises`, { exercise_id: ex.id });

      setExercises((prev) => [
        ...prev,
        {
          workout_exercise_id: we.workout_exercise_id,
          exercise_id: we.exercise_id,
          exercise_name: we.exercise_name,
          muscle_group: we.muscle_group,
          order: we.order,
          sets: [],
          previous: [],
          expanded: true,
        },
      ]);
    } catch {
      setError('Failed to add exercise.');
    }
  }

  function handleRemoveExercise(weId: string) {
    setExercises((prev) => prev.filter((e) => e.workout_exercise_id !== weId));
    if (workoutId)
      api.delete(`/workouts/${workoutId}/exercises/${weId}`).catch(() => {});
  }

  // ── Add set ───────────────────────────────────────────────────────────
  async function handleAddSet(weId: string, exerciseId: string) {
    if (!workoutId) return;
    const exercise = exercises.find((e) => e.workout_exercise_id === weId);
    if (!exercise) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const prevData = previous[exerciseId];
    const setNum = exercise.sets.length + 1;
    const prefillReps =
      lastSet?.reps || String(prevData?.[setNum - 1]?.reps || '');
    const prefillWeight =
      lastSet?.weight || String(prevData?.[setNum - 1]?.weight || '');

    // Optimistic add
    const tempSet: SetState = {
      id: null,
      set_number: setNum,
      reps: prefillReps,
      weight: prefillWeight,
      is_completed: false,
      saving: true,
    };
    setExercises((prev) =>
      prev.map((e) =>
        e.workout_exercise_id === weId
          ? { ...e, sets: [...e.sets, tempSet] }
          : e,
      ),
    );

    try {
      const saved = await api.post<{ id: string }>(
        `/workouts/${workoutId}/exercises/${weId}/sets`,
        {
          reps: Number(prefillReps) || undefined,
          weight: Number(prefillWeight) || undefined,
        },
      );
      setExercises((prev) =>
        prev.map((e) =>
          e.workout_exercise_id !== weId
            ? e
            : {
                ...e,
                sets: e.sets.map((s) =>
                  s.id === null && s.set_number === setNum
                    ? { ...s, id: saved.id, saving: false }
                    : s,
                ),
              },
        ),
      );
    } catch {
      // Remove optimistic set on failure
      setExercises((prev) =>
        prev.map((e) =>
          e.workout_exercise_id === weId
            ? {
                ...e,
                sets: e.sets.filter(
                  (s) => !(s.id === null && s.set_number === setNum),
                ),
              }
            : e,
        ),
      );
      setError('Failed to add set. Please try again.');
    }
  }

  // ── Update set field ──────────────────────────────────────────────────
  function handleSetChange(
    weId: string,
    setId: string | null,
    setNum: number,
    field: 'reps' | 'weight',
    val: string,
  ) {
    setExercises((prev) =>
      prev.map((e) =>
        e.workout_exercise_id !== weId
          ? e
          : {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId || (setId === null && s.set_number === setNum)
                  ? { ...s, [field]: val }
                  : s,
              ),
            },
      ),
    );
    // Auto-save to backend
    const set = exercises
      .find((e) => e.workout_exercise_id === weId)
      ?.sets.find((s) => s.id === setId);
    if (set?.id && workoutId) {
      const key = set.id;
      if (saveDebounce.current[key]) clearTimeout(saveDebounce.current[key]);
      saveDebounce.current[key] = setTimeout(() => {
        const updated =
          field === 'reps'
            ? {
                reps: Number(val) || undefined,
                weight: Number(set.weight) || undefined,
              }
            : {
                reps: Number(set.reps) || undefined,
                weight: Number(val) || undefined,
              };
        api
          .patch(
            `/workouts/${workoutId}/exercises/${weId}/sets/${set.id}`,
            updated,
          )
          .catch(() => {});
      }, 800);
    }
  }

  // ── Toggle set complete ───────────────────────────────────────────────
  async function handleSetComplete(weId: string, set: SetState) {
    if (!workoutId || !set.id) return;
    const newVal = !set.is_completed;
    setExercises((prev) =>
      prev.map((e) =>
        e.workout_exercise_id !== weId
          ? e
          : {
              ...e,
              sets: e.sets.map((s) =>
                s.id === set.id ? { ...s, is_completed: newVal } : s,
              ),
            },
      ),
    );
    try {
      await api.patch(
        `/workouts/${workoutId}/exercises/${weId}/sets/${set.id}`,
        {
          is_completed: newVal,
          reps: Number(set.reps) || undefined,
          weight: Number(set.weight) || undefined,
        },
      );
    } catch {
      setExercises((prev) =>
        prev.map((e) =>
          e.workout_exercise_id !== weId
            ? e
            : {
                ...e,
                sets: e.sets.map((s) =>
                  s.id === set.id ? { ...s, is_completed: !newVal } : s,
                ),
              },
        ),
      );
    }
  }

  // ── Delete set ────────────────────────────────────────────────────────
  function handleDeleteSet(weId: string, setId: string | null, setNum: number) {
    setExercises((prev) =>
      prev.map((e) =>
        e.workout_exercise_id !== weId
          ? e
          : {
              ...e,
              sets: e.sets.filter(
                (s) =>
                  s.id !== setId &&
                  !(setId === null && s.set_number === setNum),
              ),
            },
      ),
    );
    if (setId && workoutId) {
      api
        .delete(`/workouts/${workoutId}/exercises/${weId}/sets/${setId}`)
        .catch(() => {});
    }
  }

  // ── Save workout ──────────────────────────────────────────────────────
  async function handleSaveWorkout() {
    if (!workoutId) return;
    setStatus('saving');
    setError('');
    try {
      // Patch metadata first
      await api.patch(`/workouts/${workoutId}`, {
        title: form.title,
        date: form.date,
        workout_type: form.workout_type,
        notes: form.notes || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
      });
      // Then complete (triggers streak/PR/achievement)
      const result = await api.post<CompletionResult>(
        `/workouts/${workoutId}/complete`,
      );
      setResult(result);
      setStatus('done');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to save. Please try again.',
      );
      setStatus('active');
    }
  }

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <svg
            className="animate-spin mx-auto mb-4"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--primary)"
              strokeWidth="3"
            />
            <path
              className="opacity-80"
              fill="var(--primary)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {error ? (
            <>
              <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/workouts')}
                className="text-sm"
                style={{ color: 'var(--primary)' }}
              >
                ← Go back
              </button>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              {existingId ? 'Loading workout…' : 'Preparing logger…'}
            </p>
          )}
        </div>
      </div>
    );
  }

  const totalCompleted = exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.is_completed).length,
    0,
  );
  const canSave = exercises.length > 0;

  return (
    <>
      <main className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
        {/* ── Header ── */}
        <div
          className="sticky top-0 z-40 px-4 py-3"
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
            <input
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                saveFormField({ title: e.target.value });
              }}
              className="flex-1 font-black text-base bg-transparent outline-none"
              style={{ color: 'var(--text)' }}
            />
            {totalCompleted > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: 'var(--success)',
                }}
              >
                {totalCompleted} sets ✓
              </span>
            )}
            <button
              onClick={handleSaveWorkout}
              disabled={!canSave || status === 'saving'}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex-shrink-0 transition-all"
              style={{
                background: canSave ? 'var(--success)' : 'var(--bg-subtle)',
              }}
            >
              {status === 'saving' ? '…' : '💾 Save'}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Workout metadata ── */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--text-3)' }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, date: e.target.value }));
                    saveFormField({ date: e.target.value });
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--text-3)' }}
                >
                  Duration (min)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.duration}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, duration: e.target.value }));
                    saveFormField({ duration: Number(e.target.value) });
                  }}
                  placeholder="e.g. 45"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--text-3)' }}
              >
                Workout type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WORKOUT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, workout_type: t.value }));
                      saveFormField({ workout_type: t.value });
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background:
                        form.workout_type === t.value
                          ? 'var(--primary)'
                          : 'var(--bg-subtle)',
                      color:
                        form.workout_type === t.value
                          ? 'white'
                          : 'var(--text-3)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Exercise sections ── */}
          {exercises.map((exercise) => {
            const color = MG_COLOR[exercise.muscle_group] || 'var(--primary)';
            const prevSets = previous[exercise.exercise_id] || [];
            return (
              <div
                key={exercise.workout_exercise_id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Exercise header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: exercise.expanded
                      ? '1px solid var(--border)'
                      : 'none',
                  }}
                >
                  <div
                    className="w-2.5 h-8 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {exercise.exercise_name}
                    </p>
                    <p
                      className="text-xs capitalize"
                      style={{ color: 'var(--text-4)' }}
                    >
                      {exercise.muscle_group.replace('_', ' ')}
                      {exercise.sets.filter((s) => s.is_completed).length > 0 &&
                        ` · ${exercise.sets.filter((s) => s.is_completed).length}/${exercise.sets.length} completed`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setExercises((prev) =>
                        prev.map((e) =>
                          e.workout_exercise_id === exercise.workout_exercise_id
                            ? { ...e, expanded: !e.expanded }
                            : e,
                        ),
                      )
                    }
                    style={{ color: 'var(--text-4)' }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline
                        points={
                          exercise.expanded
                            ? '18 15 12 9 6 15'
                            : '6 9 12 15 18 9'
                        }
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleRemoveExercise(exercise.workout_exercise_id)
                    }
                    style={{ color: 'var(--text-4)' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>

                {exercise.expanded && (
                  <div className="px-2 py-1">
                    {exercise.sets.length > 0 && (
                      <div className="flex items-center gap-2 py-1.5 px-1 mb-1">
                        <span
                          className="w-7 text-center text-[10px] font-bold uppercase"
                          style={{ color: 'var(--text-4)' }}
                        >
                          Set
                        </span>
                        <span
                          className="w-20 text-center text-[10px] font-bold uppercase"
                          style={{ color: 'var(--text-4)' }}
                        >
                          Prev
                        </span>
                        <span
                          className="flex-1 text-center text-[10px] font-bold uppercase"
                          style={{ color: 'var(--text-4)' }}
                        >
                          Reps
                        </span>
                        <span
                          className="flex-1 text-center text-[10px] font-bold uppercase"
                          style={{ color: 'var(--text-4)' }}
                        >
                          kg
                        </span>
                        <span className="w-9" />
                        <span className="w-7" />
                      </div>
                    )}
                    {exercise.sets.map((set) => (
                      <SetRow
                        key={set.id || `temp-${set.set_number}`}
                        set={set}
                        prevSet={prevSets[set.set_number - 1]}
                        onChange={(field, val) =>
                          handleSetChange(
                            exercise.workout_exercise_id,
                            set.id,
                            set.set_number,
                            field,
                            val,
                          )
                        }
                        onComplete={() =>
                          handleSetComplete(exercise.workout_exercise_id, set)
                        }
                        onDelete={() =>
                          handleDeleteSet(
                            exercise.workout_exercise_id,
                            set.id,
                            set.set_number,
                          )
                        }
                      />
                    ))}
                    <button
                      onClick={() =>
                        handleAddSet(
                          exercise.workout_exercise_id,
                          exercise.exercise_id,
                        )
                      }
                      className="w-full py-3 mt-1 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-3)',
                      }}
                    >
                      + Add set
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Add exercise button ── */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
            style={{
              background:
                exercises.length === 0 ? 'var(--cta)' : 'var(--bg-card)',
              color: exercises.length === 0 ? 'white' : 'var(--primary)',
              border:
                exercises.length === 0 ? 'none' : '1.5px dashed var(--primary)',
              boxShadow:
                exercises.length === 0
                  ? '0 4px 20px var(--cta-shadow)'
                  : 'none',
            }}
          >
            {exercises.length === 0
              ? '💪 Add your first exercise'
              : '+ Add exercise'}
          </button>

          {/* ── Notes ── */}
          {exercises.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-3)' }}
              >
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => {
                  setForm((p) => ({ ...p, notes: e.target.value }));
                  saveFormField({ notes: e.target.value });
                }}
                placeholder="How did this session feel? Any notes…"
                rows={2}
                className="w-full text-sm outline-none resize-none bg-transparent"
                style={{ color: 'var(--text)' }}
              />
            </div>
          )}

          {/* ── Save button (large, bottom) ── */}
          {canSave && (
            <button
              onClick={handleSaveWorkout}
              disabled={status === 'saving'}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-all disabled:opacity-60"
              style={{
                background: 'var(--success)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              {status === 'saving' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving…
                </span>
              ) : (
                '💾 Save Workout'
              )}
            </button>
          )}
          <div className="h-4" />
        </div>
      </main>

      {showPicker && (
        <ExercisePicker
          onSelect={handleSelectExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
      {completionResult && (
        <CompletionModal
          result={completionResult}
          onClose={() => router.push(`/workouts/${workoutId}`)}
        />
      )}
    </>
  );
}

// ── Page export (Suspense required for useSearchParams) ────────────────
export default function NewWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <svg
            className="animate-spin"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--primary)"
              strokeWidth="3"
            />
            <path
              className="opacity-80"
              fill="var(--primary)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      }
    >
      <WorkoutLoggerInner />
    </Suspense>
  );
}
