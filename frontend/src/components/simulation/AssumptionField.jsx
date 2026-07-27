import React from "react";

const AssumptionField = ({
  label,
  name,
  value,
  onChange,
  type = "number",
  min,
  max,
  step = "any",
  options = null,
  source = "default",
  prefix = "",
  suffix = "",
  helperText = "",
  disabled = false,
}) => {
  const getBadge = () => {
    if (source === "extracted") {
      return <span className="badge-extracted ml-2">Extracted</span>;
    }
    if (source === "default") {
      return <span className="badge-default ml-2">Default</span>;
    }
    if (source === "modified" || source === "user") {
      return (
        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider ml-2">
          Custom
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-1.5 mb-3">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center">
          {label}
          {getBadge()}
        </label>
      </div>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-ink-500 font-data select-none">
            {prefix}
          </span>
        )}

        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-medium text-ink-900 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 disabled:opacity-50"
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ""}
            onChange={(e) => {
              const val =
                type === "number"
                  ? e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                  : e.target.value;
              onChange(name, val, "user");
            }}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={`w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 text-sm font-data font-medium text-ink-900 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 disabled:opacity-50 ${
              prefix ? "pl-7" : "pl-3"
            } ${suffix ? "pr-12" : "pr-3"}`}
          />
        )}

        {suffix && (
          <span className="absolute right-3 text-xs text-ink-500 font-data select-none">
            {suffix}
          </span>
        )}
      </div>

      {helperText && <p className="text-[0.75rem] text-ink-500 italic">{helperText}</p>}
    </div>
  );
};

export default AssumptionField;
