'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAuthStore, UserProfile } from '@/store/auth.store';

const FITNESS_GOALS = [
  { value: 'lose_weight', label: '🔥 Lose weight' },
  { value: 'build_muscle', label: '💪 Build muscle' },
  { value: 'maintain', label: '⚖️ Maintain fitness' },
  { value: 'improve_endurance', label: '🏃 Improve endurance' },
];
const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest mb-4"
        style={{ color: 'var(--text-3)' }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    display_name: '',
    height: '',
    current_weight: '',
    goal_weight: '',
    fitness_goal: '',
    workout_frequency_goal: 3,
    preferred_workout_days: [] as string[],
    weight_unit: 'kg',
    measurement_unit: 'cm',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || '',
        height: '',
        current_weight: '',
        goal_weight: '',
        fitness_goal: user.fitness_goal || '',
        workout_frequency_goal: user.workout_frequency_goal || 3,
        preferred_workout_days: user.preferred_workout_days || [],
        weight_unit: user.weight_unit || 'kg',
        measurement_unit: user.measurement_unit || 'cm',
      });
    }
  }, [user]);

  function update(key: string, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
    setSaved(false);
    setError('');
  }
  function toggleDay(day: string) {
    const days = form.preferred_workout_days;
    update(
      'preferred_workout_days',
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        display_name: form.display_name || undefined,
        fitness_goal: form.fitness_goal || undefined,
        workout_frequency_goal: form.workout_frequency_goal,
        preferred_workout_days: form.preferred_workout_days,
        weight_unit: form.weight_unit,
        measurement_unit: form.measurement_unit,
      };
      if (form.height) payload.height = Number(form.height);
      if (form.current_weight)
        payload.current_weight = Number(form.current_weight);
      if (form.goal_weight) payload.goal_weight = Number(form.goal_weight);

      const result = await api.patch<{ user: UserProfile }>(
        '/users/me',
        payload,
      );
      setUser(result.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };
  const inputCls =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all';
  const onFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.border = '1px solid var(--primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--bg-hover)';
  };
  const onBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.border = '1px solid var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-3)',
            }}
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
          </button>
          <div>
            <h1
              className="text-xl font-black leading-none"
              style={{ color: 'var(--text)' }}
            >
              Edit profile
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Update your personal information
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white"
            style={{ background: 'var(--cta)' }}
          >
            {(form.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          {/* Basic info */}
          <SectionBox title="Basic info">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-2)' }}
                >
                  Display name
                </label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => update('display_name', e.target.value)}
                  placeholder="Alex Johnson"
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-2)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={inputCls}
                  style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </SectionBox>

          {/* Units */}
          <SectionBox title="Units">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Weight', key: 'weight_unit', opts: ['kg', 'lbs'] },
                {
                  label: 'Measurements',
                  key: 'measurement_unit',
                  opts: ['cm', 'inch'],
                },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {label}
                  </p>
                  <div
                    className="flex rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {opts.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => update(key, u)}
                        className="flex-1 py-2.5 text-sm font-bold transition-all"
                        style={{
                          background:
                            form[key as keyof typeof form] === u
                              ? 'var(--cta)'
                              : 'transparent',
                          color:
                            form[key as keyof typeof form] === u
                              ? 'white'
                              : 'var(--text-3)',
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>

          {/* Body metrics */}
          <SectionBox title="Body metrics">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  key: 'height',
                  label: `Height (${form.measurement_unit})`,
                  placeholder: '175',
                },
                {
                  key: 'current_weight',
                  label: `Weight (${form.weight_unit})`,
                  placeholder: '75',
                },
                {
                  key: 'goal_weight',
                  label: `Goal (${form.weight_unit})`,
                  placeholder: '70',
                },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="number"
                    value={form[f.key as keyof typeof form] as string}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={inputCls}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              ))}
            </div>
          </SectionBox>

          {/* Fitness goal */}
          <SectionBox title="Fitness goal">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-2)' }}
                >
                  Primary goal
                </label>
                <select
                  value={form.fitness_goal}
                  onChange={(e) => update('fitness_goal', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="">Select goal</option>
                  {FITNESS_GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-2)' }}
                >
                  Weekly target:{' '}
                  <span style={{ color: 'var(--primary)' }}>
                    {form.workout_frequency_goal}×
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={form.workout_frequency_goal}
                  onChange={(e) =>
                    update('workout_frequency_goal', Number(e.target.value))
                  }
                  className="w-full"
                />
                <div
                  className="flex justify-between text-xs mt-1"
                  style={{ color: 'var(--text-4)' }}
                >
                  <span>1×</span>
                  <span>7×</span>
                </div>
              </div>

              <div>
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'var(--text-2)' }}
                >
                  Preferred days
                </p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day) => {
                    const sel = form.preferred_workout_days.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: sel ? 'var(--cta)' : 'var(--bg-subtle)',
                          color: sel ? 'white' : 'var(--text-3)',
                          border: `1px solid ${sel ? 'transparent' : 'var(--border)'}`,
                        }}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionBox>

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

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-white font-bold py-3.5 rounded-2xl transition-all text-sm disabled:opacity-60"
            style={{
              background: saved
                ? '#10b981'
                : isSaving
                  ? 'var(--primary-2)'
                  : 'var(--cta)',
              boxShadow:
                saved || isSaving ? 'none' : '0 4px 20px var(--cta-shadow)',
            }}
          >
            {isSaving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
