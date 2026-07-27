import React, { useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

const WarningsBanner = ({ warnings = [] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!warnings || warnings.length === 0) {
    return (
      <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 sm:p-4 mb-6 flex items-center gap-3">
        <CheckCircle2 className="text-ink-600 shrink-0" size={18} />
        <span className="text-xs font-semibold text-ink-900">
          Unit Economics Check: All 12 months passed without critical cash exhaustion or fatal capacity limits.
        </span>
      </div>
    );
  }

  const criticalCount = warnings.filter((w) => w.severity === "critical").length;
  const warningCount = warnings.length - criticalCount;

  return (
    <div className={`border rounded-lg mb-6 transition-all ${
      criticalCount > 0 ? "bg-burgundy-50 border-burgundy-300" : "bg-brass-50 border-brass-300"
    }`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <AlertTriangle className="text-burgundy-600 shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-brass-700 shrink-0" size={20} />
          )}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              criticalCount > 0 ? "text-burgundy-900" : "text-brass-900"
            }`}>
              {criticalCount > 0 ? `${criticalCount} Critical Alert(s) Detected` : `${warningCount} Operational Warning(s) Detected`}
            </h4>
            <p className={`text-xs mt-0.5 ${
              criticalCount > 0 ? "text-burgundy-800" : "text-brass-900"
            }`}>
              {warnings[0]?.message} {warnings.length > 1 && `(+${warnings.length - 1} more)`}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded hover:bg-black/5 transition"
          title={expanded ? "Collapse warnings" : "Expand warnings"}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-black/10 p-3 sm:p-4 space-y-2 bg-white/50">
          {warnings.map((w, index) => (
            <div
              key={index}
              className={`p-2.5 rounded text-xs flex items-start gap-2.5 ${
                w.severity === "critical"
                  ? "bg-burgundy-100/70 text-burgundy-900 font-medium border border-burgundy-200"
                  : "bg-brass-100/70 text-brass-900 font-medium border border-brass-200"
              }`}
            >
              <span className="font-data font-bold px-1.5 py-0.5 rounded bg-white/80 text-[0.65rem] shrink-0">
                M{w.month}
              </span>
              <span className="leading-relaxed">{w.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarningsBanner;
