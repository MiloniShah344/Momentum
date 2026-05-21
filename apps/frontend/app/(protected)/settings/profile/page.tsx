'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    setForm((prev) => ({ ...prev, [key]: value }));
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
      const payload = {
        display_name: form.display_name || undefined,
        height: form.height ? Number(form.height) : undefined,
        current_weight: form.current_weight
          ? Number(form.current_weight)
          : undefined,
        goal_weight: form.goal_weight ? Number(form.goal_weight) : undefined,
        fitness_goal: form.fitness_goal || undefined,
        workout_frequency_goal: form.workout_frequency_goal,
        preferred_workout_days: form.preferred_workout_days,
        weight_unit: form.weight_unit,
        measurement_unit: form.measurement_unit,
      };

      const result = await api.patch<{ user: UserProfile }>(
        '/users/me',
        payload,
      );
      setUser(result.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save. Try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all';
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };
  const onFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.border = '1px solid rgba(139,92,246,0.7)';
    e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
  };
  const onBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.border = '1px solid rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color: '#6b7280' }}
    >
      {children}
    </h3>
  );

  return (
    <main className="min-h-screen bg-[#080812] p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
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
            <h1 className="text-xl font-black text-white leading-none">
              Edit profile
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Update your personal information
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            {(form.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic info */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <SectionTitle>Basic info</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display name
                </label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => update('display_name', e.target.value)}
                  placeholder="Alex Johnson"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={inputClass}
                  style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Units */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <SectionTitle>Units</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Weight</p>
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {['kg', 'lbs'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => update('weight_unit', u)}
                      className="flex-1 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background:
                          form.weight_unit === u
                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                            : 'transparent',
                        color: form.weight_unit === u ? 'white' : '#6b7280',
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Measurements</p>
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {['cm', 'inch'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => update('measurement_unit', u)}
                      className="flex-1 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background:
                          form.measurement_unit === u
                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                            : 'transparent',
                        color:
                          form.measurement_unit === u ? 'white' : '#6b7280',
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Body metrics */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <SectionTitle>Body metrics</SectionTitle>
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
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    {f.label}
                  </label>
                  <input
                    type="number"
                    value={form[f.key as keyof typeof form] as string}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fitness goal */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <SectionTitle>Fitness goal</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary goal
                </label>
                <select
                  value={form.fitness_goal}
                  onChange={(e) => update('fitness_goal', e.target.value)}
                  className={inputClass}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weekly workout target:{' '}
                  <span className="text-violet-400">
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
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1×</span>
                  <span>7×</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300 mb-3">
                  Preferred workout days
                </p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day) => {
                    const selected = form.preferred_workout_days.includes(
                      day.key,
                    );
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: selected
                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                            : 'rgba(255,255,255,0.05)',
                          border: selected
                            ? '1.5px solid rgba(139,92,246,0.5)'
                            : '1px solid rgba(255,255,255,0.08)',
                          color: selected ? 'white' : '#6b7280',
                        }}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-white font-bold py-3.5 rounded-2xl transition-all text-sm disabled:opacity-60"
            style={{
              background: saved
                ? 'rgba(34,197,94,0.8)'
                : isSaving
                  ? 'rgba(139,92,246,0.5)'
                  : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow:
                saved || isSaving ? 'none' : '0 4px 24px rgba(139,92,246,0.3)',
            }}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
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
                Saving...
              </span>
            ) : saved ? (
              '✓ Saved!'
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
