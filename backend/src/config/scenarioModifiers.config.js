/**
 * Scenario Modifiers Configuration — Canonical Source of Truth
 *
 * This file defines the exact percentage modifiers and additive deltas used to
 * generate Pessimistic and Optimistic simulation variants from user base assumptions.
 * Any modification to scenario calculation bounds MUST be made here.
 */

const SCENARIO_ADJUSTMENTS = {
  pessimistic: {
    label: "Pessimistic",
    description: "Macroeconomic stress test with higher acquisition friction, increased churn, and cost inflation.",
    // Empirical rationale: Ad-network CPM spikes and early-stage wage drift during venture downturns
    conversionRateMultiplier: 0.70,       // -30% conversion efficiency stress
    monthlyChurnMultiplier: 1.30,         // +30% customer churn rate
    marketingEffectivenessMultiplier: 0.70,// -30% lead generation yield
    competitionPressureAdd: 0.2,          // +20% competitive pressure index
    costInflationMultiplier: 1.10,        // +10% operational cost inflation
    salaryInflationMultiplier: 1.10,      // +10% salary inflation drift
    priceMultiplier: 0.9,                 // -10% pricing power / discounting required
    delayMonths: 1,                       // 1 month delay on all product milestones
  },
  realistic: {
    label: "Realistic",
    description: "Base deterministic simulation executing founder assumptions as specified.",
    conversionRateMultiplier: 1.0,
    monthlyChurnMultiplier: 1.0,
    marketingEffectivenessMultiplier: 1.0,
    competitionPressureAdd: 0,
    costInflationMultiplier: 1.0,
    salaryInflationMultiplier: 1.0,
    priceMultiplier: 1.0,
    delayMonths: 0,
  },
  optimistic: {
    label: "Optimistic",
    description: "Favorable product-market fit tailwinds with improved virality and lower acquisition cost.",
    conversionRateMultiplier: 1.4,        // +40% conversion efficiency
    monthlyChurnMultiplier: 0.6,          // -40% customer churn rate
    marketingEffectivenessMultiplier: 1.3,// +30% lead generation yield
    competitionPressureAdd: -0.15,        // -15% competitive pressure index
    costInflationMultiplier: 0.95,        // -5% operational efficiency savings
    salaryInflationMultiplier: 0.95,      // -5% hiring efficiency savings
    priceMultiplier: 1.0,                 // Standard pricing maintained
    delayMonths: 0,                       // On-time milestone execution
  },
};

module.exports = {
  SCENARIO_ADJUSTMENTS,
};
