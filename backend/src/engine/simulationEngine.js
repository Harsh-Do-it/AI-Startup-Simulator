/**
 * Simulation Engine — Core Deterministic 12-Month Startup Simulation
 *
 * This is the heart of the system. It takes a validated assumptions object
 * and produces 12 months of deterministic financial projections.
 *
 * PRINCIPLE: Every number is calculated from explicit assumptions.
 * The AI NEVER generates these numbers — only the engine does.
 *
 * Growth stages apply multiplicative modifiers:
 *   Stage 1 (Validation)       — Months 1-2:   Low conversion, high CAC
 *   Stage 2 (Early Traction)   — Months 3-5:   Improving conversion, testing channels
 *   Stage 3 (PMF Learning)     — Months 6-8:   Retention matters, churn affects growth
 *   Stage 4 (Expansion)        — Months 9-12:  Growth may accelerate or stabilize
 */

const { calculateAllChannels } = require("./marketingChannels");
const { calculateTeamCapacity, applyCapacityConstraints, calculateSalaryCosts, calculateSalesHeadcountCost } = require("./capacityModel");

// ─── Stage Definitions ────────────────────────────────────────────────────────

const STAGES = [
  { name: "Validation", startMonth: 1, endMonth: 2, conversionMod: 0.5, cacMod: 1.5, churnMod: 1.0 },
  { name: "Early Traction", startMonth: 3, endMonth: 5, conversionMod: 0.75, cacMod: 1.2, churnMod: 1.1 },
  { name: "Product-Market Learning", startMonth: 6, endMonth: 8, conversionMod: 1.0, cacMod: 1.0, churnMod: 1.0 },
  { name: "Expansion", startMonth: 9, endMonth: 12, conversionMod: 1.1, cacMod: 0.9, churnMod: 0.95 },
];

const getStage = (month) => {
  return STAGES.find((s) => month >= s.startMonth && month <= s.endMonth) || STAGES[3];
};

// ─── Revenue Calculation by Business Model ───────────────────────────────────

const calculateRevenue = (activeCustomers, assumptions) => {
  const { businessModel, price } = assumptions;
  const model = (businessModel || "").toLowerCase();

  if (model.includes("subscription") || model.includes("saas")) {
    return activeCustomers * price;
  }

  if (model.includes("marketplace")) {
    const avgTransactionValue = price;
    const takeRate = assumptions.takeRate || 0.15;
    const transactionsPerCustomer = assumptions.transactionsPerCustomer || 2;
    const grossTV = activeCustomers * transactionsPerCustomer * avgTransactionValue;
    return Math.round(grossTV * takeRate);
  }

  if (model.includes("freemium")) {
    const conversionToPayingRate = assumptions.freemiumConversion || 0.05;
    const payingCustomers = Math.round(activeCustomers * conversionToPayingRate);
    return payingCustomers * price;
  }

  if (model.includes("one-time") || model.includes("ecommerce") || model.includes("e-commerce")) {
    // Only new customers generate revenue for one-time purchase models
    // But we still need activeCustomers for retention/repeat tracking
    const repeatRate = assumptions.repeatPurchaseRate || 0.1;
    const purchasesFromExisting = Math.round((activeCustomers - (assumptions._newCustomersThisMonth || 0)) * repeatRate);
    const newPurchases = assumptions._newCustomersThisMonth || 0;
    return (newPurchases + purchasesFromExisting) * price;
  }

  // Default: subscription-like
  return activeCustomers * price;
};

// ─── Competition Pressure Impact ─────────────────────────────────────────────

const applyCompetitionPressure = (assumptions, month) => {
  const pressure = assumptions.competitionPressure || 0.5; // 0 = no competition, 1 = intense
  const baseGrowthRate = 0.02; // Competition increases 2% per month at max pressure

  // Competition gradually increases over time
  const monthlyIncrease = pressure * baseGrowthRate * Math.min(month, 8);
  const effectivePressure = Math.min(1, pressure + monthlyIncrease);

  return {
    cacMultiplier: 1 + effectivePressure * 0.3,        // CAC increases up to 30%
    conversionMultiplier: 1 - effectivePressure * 0.15, // Conversion drops up to 15%
    churnMultiplier: 1 + effectivePressure * 0.1,       // Churn increases up to 10%
    effectivePressure: Math.round(effectivePressure * 100) / 100,
  };
};

