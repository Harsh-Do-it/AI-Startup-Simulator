export default function Input({ label, error, type = "text", registration, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full rounded border bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition focus:ring-2 ${
          error
            ? "border-burgundy-400 focus:ring-burgundy-200"
            : "border-outline-variant focus:border-brass-500 focus:ring-brass-100"
        }`}
        {...registration}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-burgundy-500">{error}</p>}
    </div>
  );
}
