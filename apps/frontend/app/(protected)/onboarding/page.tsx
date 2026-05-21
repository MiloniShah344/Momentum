'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAuthStore, UserProfile } from '@/store/auth.store';

// ── Types ────────────────────────────────────────────────────────────
interface OnboardingData {
  display_name: string;
  height: string;
  weight_unit: 'kg' | 'lbs';
  measurement_unit: 'cm' | 'inch';
  fitness_goal: string;
  workout_frequency_goal: number;
  preferred_workout_days: string[];
  current_weight: string;
  goal_weight: string;
  measurements: {
    waist: string;
    chest: string;
    arms: string;
    thighs: string;
    hips: string;
    neck: string;
  };
  selected_habits: string[];
}

// ── Small shared components ──────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = [
    'Profile',
    'Goal',
    'Frequency',
    'Days',
    'Weight',
    'Measurements',
    'Habits',
  ];
  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i + 1 === current ? 24 : 8,
              height: 8,
              background:
                i + 1 < current
                  ? 'rgba(139,92,246,0.5)'
                  : i + 1 === current
                    ? 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
      <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">
        Step {current} of {total} · {labels[current - 1]}
      </p>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  gradient,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
  gradient?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-all duration-200"
      style={{
        background: selected
          ? gradient || 'rgba(139,92,246,0.15)'
          : 'rgba(255,255,255,0.03)',
        border: selected
          ? '1.5px solid rgba(139,92,246,0.6)'
          : '1px solid rgba(255,255,255,0.06)',
        transform: selected ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl flex-shrink-0">{icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{title}</p>
          <p className="text-gray-400 text-xs mt-0.5">{description}</p>
        </div>
        {selected && (
          <div className="ml-auto flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid rgba(139,92,246,0.7)';
            e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid rgba(255,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Step Components ──────────────────────────────────────────────────

function Step1({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          Let&apos;s set you up 👋
        </h2>
        <p className="text-gray-400">
          Tell us a bit about yourself to personalize your experience.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your name
        </label>
        <input
          type="text"
          value={data.display_name}
          onChange={(e) => onChange({ display_name: e.target.value })}
          placeholder="Alex Johnson"
          className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid rgba(139,92,246,0.7)';
            e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid rgba(255,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Unit preference */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-3">
          Preferred units
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Weight
            </p>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onChange({ weight_unit: u })}
                  className="flex-1 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background:
                      data.weight_unit === u
                        ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                        : 'transparent',
                    color: data.weight_unit === u ? 'white' : '#6b7280',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Measurements
            </p>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['cm', 'inch'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onChange({ measurement_unit: u })}
                  className="flex-1 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background:
                      data.measurement_unit === u
                        ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                        : 'transparent',
                    color: data.measurement_unit === u ? 'white' : '#6b7280',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NumberInput
        label={`Height (${data.measurement_unit})`}
        value={data.height}
        onChange={(v) => onChange({ height: v })}
        placeholder={data.measurement_unit === 'cm' ? '175' : '69'}
        unit={data.measurement_unit}
        min={50}
        max={300}
      />
    </div>
  );
}

function Step2({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const goals = [
    {
      key: 'lose_weight',
      icon: '🔥',
      title: 'Lose weight',
      description: 'Burn fat, get lean',
    },
    {
      key: 'build_muscle',
      icon: '💪',
      title: 'Build muscle',
      description: 'Get stronger, gain mass',
    },
    {
      key: 'maintain',
      icon: '⚖️',
      title: 'Maintain fitness',
      description: 'Stay consistent and healthy',
    },
    {
      key: 'improve_endurance',
      icon: '🏃',
      title: 'Improve endurance',
      description: 'Run farther, last longer',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          What&apos;s your goal? 🎯
        </h2>
        <p className="text-gray-400">
          Choose your primary fitness objective. You can change this later.
        </p>
      </div>
      <div className="space-y-3">
        {goals.map((g) => (
          <OptionCard
            key={g.key}
            selected={data.fitness_goal === g.key}
            onClick={() => onChange({ fitness_goal: g.key })}
            icon={g.icon}
            title={g.title}
            description={g.description}
          />
        ))}
      </div>
    </div>
  );
}

function Step3({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const options = [
    { value: 2, label: '2×', sub: 'Light' },
    { value: 3, label: '3×', sub: 'Moderate' },
    { value: 4, label: '4×', sub: 'Active' },
    { value: 5, label: '5×', sub: 'Intense' },
    { value: 6, label: '6×+', sub: 'Elite' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          Weekly target 📅
        </h2>
        <p className="text-gray-400">
          How many days per week do you want to work out?
        </p>
      </div>

      {/* Big number display */}
      <div className="text-center py-4">
        <span
          className="text-8xl font-black"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {data.workout_frequency_goal}
        </span>
        <p className="text-gray-400 text-lg mt-1">days per week</p>
      </div>

      <div className="flex gap-3 justify-center">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ workout_frequency_goal: opt.value })}
            className="flex-1 flex flex-col items-center py-4 rounded-2xl transition-all duration-200"
            style={{
              background:
                data.workout_frequency_goal === opt.value
                  ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                  : 'rgba(255,255,255,0.03)',
              border:
                data.workout_frequency_goal === opt.value
                  ? '1.5px solid rgba(139,92,246,0.6)'
                  : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-white font-black text-lg leading-none">
              {opt.label}
            </span>
            <span
              className="text-xs mt-1"
              style={{
                color:
                  data.workout_frequency_goal === opt.value
                    ? 'rgba(255,255,255,0.7)'
                    : '#6b7280',
              }}
            >
              {opt.sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const days = [
    { key: 'monday', short: 'M', full: 'Mon' },
    { key: 'tuesday', short: 'T', full: 'Tue' },
    { key: 'wednesday', short: 'W', full: 'Wed' },
    { key: 'thursday', short: 'T', full: 'Thu' },
    { key: 'friday', short: 'F', full: 'Fri' },
    { key: 'saturday', short: 'S', full: 'Sat' },
    { key: 'sunday', short: 'S', full: 'Sun' },
  ];

  function toggleDay(key: string) {
    const current = data.preferred_workout_days;
    const updated = current.includes(key)
      ? current.filter((d) => d !== key)
      : [...current, key];
    onChange({ preferred_workout_days: updated });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          Your workout days 💪
        </h2>
        <p className="text-gray-400">
          Which days work best? Selected:{' '}
          <span className="text-white font-semibold">
            {data.preferred_workout_days.length}
          </span>{' '}
          days
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = data.preferred_workout_days.includes(day.key);
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => toggleDay(day.key)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-200"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1.5px solid rgba(139,92,246,0.6)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: isSelected ? 'rgba(255,255,255,0.7)' : '#4b5563',
                }}
              >
                {day.full}
              </span>
              <span
                className="text-base font-black"
                style={{ color: isSelected ? 'white' : '#9ca3af' }}
              >
                {day.short}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-gray-600 text-sm">
        Rest days are just as important for recovery 💤
      </p>
    </div>
  );
}

function Step5({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const unit = data.weight_unit;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          Track your progress ⚖️
        </h2>
        <p className="text-gray-400">
          Your starting numbers. All values are in{' '}
          <span className="text-white font-semibold">{unit}</span>.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <NumberInput
          label={`Current weight (${unit})`}
          value={data.current_weight}
          onChange={(v) => onChange({ current_weight: v })}
          placeholder={unit === 'kg' ? '75' : '165'}
          unit={unit}
          min={1}
          max={700}
        />

        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          <span className="text-gray-500 text-xs">target</span>
          <div
            className="flex-1 h-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        <NumberInput
          label={`Goal weight (${unit})`}
          value={data.goal_weight}
          onChange={(v) => onChange({ goal_weight: v })}
          placeholder={unit === 'kg' ? '70' : '154'}
          unit={unit}
          min={1}
          max={700}
        />
      </div>

      {data.current_weight && data.goal_weight && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <p className="text-violet-300">
            {Number(data.goal_weight) < Number(data.current_weight)
              ? `🎯 Lose ${(Number(data.current_weight) - Number(data.goal_weight)).toFixed(1)} ${unit}`
              : Number(data.goal_weight) > Number(data.current_weight)
                ? `💪 Gain ${(Number(data.goal_weight) - Number(data.current_weight)).toFixed(1)} ${unit}`
                : '⚖️ Maintain your current weight'}
          </p>
        </div>
      )}
    </div>
  );
}

function Step6({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const unit = data.measurement_unit;
  const fields = [
    { key: 'waist', label: 'Waist', placeholder: unit === 'cm' ? '80' : '32' },
    { key: 'chest', label: 'Chest', placeholder: unit === 'cm' ? '95' : '37' },
    { key: 'arms', label: 'Arms', placeholder: unit === 'cm' ? '35' : '14' },
    {
      key: 'thighs',
      label: 'Thighs',
      placeholder: unit === 'cm' ? '55' : '22',
    },
    { key: 'hips', label: 'Hips', placeholder: unit === 'cm' ? '95' : '37' },
    { key: 'neck', label: 'Neck', placeholder: unit === 'cm' ? '37' : '15' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          Body measurements 📏
        </h2>
        <p className="text-gray-400">
          Optional baseline in{' '}
          <span className="text-white font-semibold">{unit}</span>. Skip if you
          prefer to add these later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <NumberInput
            key={f.key}
            label={f.label}
            value={data.measurements[f.key]}
            onChange={(v) =>
              onChange({
                measurements: { ...data.measurements, [f.key]: v },
              })
            }
            placeholder={f.placeholder}
            unit={unit}
            min={1}
            max={300}
          />
        ))}
      </div>
    </div>
  );
}

function Step7({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
}) {
  const habits = [
    {
      key: 'water',
      icon: '💧',
      title: 'Water intake',
      description: 'Drink 8 glasses daily',
    },
    {
      key: 'protein',
      icon: '🥩',
      title: 'Protein goal',
      description: 'Hit 150g of protein',
    },
    {
      key: 'sleep',
      icon: '😴',
      title: 'Sleep 8 hours',
      description: 'Rest is growth time',
    },
    {
      key: 'stretching',
      icon: '🧘',
      title: 'Stretching',
      description: 'Daily mobility work',
    },
    {
      key: 'meditation',
      icon: '🧠',
      title: 'Meditation',
      description: 'Focus and mindfulness',
    },
    {
      key: 'steps',
      icon: '👟',
      title: 'Steps goal',
      description: '10,000 steps per day',
    },
  ];

  function toggleHabit(key: string) {
    const current = data.selected_habits;
    const updated = current.includes(key)
      ? current.filter((h) => h !== key)
      : [...current, key];
    onChange({ selected_habits: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">Daily habits 🌱</h2>
        <p className="text-gray-400">
          Pick habits to track daily. Selected:{' '}
          <span className="text-white font-semibold">
            {data.selected_habits.length}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {habits.map((h) => {
          const isSelected = data.selected_habits.includes(h.key);
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => toggleHabit(h.key)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? 'rgba(139,92,246,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1.5px solid rgba(139,92,246,0.5)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-2xl">{h.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{h.title}</p>
                <p className="text-gray-500 text-xs truncate">
                  {h.description}
                </p>
              </div>
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.06)',
                  border: isSelected
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Onboarding Page ────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isInitialized, setUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    display_name: '',
    height: '',
    weight_unit: 'kg',
    measurement_unit: 'cm',
    fitness_goal: '',
    workout_frequency_goal: 3,
    preferred_workout_days: [],
    current_weight: '',
    goal_weight: '',
    measurements: {
      waist: '',
      chest: '',
      arms: '',
      thighs: '',
      hips: '',
      neck: '',
    },
    selected_habits: [],
  });

  // Pre-fill from existing user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        display_name: user.display_name || prev.display_name,
        weight_unit: (user.weight_unit as 'kg' | 'lbs') || 'kg',
        measurement_unit: (user.measurement_unit as 'cm' | 'inch') || 'cm',
      }));
    }
  }, [user]);

  // If already completed, redirect to dashboard
  useEffect(() => {
    if (isInitialized && user?.onboarding_complete) {
      router.replace('/dashboard');
    }
  }, [user, isInitialized, router]);

  function updateData(updates: Partial<OnboardingData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  const TOTAL_STEPS = 7;
  const OPTIONAL_STEPS = [6, 7]; // Can be skipped
  const isOptional = OPTIONAL_STEPS.includes(step);
  const isLastStep = step === TOTAL_STEPS;

  async function handleComplete() {
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        display_name: formData.display_name || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight_unit: formData.weight_unit,
        measurement_unit: formData.measurement_unit,
        fitness_goal: formData.fitness_goal || undefined,
        workout_frequency_goal: formData.workout_frequency_goal,
        preferred_workout_days: formData.preferred_workout_days,
        current_weight: formData.current_weight
          ? Number(formData.current_weight)
          : undefined,
        goal_weight: formData.goal_weight
          ? Number(formData.goal_weight)
          : undefined,
        measurements: Object.values(formData.measurements).some(Boolean)
          ? Object.fromEntries(
              Object.entries(formData.measurements)
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => [k, Number(v)]),
            )
          : undefined,
        selected_habits: formData.selected_habits,
      };

      const result = await api.post<{ user: UserProfile }>(
        '/users/onboarding',
        payload,
      );

      // Update Zustand store so dashboard doesn't redirect back here
      setUser(result.user);

      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
      setIsSubmitting(false);
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <svg
          className="animate-spin"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="white"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  const stepComponents = [
    <Step1 key={1} data={formData} onChange={updateData} />,
    <Step2 key={2} data={formData} onChange={updateData} />,
    <Step3 key={3} data={formData} onChange={updateData} />,
    <Step4 key={4} data={formData} onChange={updateData} />,
    <Step5 key={5} data={formData} onChange={updateData} />,
    <Step6 key={6} data={formData} onChange={updateData} />,
    <Step7 key={7} data={formData} onChange={updateData} />,
  ];

  return (
    <div className="min-h-screen bg-[#080812] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="text-white font-bold">Momentum</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-8">
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-xl mx-auto">{stepComponents[step - 1]}</div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-6 mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="p-6 pt-0">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {/* Back button */}
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
              Back
            </button>
          )}

          {/* Continue / Finish */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={isLastStep ? handleComplete : () => setStep((s) => s + 1)}
            className="flex-1 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-60"
            style={{
              background: isSubmitting
                ? 'rgba(139,92,246,0.5)'
                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: isSubmitting
                ? 'none'
                : '0 4px 24px rgba(139,92,246,0.3)',
            }}
          >
            {isSubmitting ? (
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
                Setting up your profile...
              </span>
            ) : isLastStep ? (
              '🚀 Finish setup'
            ) : (
              'Continue →'
            )}
          </button>

          {/* Skip (optional steps only) */}
          {isOptional && !isLastStep && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Skip
            </button>
          )}
          {isOptional && isLastStep && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="px-4 py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 disabled:opacity-60"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
