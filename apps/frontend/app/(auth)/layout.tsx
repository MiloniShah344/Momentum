import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Momentum — Sign in',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#080812]">
      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(135deg, #1a0533 0%, #0d1347 50%, #080812 100%)',
        }}
      >
        {/* Decorative blur orbs */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top — Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Momentum
            </span>
          </div>

          {/* Headline */}
          <div className="mb-14">
            <h1 className="text-[2.6rem] font-black text-white leading-[1.15] mb-5">
              Build the habit.
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Own the grind.
              </span>
            </h1>
            <p className="text-gray-400 text-[1.05rem] leading-relaxed max-w-xs">
              Log workouts, build unstoppable streaks, and watch your
              consistency compound into real results.
            </p>
          </div>

          {/* Feature list */}
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-gray-500 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Quote */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-gray-500 text-sm italic leading-relaxed">
            &ldquo;Consistency is what transforms average into
            excellence.&rdquo;
          </p>
          <p className="text-gray-600 text-xs mt-1">— The Momentum principle</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-[#080812]">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="text-white font-bold text-xl">Momentum</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
