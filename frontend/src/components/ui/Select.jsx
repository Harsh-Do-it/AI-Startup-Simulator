export default function Select({ label, error, options, registration, ...rest }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded border bg-surface-container-lowest px-4 py-2.5 text-sm outline-none focus:ring-2 ${
          error
            ? "border-burgundy-400 focus:ring-burgundy-200"
            : "border-outline-variant focus:border-brass-500 focus:ring-brass-100"
        }`}
        {...registration}
        {...rest}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-burgundy-500">{error}</p>}
    </div>
  );
}
