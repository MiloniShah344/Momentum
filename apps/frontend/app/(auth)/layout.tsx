import type { Metadata } from 'next';
import ThemeToggle from '@/components/ui/ThemeToggle';

export const metadata: Metadata = { title: 'Momentum — Sign in' };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* ── Left brand panel (desktop) ── */}
      <div
        className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(135deg, #0c1e3a 0%, #071428 50%, #040c1a 100%)',
        }}
      >
        {/* Orbs */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-20 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'var(--cta)' }}
            >
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Momentum
            </span>
          </div>

          <div className="mb-14">
            <h1 className="text-[2.6rem] font-black text-white leading-[1.15] mb-5">
              Build the habit.
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg,#38bdf8,#06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Own the grind.
              </span>
            </h1>
            <p className="text-slate-400 text-[1.05rem] leading-relaxed max-w-xs">
              Log workouts, build streaks, and watch your consistency compound
              into real results.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: '🔥',
                label: 'Streak system',
                sub: 'Never break the chain',
              },
              {
                icon: '📈',
                label: 'Progress analytics',
                sub: 'Visualize every gain',
              },
              {
                icon: '🏆',
                label: 'Achievements',
                sub: 'Celebrate every milestone',
              },
              {
                icon: '💪',
                label: '80+ exercises',
                sub: 'Full curated library',
              },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    border: '1px solid rgba(14,165,233,0.2)',
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-slate-500 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-slate-500 text-sm italic">
            &ldquo;Consistency is what transforms average into
            excellence.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
        {/* Top bar with theme toggle */}
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--cta)' }}
              >
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span
                className="font-bold text-xl"
                style={{ color: 'var(--text)' }}
              >
                Momentum
              </span>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
