import React from "react";
import { ShieldCheck, TrendingUp, AlertOctagon } from "lucide-react";

const ScenarioToggle = ({ activeScenario, onChange, scenarios = {} }) => {
  const options = [
    {
      id: "pessimistic",
      label: "Pessimistic",
      icon: AlertOctagon,
      colorClass: "border-burgundy-500 text-burgundy-900 bg-burgundy-50",
      activeBg: "bg-burgundy-100 font-bold border-2 border-burgundy-600",
      desc: "High churn, +20% competition, 1mo product delay",
    },
    {
      id: "realistic",
      label: "Realistic",
      icon: ShieldCheck,
      colorClass: "border-brass-500 text-ink-900 bg-surface-container-low",
      activeBg: "bg-brass-100 font-bold border-2 border-brass-600",
      desc: "Base assumptions without inflation or delays",
    },
    {
      id: "optimistic",
      label: "Optimistic",
      icon: TrendingUp,
      colorClass: "border-ink-600 text-ink-900 bg-ink-50",
      activeBg: "bg-ink-100 font-bold border-2 border-ink-800",
      desc: "Lower churn, +40% conversion, high efficiency",
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 sm:p-4 shadow-soft mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700">
            Simulated Growth Scenarios
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Switch scenarios to see how your startup withstands market adversity or capitalizes on traction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeScenario === opt.id;
          const scenarioData = scenarios[opt.id] || {};
          const endingCash = scenarioData.summary?.finalEndingCash;
          const isExhausted = scenarioData.summary?.cashExhaustedMonth !== null && scenarioData.summary?.cashExhaustedMonth !== undefined;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-3 rounded-lg border transition text-left flex flex-col justify-between focus:outline-none ${
                isActive
                  ? opt.activeBg + " shadow-card scale-[1.01]"
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-headline text-sm font-bold text-ink-900">
                  <Icon size={16} className={opt.id === "pessimistic" ? "text-burgundy-600" : opt.id === "optimistic" ? "text-ink-600" : "text-brass-600"} />
                  <span>{opt.label}</span>
                </div>
                {endingCash !== undefined && (
                  <span className={`font-data text-xs font-semibold ${isExhausted ? "text-burgundy-600" : "text-ink-700"}`}>
                    ${endingCash?.toLocaleString()} cash
                  </span>
                )}
              </div>

              <p className="text-[0.7rem] text-ink-500 line-clamp-1">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioToggle;