// ─── Product Milestone Impacts & Delays (Option A) ───────────────────────────

const checkMilestoneDelays = (milestones, month) => {
  if (!milestones || milestones.length === 0) {
    return { isDelayed: false, delayPenalty: 1.0, conversionBoost: 1.0, churnMultiplier: 1.0, cplMultiplier: 1.0, priceMultiplier: 1.0, overdueMilestones: [] };
  }

  let conversionBoost = 1.0;
  let churnMultiplier = 1.0;
  let cplMultiplier = 1.0;
  let priceMultiplier = 1.0;

  // Option A: Explicit founder-picked impactType and value
  for (const m of milestones) {
    const mMonth = m.expectedMonth || m.month || 0;
    if (mMonth > 0 && mMonth <= month) {
      const val = Number(m.value || 0);
      const pct = val > 1 ? val / 100 : val;
      if (m.impactType === "conversion_boost" || m.impactType === "conversion") {
        conversionBoost *= (1 + pct);
      } else if (m.impactType === "churn_reduction" || m.impactType === "retention" || m.impactType === "retention_boost") {
        churnMultiplier *= Math.max(0.2, 1 - pct);
      } else if (m.impactType === "cpl_reduction" || m.impactType === "cpl") {
        cplMultiplier *= Math.max(0.2, 1 - pct);
      } else if (m.impactType === "pricing" || m.impactType === "price_increase") {
        priceMultiplier *= (1 + pct);
      }
    }
  }

  // Find milestones that should have been completed by now
  const overdueMilestones = milestones.filter(
    (m) => (m.expectedMonth || m.month || 0) < month && m.completed === false && (!m.impactType || m.impactType === "none")
  );

  const penalty = overdueMilestones.length > 0 ? Math.max(0.3, 1 - overdueMilestones.length * 0.2) : 1.0;

  return {
    isDelayed: overdueMilestones.length > 0,
    delayPenalty: penalty,
    conversionBoost,
    churnMultiplier,
    cplMultiplier,
    priceMultiplier,
    overdueMilestones,
  };
};

// ─── Main Simulation Function ────────────────────────────────────────────────

/**
 * Run the 12-month simulation.
 *
 * @param {object} assumptions - The full assumptions object
 * @returns {{ monthlySimulation: Array, summary: object, warnings: Array }}
 */
