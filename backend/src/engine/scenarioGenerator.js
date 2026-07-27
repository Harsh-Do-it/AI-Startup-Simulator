/**
 * Scenario Generator
 *
 * Takes base assumptions and produces pessimistic, realistic, and optimistic
 * variants by adjusting key parameters. Then runs the simulation engine
 * for each scenario.
 *
 * Even the optimistic scenario has realistic limits — no exponential growth
 * without capacity constraints.
 */

const { runSimulation } = require("./simulationEngine");
const { SCENARIO_ADJUSTMENTS } = require("../config/scenarioModifiers.config");

/**
 * Apply scenario adjustments to base assumptions.
 *
 * @param {object} baseAssumptions - The user's confirmed assumptions
 * @param {object} adjustments - Scenario adjustment factors
 * @returns {object} Modified assumptions for this scenario
 */
const applyAdjustments = (baseAssumptions, adjustments) => {
  const modified = JSON.parse(JSON.stringify(baseAssumptions)); // Deep clone

  // Core metrics
  modified.conversionRate = modified.conversionRate * adjustments.conversionRateMultiplier;
  modified.monthlyChurn = modified.monthlyChurn * adjustments.monthlyChurnMultiplier;
  modified.price = Math.round(modified.price * adjustments.priceMultiplier * 100) / 100;

  // Competition
  modified.competitionPressure = Math.max(
    0,
    Math.min(1, (modified.competitionPressure || 0.5) + adjustments.competitionPressureAdd)
  );

  // Marketing channel effectiveness
  if (modified.marketingChannels) {
    modified.marketingChannels = modified.marketingChannels.map((ch) => ({
      ...ch,
      baseConversionRate: (ch.baseConversionRate || modified.conversionRate)
        * adjustments.marketingEffectivenessMultiplier,
    }));
  }

  // Cost inflation
  if (modified.fixedCosts) {
    Object.keys(modified.fixedCosts).forEach((key) => {
      if (typeof modified.fixedCosts[key] === "number") {
        modified.fixedCosts[key] = Math.round(
          modified.fixedCosts[key] * adjustments.costInflationMultiplier
        );
      }
    });
  }

  if (modified.hiringPlan && Array.isArray(modified.hiringPlan)) {
    const salaryMult = adjustments.salaryInflationMultiplier || adjustments.costInflationMultiplier || 1.0;
    modified.hiringPlan = modified.hiringPlan.map((h) => ({
      ...h,
      monthlyCost: Math.round((h.monthlyCost || 0) * salaryMult),
      salary: Math.round((h.salary || 0) * salaryMult),
    }));
  }

  modified.variableCostPerCustomer = Math.round(
    (modified.variableCostPerCustomer || 0) * adjustments.costInflationMultiplier * 100
  ) / 100;

  // Product delays
  if (adjustments.delayMonths > 0 && modified.milestones) {
    modified.milestones = modified.milestones.map((m) => {
      const origMonth = m.expectedMonth || m.month || 0;
      return {
        ...m,
        expectedMonth: origMonth + adjustments.delayMonths,
        month: origMonth + adjustments.delayMonths,
      };
    });
  }

  return modified;
};

/**
 * Generate all three scenarios from base assumptions.
 *
 * @param {object} baseAssumptions - The user's confirmed assumptions
 * @returns {{ pessimistic, realistic, optimistic }} Each containing monthlySimulation, summary, warnings
 */
const generateAllScenarios = (baseAssumptions) => {
  const scenarios = {};

  for (const [key, adjustments] of Object.entries(SCENARIO_ADJUSTMENTS)) {
    const adjusted = applyAdjustments(baseAssumptions, adjustments);
    const result = runSimulation(adjusted);

    scenarios[key] = {
      label: adjustments.label,
      assumptions: adjusted,
      monthlySimulation: result.monthlySimulation,
      summary: result.summary,
      warnings: result.warnings,
    };
  }

  return scenarios;
};

module.exports = {
  SCENARIO_ADJUSTMENTS,
  applyAdjustments,
  generateAllScenarios,
};
