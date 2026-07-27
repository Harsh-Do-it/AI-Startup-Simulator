export default function Textarea({ label, error, rows = 4, registration, helperText, ...rest }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full resize-none rounded border bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 ${
          error
            ? "border-burgundy-400 focus:ring-burgundy-200"
            : "border-outline-variant focus:border-brass-500 focus:ring-brass-100"
        }`}
        {...registration}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-burgundy-500">{error}</p>
      ) : (
        helperText && <p className="mt-1.5 text-xs text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
}