const runSimulation = (assumptions) => {
  if (assumptions.grossMarginPct === undefined || assumptions.grossMarginPct === null || isNaN(assumptions.grossMarginPct)) {
    throw new Error("grossMarginPct is required and must be populated before running simulation.");
  }

  const {
    startingCapital,
    price,
    monthlyChurn,
    conversionRate,
    marketingChannels,
    fixedCosts = {},
    variableCostPerCustomer = 0,
    teamSize = 2,
    hiringPlan = [],
    milestones = [],
    paymentProcessingRate = 0.029,
  } = assumptions;

  const monthlyResults = [];
  const warnings = [];

  let activeCustomers = assumptions.initialCustomers || 0;
  let currentCash = startingCapital;
  let cashExhausted = false;

  for (let month = 1; month <= 12; month++) {
    const stage = getStage(month);
    const competition = applyCompetitionPressure(assumptions, month);
    const milestoneCheck = checkMilestoneDelays(milestones, month);

    // ── Team & Capacity ──
    const team = calculateTeamCapacity(teamSize, hiringPlan, month);

    // ── Marketing & Lead Generation ──
    // Apply stage, competition, and milestone modifiers to channels
    const adjustedChannels = (marketingChannels || []).map((ch) => ({
      ...ch,
      baseCostPerLead: Math.max(0.1, (ch.baseCostPerLead || 8) * milestoneCheck.cplMultiplier),
      baseConversionRate: Math.min(0.8, (ch.baseConversionRate || conversionRate)
        * stage.conversionMod
        * competition.conversionMultiplier
        * milestoneCheck.delayPenalty
        * milestoneCheck.conversionBoost),
      // If cash is exhausted, cut marketing budget
      budget: cashExhausted ? 0 : ch.budget,
    }));

    const marketing = calculateAllChannels(adjustedChannels, month, activeCustomers);

    // ── New Customers (with capacity constraints) ──
    const capacity = applyCapacityConstraints(
      marketing.totalNewCustomers,
      activeCustomers,
      team.totalCapacity
    );

    const newCustomers = capacity.cappedNewCustomers;

    // ── Churn ──
    const effectiveChurnRate = monthlyChurn * stage.churnMod * competition.churnMultiplier * milestoneCheck.churnMultiplier;
    const churnedCustomers = Math.round(activeCustomers * effectiveChurnRate);

    // ── Update Active Customers ──
    activeCustomers = Math.max(0, activeCustomers + newCustomers - churnedCustomers);

    // ── Revenue ──
    const effectivePrice = Math.round(price * (milestoneCheck.priceMultiplier || 1.0) * 100) / 100;
    // Temporarily stash newCustomers for one-time purchase models
    assumptions._newCustomersThisMonth = newCustomers;
    const revenue = Math.round(calculateRevenue(activeCustomers, { ...assumptions, price: effectivePrice }));
    delete assumptions._newCustomersThisMonth;

    // ── Costs ──
    const salaries = calculateSalaryCosts(
      fixedCosts.salaries || 0,
      hiringPlan,
      month
    );
    const softwareTools = fixedCosts.softwareTools || 0;
    const officeCost = fixedCosts.office || 0;
    const adminExpenses = fixedCosts.admin || 0;
    const totalFixedCosts = salaries + softwareTools + officeCost + adminExpenses;

    const infraCost = activeCustomers * variableCostPerCustomer;
    const paymentProcessing = Math.round(revenue * paymentProcessingRate);
    const totalVariableCosts = Math.round(infraCost + paymentProcessing);

    const totalMarketingCost = marketing.totalMarketingCost;
    const salesHeadcountCost = calculateSalesHeadcountCost(hiringPlan, month);
    const totalExpenses = totalFixedCosts + totalVariableCosts + totalMarketingCost;

    // ── Cash Flow ──
    const beginningCash = currentCash;
    currentCash = currentCash + revenue - totalExpenses;

    const burn = Math.max(0, totalExpenses - revenue);
    const isCashFlowPositive = revenue >= totalExpenses;

    // ── Cash Exhaustion Check ──
    if (currentCash <= 0 && !cashExhausted) {
      cashExhausted = true;
      warnings.push({
        type: "cash_exhaustion",
        month,
        message: `At the current assumptions, the startup runs out of cash during Month ${month}.`,
        severity: "critical",
      });
    }

    const isInsolvent = currentCash <= 0 || cashExhausted;
    const runway = isInsolvent ? "insolvent" : (burn > 0 ? Math.round((currentCash / burn) * 10) / 10 : null);

    // ── CAC & LTV (Fully Loaded vs Marketing Only & Margin Adjusted) ──
    const cac_marketingOnly = newCustomers > 0
      ? Math.round((totalMarketingCost / newCustomers) * 100) / 100
      : 0;
    const cac_fullyLoaded = newCustomers > 0
      ? Math.round(((totalMarketingCost + salesHeadcountCost) / newCustomers) * 100) / 100
      : 0;
    const cac = cac_fullyLoaded; // Canonical CAC for scoring/unit economics

    const effectiveMonthlyChurn = effectiveChurnRate;
    const avgCustomerLifetimeMonths = effectiveMonthlyChurn > 0
      ? 1 / effectiveMonthlyChurn
      : 24; // Cap at 2 years if no churn

    // Gross margin adjusted LTV
    const variableCostPerUser = activeCustomers > 0 ? (totalVariableCosts / activeCustomers) : 0;
    const grossMarginPct = assumptions.grossMarginPct;
    const ltv = Math.round(price * grossMarginPct * Math.min(avgCustomerLifetimeMonths, 36) * 100) / 100;

    // ── Warnings ──
    if (month >= 3 && cac > 0 && ltv > 0 && ltv / cac < 1) {
      warnings.push({
        type: "ltv_cac_unhealthy",
        month,
        message: `Month ${month}: LTV/CAC ratio is ${(ltv / cac).toFixed(1)} (below 1.0). Customer acquisition is not sustainable at current economics.`,
        severity: "warning",
      });
    }

    if (runway !== null && runway <= 2 && !cashExhausted) {
      warnings.push({
        type: "low_runway",
        month,
        message: `Month ${month}: Cash runway is only ${runway} months at current burn rate.`,
        severity: "critical",
      });
    }

    if (capacity.isAtCapacity) {
      warnings.push({
        type: "capacity_limit",
        month,
        message: `Month ${month}: Team capacity is at ${Math.round(capacity.capacityUtilization * 100)}%. Growth is being throttled. Consider hiring.`,
        severity: "warning",
      });
    }

    // ── Monthly Result ──
    monthlyResults.push({
      month,
      stage: stage.name,

      // Customers
      newCustomers,
      activeCustomers,
      churnedCustomers,
      leads: marketing.totalLeads,
      effectiveConversionRate: Math.round(
        (marketing.totalLeads > 0 ? newCustomers / marketing.totalLeads : 0) * 10000
      ) / 100,
      effectiveChurnRate: Math.round(effectiveChurnRate * 10000) / 10000,
      price: effectivePrice,

      // Revenue
      revenue,
      grossProfit: Math.round(revenue * grossMarginPct),

      // Costs
      fixedCosts: totalFixedCosts,
      variableCosts: totalVariableCosts,
      marketingCosts: totalMarketingCost,
      totalExpenses,

      // Cost breakdown
      costBreakdown: {
        salaries,
        softwareTools,
        office: officeCost,
        admin: adminExpenses,
        infrastructure: Math.round(infraCost),
        paymentProcessing,
        marketing: totalMarketingCost,
      },

      // Cash
      beginningCash: Math.round(beginningCash),
      endingCash: Math.round(currentCash),
      burn: Math.round(burn),
      runway,
      isCashFlowPositive,

      // Unit Economics
      cac,
      cac_marketingOnly,
      cac_fullyLoaded,
      ltv,
      ltv_marginAdjusted: ltv,
      grossMarginPct,
      ltvCacRatio: cac > 0 ? Math.round((ltv / cac) * 100) / 100 : 0,

      // Capacity
      teamSize: team.teamSize,
      capacityUtilization: capacity.capacityUtilization,
      hiredThisMonth: team.hiredThisMonth,

      // Competition
      competitionPressure: competition.effectivePressure,

      // Marketing breakdown
      channelBreakdown: marketing.channelBreakdown,

      // Milestone delay
      isDelayed: milestoneCheck.isDelayed,
      isInsolvent,
    });
  }

  // ── Summary ──
  const lastMonth = monthlyResults[11];
  const totalRevenue = monthlyResults.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpensesSum = monthlyResults.reduce((sum, m) => sum + m.totalExpenses, 0);
  const breakEvenMonth = monthlyResults.find((m) => m.isCashFlowPositive);
  const cashExhaustedMonth = warnings.find((w) => w.type === "cash_exhaustion")?.month || null;

  const summary = {
    finalActiveCustomers: lastMonth.activeCustomers,
    totalRevenue: Math.round(totalRevenue),
    totalExpenses: Math.round(totalExpensesSum),
    finalEndingCash: Math.round(lastMonth.endingCash),
    finalCAC: lastMonth.cac,
    cac_marketingOnly: lastMonth.cac_marketingOnly,
    cac_fullyLoaded: lastMonth.cac_fullyLoaded,
    finalLTV: lastMonth.ltv,
    grossMarginPct: lastMonth.grossMarginPct,
    finalLtvCacRatio: lastMonth.ltvCacRatio,
    breakEvenMonth: breakEvenMonth ? breakEvenMonth.month : null,
    cashExhaustedMonth,
    survivalOutlook: cashExhaustedMonth ? `Exhausted M${cashExhaustedMonth}` : (lastMonth.runway === null ? "Infinite Runway" : `${lastMonth.runway} Months Runway`),
    isProfitableByMonth12: lastMonth.isCashFlowPositive,
    peakBurn: Math.max(...monthlyResults.map((m) => m.burn)),
  };

  return {
    monthlySimulation: monthlyResults,
    summary,
    warnings: deduplicateWarnings(warnings),
  };
};

/**
 * Remove duplicate warnings (keep first occurrence of each type per month).
 */
const deduplicateWarnings = (warnings) => {
  const seen = new Set();
  return warnings.filter((w) => {
    const key = `${w.type}-${w.month}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = { runSimulation, getStage, STAGES };
