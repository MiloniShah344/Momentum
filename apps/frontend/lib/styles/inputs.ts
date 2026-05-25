export const inputBase: React.CSSProperties = {
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

export const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.border = '1px solid var(--primary)';
  e.target.style.boxShadow = '0 0 0 3px var(--bg-hover)';
};

export const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.border = '1px solid var(--border)';
  e.target.style.boxShadow = 'none';
};

export const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[color:var(--text-4)]';
