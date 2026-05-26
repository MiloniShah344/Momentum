export default function ProgressPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center">
        <p className="text-5xl mb-4">📈</p>
        <h1
          className="text-2xl font-black mb-2"
          style={{ color: 'var(--text)' }}
        >
          Progress
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Strength charts and PRs — coming in Phase 9
        </p>
      </div>
    </main>
  );
}
