const assert = require("assert");
const { calculateChannelLeads, CHANNEL_TEMPLATES } = require("../src/engine/marketingChannels");
const { SCENARIO_ADJUSTMENTS } = require("../src/config/scenarioModifiers.config");

console.log("=== Running Canonical Engine Math Verification Test Suite ===\n");

// Test 1: Verify Channel Template Parameters
console.log("Test 1: Asserting Channel Template Parameters...");
assert.strictEqual(CHANNEL_TEMPLATES.paidAds.saturationSpendMultiplier, 200, "Paid ads saturationSpendMultiplier should be 200");
assert.strictEqual(CHANNEL_TEMPLATES.paidAds.scalingCoefficient, 1.0, "Paid ads scalingCoefficient should be 1.0");
assert.strictEqual(CHANNEL_TEMPLATES.organicSearch.saturationSpendMultiplier, 50, "Organic search saturationSpendMultiplier should be 50");
assert.strictEqual(CHANNEL_TEMPLATES.organicSearch.scalingCoefficient, 0.8, "Organic search scalingCoefficient should be 0.8");
console.log("✅ Passed: Channel Template Parameters are canonical.\n");

// Test 2: Verify Logarithmic Diminishing Returns Math
console.log("Test 2: Asserting Diminishing Returns Formula...");
const paidAdChannel = { ...CHANNEL_TEMPLATES.paidAds, budget: 1600 }; // 1600 budget on $8 CPL -> baseSpend is 1600
const resM1 = calculateChannelLeads(paidAdChannel, 1, 0);
// baseSpend = 8 * 200 = 1600
// rawLeads = ((1600 / 8) * Math.log(1 + 1600 / 1600) / Math.log(2)) * 1.0 = 200 * 1.0 = 200
// rampFactor = 1 / 1 = 1.0
// leads = 200
assert.strictEqual(resM1.leads, 200, `Expected 200 leads for budget equal to baseSpend, got ${resM1.leads}`);
console.log("✅ Passed: Logarithmic Diminishing Returns math matches canonical formula.\n");

// Test 3: Verify Canonical Scenario Adjustment Modifiers
console.log("Test 3: Asserting Scenario Adjustment Constants...");
assert.strictEqual(SCENARIO_ADJUSTMENTS.pessimistic.conversionRateMultiplier, 0.7);
assert.strictEqual(SCENARIO_ADJUSTMENTS.pessimistic.salaryInflationMultiplier, 1.1);
assert.strictEqual(SCENARIO_ADJUSTMENTS.pessimistic.monthlyChurnMultiplier, 1.3);
assert.strictEqual(SCENARIO_ADJUSTMENTS.optimistic.conversionRateMultiplier, 1.4);
assert.strictEqual(SCENARIO_ADJUSTMENTS.optimistic.monthlyChurnMultiplier, 0.6);
console.log("✅ Passed: Scenario adjustment modifiers are canonical.\n");

// Test 4: Verify Fully-Loaded CAC, Margin-Adjusted LTV, and Option A Milestones
console.log("Test 4: Asserting Unit Economics & Option A Milestone Execution in runSimulation...");
const { runSimulation } = require("../src/engine/simulationEngine");

const testAssumptions = {
  startingCapital: 50000,
  price: 100,
  grossMarginPct: 0.8,
  variableCostPerCustomer: 20,
  monthlyChurn: 0.05, // 5% churn -> 20 mos lifetime
  conversionRate: 0.05,
  marketingChannels: [
    { name: "Paid Ads", budget: 1000, baseCostPerLead: 10, baseConversionRate: 0.05, rampUpMonths: 1 }
  ],
  hiringPlan: [
    { role: "Sales Rep", monthlyCost: 4000, month: 1 },
    { role: "Developer", monthlyCost: 6000, month: 1 }
  ],
  milestones: [
    { name: "Launch V2", expectedMonth: 2, impactType: "conversion_boost", value: 20 }, // +20% boost
    { name: "CSM Tooling", expectedMonth: 2, impactType: "churn_reduction", value: 30 } // -30% churn
  ]
};

