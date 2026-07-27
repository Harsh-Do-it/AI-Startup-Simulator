const tones = {
  green: "bg-surface-container text-ink-600 border-ink-200",
  blue: "bg-surface-container text-ink-700 border-outline-variant",
  yellow: "bg-brass-50 text-brass-700 border-brass-200",
  red: "bg-burgundy-50 text-burgundy-700 border-burgundy-200",
  slate: "bg-surface-container-highest text-on-surface-variant border-outline-variant",
};

export default function Badge({ children, tone = "slate", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
        tones[tone] || tones.slate
      } ${className}`}
    >
      {children}
    </span>
  );
}
