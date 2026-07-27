import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Sliders,
  ChevronDown,
  ChevronUp,
  BarChart2,
  DollarSign,
  Users,
  Target,
  PieChart,
  Activity,
  Zap,
} from "lucide-react";
import Badge from "../ui/Badge.jsx";

const getTone = (score) => {
  if (score >= 80) return "green";
  if (score >= 65) return "blue";
  if (score >= 50) return "yellow";
  return "red";
};

const getCategoryIcon = (catName) => {
  if (catName.includes("Market")) return PieChart;
  if (catName.includes("Customer Problem")) return Target;
  if (catName.includes("Traction")) return Users;
  if (catName.includes("Business Model")) return DollarSign;
  if (catName.includes("Unit Economics")) return BarChart2;
  if (catName.includes("Sustainability")) return Activity;
  return Zap;
};

export default function StartupScorerDashboard({ scoreData, startupName }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showConfidenceReasons, setShowConfidenceReasons] = useState(false);

  if (!scoreData) {
    return (
      <div className="rounded border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-on-surface-variant font-semibold">
          No startup readiness score available yet for this simulation.
        </p>
      </div>
    );
  }

  const {
    overallScore = 0,
    opportunityScore = overallScore,
    viabilityScore = overallScore,
    cashExhaustedMonth = null,
    classification = "Evaluating...",
    confidence = { level: "Medium", score: 70, reasons: [] },
    breakdown = {},
    recommendations = [],
    sensitivityAnalysis = [],
    scenarioScores = { pessimistic: overallScore, realistic: overallScore, optimistic: overallScore },
  } = scoreData;

  const categories = Object.values(breakdown);

  return (
    <div className="space-y-8">
      {/* ── Top Score Banner & Disclaimer ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-8 text-surface shadow-glass relative overflow-hidden border border-brass-500/30 paper-grain"
      >
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brass-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brass-300 border border-brass-500/30">
              <Award size={14} className="text-brass-400" />
              Simulation-Based Startup Readiness Score
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white">
              {classification}
            </h2>
            <p className="text-sm text-on-surface-variant/90 leading-relaxed">
              This score evaluates how well <strong>{startupName}</strong> performs against predefined business criteria under your 12-month simulation assumptions. It is a decision-support readiness assessment, not a guaranteed success prediction.
            </p>

            {/* Confidence popover toggle */}
            <div className="pt-2">
              <button
                onClick={() => setShowConfidenceReasons(!showConfidenceReasons)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brass-400 hover:text-brass-300 transition-colors bg-white/5 px-2.5 py-1 rounded border border-white/10"
              >
                <HelpCircle size={13} />
                Score Confidence: <span className="text-white font-bold">{confidence.level} ({confidence.score}/100)</span>
                {showConfidenceReasons ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Big Dual Score Display */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
            {/* Opportunity Score Box */}
            <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[150px] text-center shadow-card">
              <span className="text-[11px] uppercase tracking-widest font-bold text-brass-300">Opportunity Score</span>
              <span className="text-[10px] text-on-surface-variant/80 mb-1">Idea Quality</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-data text-4xl font-black tracking-tight text-white drop-shadow-md">
                  {opportunityScore}
                </span>
                <span className="text-sm font-bold text-on-surface-variant/70">/100</span>
              </div>
            </div>

            {/* Viability Score Box */}
            <div className="flex flex-col items-center justify-center bg-surface-container-lowest/15 backdrop-blur-md rounded-2xl p-5 border border-brass-400/30 min-w-[170px] text-center shadow-card relative overflow-hidden">
              {cashExhaustedMonth && (
                <div className="absolute top-0 right-0 left-0 bg-red-600 text-white text-[9px] font-black uppercase py-0.5 tracking-wider">
                  Insolvency Risk
                </div>
              )}
              <span className="text-[11px] uppercase tracking-widest font-bold text-brass-300 mt-1">Viability Score</span>
              <span className="text-[10px] text-on-surface-variant/80 mb-1">Plan Survival</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-data text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {viabilityScore}
                </span>
                <span className="text-sm font-bold text-on-surface-variant/70">/100</span>
              </div>
              <div className="mt-2.5">
                <Badge tone={getTone(viabilityScore)}>{classification}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Insolvency Caveat Banner */}
        {cashExhaustedMonth && (
          <div className="mt-6 rounded-lg bg-red-950/80 border border-red-500/50 p-4 text-white flex items-start gap-3 relative z-10">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-200 uppercase tracking-wider text-[11px]">
                Critical Survival Caveat — Cash Exhausted in Month {cashExhaustedMonth}
              </p>
              <p className="text-red-100/90 leading-relaxed">
                While the underlying opportunity is rated at <strong>{opportunityScore}/100</strong>, the current operational burn and capitalization plan exhausts cash in Month {cashExhaustedMonth}, reducing plan viability to <strong>{viabilityScore}/100</strong>. To unlock a higher readiness rating, reduce fixed expenses or increase starting capital.
              </p>
            </div>
          </div>
        )}

        {/* Confidence Reasons Dropdown */}
        <AnimatePresence>
          {showConfidenceReasons && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-white/10 pt-4 space-y-2 text-xs text-on-surface-variant"
            >
              <p className="font-semibold text-brass-300">Why this confidence rating?</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {(confidence.reasons || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Scenario Readiness Comparison Bar ── */}
      <div className="space-y-3">
        <h3 className="font-headline text-lg font-bold text-ink-900 flex items-center gap-2">
          <Sliders size={18} className="text-brass-600" />
          Scenario Score Comparison
        </h3>
        <p className="text-xs text-on-surface-variant">
          See how your startup readiness score changes under different 12-month simulation outcomes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pessimistic */}
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 flex items-center justify-between shadow-xs border-l-4 border-l-red-500">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">Pessimistic Scenario</p>
              <p className="text-xs text-on-surface-variant mt-0.5">High friction & churn</p>
            </div>
            <div className="text-right">
              <span className="font-data text-2xl font-bold text-ink-900">{scenarioScores.pessimistic || 0}</span>
              <span className="text-xs text-on-surface-variant">/100</span>
            </div>
          </div>

          {/* Realistic */}
          <div className="rounded-lg border border-brass-400 bg-brass-50/40 p-4 flex items-center justify-between shadow-xs border-l-4 border-l-brass-500">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brass-800">Realistic (Base)</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Your primary simulation</p>
            </div>
            <div className="text-right">
              <span className="font-data text-2xl font-bold text-ink-900">{scenarioScores.realistic || overallScore}</span>
              <span className="text-xs text-on-surface-variant">/100</span>
            </div>
          </div>

          {/* Optimistic */}
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 flex items-center justify-between shadow-xs border-l-4 border-l-emerald-500">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Optimistic Scenario</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Viral adoption & low CAC</p>
            </div>
            <div className="text-right">
              <span className="font-data text-2xl font-bold text-ink-900">{scenarioScores.optimistic || 0}</span>
              <span className="text-xs text-on-surface-variant">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown & "Why This Score?" ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-headline text-lg font-bold text-ink-900 flex items-center gap-2">
              <BarChart2 size={18} className="text-brass-600" />
              Category Score Breakdown & Evidence
            </h3>
            <p className="text-xs text-on-surface-variant">
              Click any category to expand detailed strengths, risks, and simulation evidence.
            </p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">Total: 100 max points</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.category || "");
            const isExpanded = expandedCategory === idx;
            const percentage = Math.round((cat.score / cat.maxScore) * 100);

            return (
              <div
                key={idx}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-xs transition-all hover:border-brass-300"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none bg-surface/50 hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass-100 text-brass-800">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 pr-4">
                        <span className="font-semibold text-ink-900 text-sm md:text-base truncate">{cat.category}</span>
                        <span className="font-data font-bold text-ink-900 text-sm whitespace-nowrap">
                          {cat.score} <span className="text-xs text-on-surface-variant font-normal">/ {cat.maxScore} pts</span>
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-2 w-full max-w-md rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-brass-500" : percentage >= 40 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 text-on-surface-variant">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-outline-variant/60 bg-surface-container-lowest p-5 space-y-4 text-sm"
                    >
                      {/* Explanation */}
                      <div className="rounded bg-surface-container-low p-3.5 border-l-4 border-l-brass-500">
                        <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Assessment</p>
                        <p className="text-ink-800 leading-relaxed">{cat.explanation || "No explanation provided."}</p>
                      </div>

                      {/* Strengths & Weaknesses Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Strengths
                          </p>
                          {cat.strengths && cat.strengths.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-ink-800">
                              {cat.strengths.map((str, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-on-surface-variant italic">No major strengths identified.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Risks & Weaknesses
                          </p>
                          {cat.weaknesses && cat.weaknesses.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-ink-800">
                              {cat.weaknesses.map((wk, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>{wk}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-on-surface-variant italic">No major risks identified.</p>
                          )}
                        </div>
                      </div>

                      {/* Simulation Evidence */}
                      {cat.metrics && Object.keys(cat.metrics).length > 0 && (
                        <div className="pt-2 border-t border-outline-variant/40">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                            Simulated Metrics Evidence
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(cat.metrics).map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center gap-1.5 rounded bg-surface px-2.5 py-1 text-xs font-data text-ink-800 border border-outline-variant"
                              >
                                <span className="text-on-surface-variant font-sans capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                                <strong>{typeof v === "number" && v > 1000 ? v.toLocaleString() : String(v)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actionable Recommendations ── */}
      {recommendations && recommendations.length > 0 && (
        <div className="rounded-xl border border-brass-300 bg-gradient-to-r from-brass-50 via-surface-container-lowest to-brass-50 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brass-600 text-white shadow-xs">
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-ink-900">Top Prioritized Recommendations</h3>
              <p className="text-xs text-on-surface-variant">
                Targeted actions to improve your lowest scoring categories before launching.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg bg-surface p-4 border border-outline-variant/80 flex flex-col justify-between shadow-2xs hover:border-brass-400 transition-colors"
              >
                <div>
                  <span className="inline-block rounded bg-brass-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass-900 mb-2">
                    {rec.category}
                  </span>
                  <h4 className="font-semibold text-ink-900 text-sm mb-1.5">{rec.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{rec.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Score Sensitivity Analysis Calculator ── */}
      {sensitivityAnalysis && sensitivityAnalysis.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-ink-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-brass-600" />
              Score Sensitivity Analysis
            </h3>
            <p className="text-xs text-on-surface-variant">
              What parameter tweaks could improve your readiness score the most? Simulated delta impacts:
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="p-3.5 pl-5">Simulated Action</th>
                  <th className="p-3.5">Why this moves the needle</th>
                  <th className="p-3.5 text-right pr-5">Simulated Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {sensitivityAnalysis.map((sens, i) => {
                  const isPositive = sens.impactDelta > 0;
                  const isNegative = sens.impactDelta < 0;
                  return (
                    <tr key={i} className={`hover:bg-surface/60 transition-colors ${isNegative ? 'bg-red-50/20' : ''}`}>
                      <td className="p-3.5 pl-5 font-semibold text-ink-900 whitespace-nowrap">
                        {sens.action}
                      </td>
                      <td className="p-3.5 text-xs text-on-surface-variant/90 max-w-md leading-relaxed">
                        {sens.description}
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-data font-bold text-ink-900">
                            {sens.newScore} <span className="text-xs font-normal text-on-surface-variant">/100</span>
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : sens.impactDelta === 0
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isPositive ? `+${sens.impactDelta} pts` : `${sens.impactDelta} pts`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