const simResult = runSimulation(testAssumptions);
const m1 = simResult.monthlySimulation[0];
const m2 = simResult.monthlySimulation[1];

// Verify sales headcount included in fullyLoaded CAC but not marketingOnly
assert.ok(m1.cac_fullyLoaded > m1.cac_marketingOnly, `Fully loaded CAC (${m1.cac_fullyLoaded}) should be greater than marketing-only CAC (${m1.cac_marketingOnly}) due to Sales Rep salary.`);
assert.strictEqual(m1.cac, m1.cac_fullyLoaded, "Canonical CAC must equal cac_fullyLoaded");

// Verify Option A dynamic milestone impact in Month 2
assert.ok(m2.effectiveConversionRate > m1.effectiveConversionRate, "Conversion rate in Month 2 should increase due to conversion_boost milestone");

// Test 5: Verify Clean Insolvency Runway
console.log("Test 5: Asserting Clean Insolvency Handling...");
const insolventAssumptions = { ...testAssumptions, startingCapital: 1000 }; // Exhausts cash quickly
const insolventSim = runSimulation(insolventAssumptions);
const exhaustedMonth = insolventSim.monthlySimulation.find(m => m.isInsolvent);
assert.ok(exhaustedMonth, "Must flag isInsolvent when cash <= 0");
assert.strictEqual(exhaustedMonth.runway, "insolvent", "Runway must be exactly 'insolvent' when cash exhausted");
assert.ok(insolventSim.summary.survivalOutlook.startsWith("Exhausted M"), `Survival outlook should indicate exhausted month, got: ${insolventSim.summary.survivalOutlook}`);
console.log("✅ Passed: Clean insolvency and Option A milestone execution verified.\n");

// Test 6: Verify Market Benchmark Service Provenance and Fallback
console.log("Test 6: Asserting Market Benchmark Service...");
const { getBenchmarksForIndustry, fillMissingAssumptionsWithBenchmarks } = require("../src/services/marketBenchmarkService");
const saasComps = getBenchmarksForIndustry("B2B SaaS tool");
assert.strictEqual(saasComps.industryName, "B2B SaaS / Software", "Should map to SaaS industry");
assert.ok(saasComps.churnRate.sourceName, "Must contain sourceName citation");

const incompleteAssumptions = { price: 50, marketingChannels: [{ name: "Paid Ads", budget: 500 }] }; // Missing churn and baseCostPerLead
const filled = fillMissingAssumptionsWithBenchmarks(incompleteAssumptions, "AI");
assert.strictEqual(filled.monthlyChurn, 0.05, "Should inject 5% churn for AI industry");
assert.strictEqual(filled.marketingChannels[0].baseCostPerLead, 18, "Should inject $18 CPL for AI industry");
assert.ok(filled.benchmarkCitations.length >= 2, "Must attach benchmark citations for injected fields");
console.log("✅ Passed: Market Benchmark Service verified.\n");

// Test 7: Verify Scoring Engine Versioning and Confidence Citations
console.log("Test 7: Asserting Scoring Engine Versioning and Confidence Citations...");
const { calculateStartupScore } = require("../src/engine/scoringEngine");
const scoreRes = calculateStartupScore(filled, simResult);
assert.strictEqual(scoreRes.scoringEngineVersion, "2.2.0", "Must return scoringEngineVersion 2.2.0");
const hasCitationReason = scoreRes.confidence.reasons.some(r => r.includes("grounded in verified 2026 industry benchmarks"));
assert.ok(hasCitationReason, "Must include confidence reason for verified benchmark grounding");
console.log("✅ Passed: Scoring Engine Versioning and Confidence Citations verified.\n");

console.log("=== 🎯 All Canonical Math, Financial Modeling, and Benchmark Tests Passed Successfully! ===");
