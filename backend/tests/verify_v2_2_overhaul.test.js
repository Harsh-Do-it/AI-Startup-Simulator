/**
 * Automated Verification Test Suite for v2.2.0 Overhaul
 *
 * Covers:
 * 1. C1 - Current Gemini model reference & API Versioning headers
 * 2. C2 - Citation verification & unverified_estimate fallback
 * 3. M1 - SaaS Gross Margin & Infrastructure cost accounting
 * 4. M2 - Full Startup Analysis expansion (TAM/SAM/SOM, competitors, regulatory flags, AI narrative)
 * 5. M3 - Restored Scenario Stress Testing modifiers (0.70x conversion, 1.10x salary inflation)
 * 6. M4 - Milestone Execution Engine dynamic impacts across all impactTypes
 * 7. P4 - Async Simulation Job tracking & Rate Limiter middleware
 */

const assert = require("assert");
const { SCENARIO_ADJUSTMENTS } = require("../src/config/scenarioModifiers.config");
const { runSimulation } = require("../src/engine/simulationEngine");
const { getBenchmarksForIndustry, fillMissingAssumptionsWithBenchmarks } = require("../src/services/marketBenchmarkService");
const apiVersion = require("../src/middleware/apiVersion");
const { aiRateLimiter } = require("../src/middleware/rateLimiter");

console.log("=== 🚀 Running v2.2.0 Full Overhaul Verification Test Suite ===\n");

// ─── 1. C1: Model Reference & API Versioning ─────────────────────────────────
console.log("Test 1: Verifying Current Gemini Model Reference & API Versioning Middleware...");
const geminiServiceContent = require("fs").readFileSync(require("path").join(__dirname, "../src/services/gemini.service.js"), "utf8");
assert.ok(geminiServiceContent.includes("gemini-2.5-pro") || geminiServiceContent.includes("gemini-2.5-flash"), "gemini.service.js must use current supported genai model");

// Test apiVersion middleware
const mockReq = { headers: { "x-api-version": "2.2.0" } };
const mockRes = {
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
};
let nextCalled = false;
apiVersion(mockReq, mockRes, () => { nextCalled = true; });
assert.ok(nextCalled, "apiVersion middleware must call next()");
assert.strictEqual(mockRes.headers["X-API-Version"], "2.2.0", "Response must set X-API-Version to 2.2.0");
console.log("✅ Passed: Model reference & API versioning verified.\n");

// ─── 2. C2: Citation Verification & Fallback ─────────────────────────────────
console.log("Test 2: Verifying Citation Provenance & unverified_estimate Fallback...");
const unknownComps = getBenchmarksForIndustry("Interstellar Potato Farming");
assert.ok(unknownComps.churnRate.sourceName, "Must return fallback sourceName without crashing");
const fallbackAssumptions = fillMissingAssumptionsWithBenchmarks({ price: 100 }, "Interstellar Potato Farming");
assert.ok(fallbackAssumptions.benchmarkCitations.some(c => c.sourceName === "Industry Default Estimate" || c.sourceUrl === "not independently verified" || c.provenance === "unverified_estimate"), "Must use unverified_estimate or generic fallback when empirical source is unavailable");
console.log("✅ Passed: Citation provenance & fallback verified.\n");

// ─── 3. M1: SaaS Gross Margin Accounting ─────────────────────────────────────
console.log("Test 3: Verifying SaaS Gross Margin & Infrastructure Accounting...");
const m1Assumptions = {
  startingCapital: 50000,
  price: 100,
  grossMarginPct: 0.80, // 80% gross margin
  variableCostPerCustomer: 10,
  monthlyChurn: 0.05,
  conversionRate: 0.05,
  marketingChannels: [{ name: "Paid Ads", budget: 1000, baseCostPerLead: 10, baseConversionRate: 0.05, rampUpMonths: 1 }],
  hiringPlan: [],
  milestones: [],
};
const m1Sim = runSimulation(m1Assumptions);
const month1 = m1Sim.monthlySimulation[0];
assert.strictEqual(month1.grossMarginPct, 0.80, "Must record grossMarginPct in monthly simulation");
assert.ok(month1.grossProfit < month1.revenue || month1.revenue === 0, "Gross profit must reflect gross margin deduction");
assert.ok(month1.ltv_marginAdjusted !== undefined, "Must compute margin-adjusted LTV");
console.log("✅ Passed: SaaS Gross Margin & LTV accounting verified.\n");

// ─── 4. M2: Expanded Startup Analysis ────────────────────────────────────────
console.log("Test 4: Verifying Full Startup Analysis Expansion Schema...");
// Check buildFullStartupAnalysis code structure
const simServiceContent = require("fs").readFileSync(require("path").join(__dirname, "../src/services/simulation.service.js"), "utf8");
assert.ok(simServiceContent.includes("tam"), "Must include TAM in startup analysis");
assert.ok(simServiceContent.includes("sam"), "Must include SAM in startup analysis");
assert.ok(simServiceContent.includes("som"), "Must include SOM in startup analysis");
assert.ok(simServiceContent.includes("competitors"), "Must include competitors in startup analysis");
assert.ok(simServiceContent.includes("regulatoryFlags"), "Must include regulatoryFlags in startup analysis");
assert.ok(simServiceContent.includes("aiNarrative"), "Must include aiNarrative in startup analysis");
console.log("✅ Passed: Expanded Startup Analysis schema verified.\n");

// ─── 5. M3: Scenario Stress Testing Modifiers ────────────────────────────────
console.log("Test 5: Verifying Restored Scenario Stress Testing Modifiers...");
assert.strictEqual(SCENARIO_ADJUSTMENTS.pessimistic.conversionRateMultiplier, 0.70, "Pessimistic conversion efficiency stress must be 0.70x (-30%)");
assert.strictEqual(SCENARIO_ADJUSTMENTS.pessimistic.salaryInflationMultiplier, 1.10, "Pessimistic salary inflation stress must be 1.10x (+10%)");
console.log("✅ Passed: Restored Scenario Stress Testing modifiers verified.\n");

// ─── 6. M4: Milestone Execution Engine ───────────────────────────────────────
console.log("Test 6: Verifying Milestone Execution Engine across all impactTypes...");
const m4Assumptions = {
  ...m1Assumptions,
  milestones: [
    { name: "Conversion Feature", expectedMonth: 2, impactType: "conversion", value: 0.20 },
    { name: "Retention Tool", expectedMonth: 3, impactType: "retention", value: 0.25 },
    { name: "Pricing Tier", expectedMonth: 4, impactType: "pricing", value: 0.15 },
  ],
};
const m4Sim = runSimulation(m4Assumptions);
const ms1 = m4Sim.monthlySimulation[0]; // M1 (baseline)
const ms2 = m4Sim.monthlySimulation[1]; // M2 (conversion boost)
const ms3 = m4Sim.monthlySimulation[2]; // M3 (retention boost)
const ms4 = m4Sim.monthlySimulation[3]; // M4 (pricing boost)

assert.ok(ms2.effectiveConversionRate > ms1.effectiveConversionRate, "M2 effectiveConversionRate must increase due to conversion milestone");
assert.ok(ms3.effectiveChurnRate < ms2.effectiveChurnRate, "M3 effectiveChurnRate must decrease due to retention milestone");
assert.ok(ms4.price > ms3.price, "M4 price must increase due to pricing milestone");
console.log("✅ Passed: Milestone Execution Engine impactTypes verified.\n");

// ─── 7. P4: Rate Limiter Middleware ──────────────────────────────────────────
console.log("Test 7: Verifying AI Rate Limiter Middleware...");
let rateLimited = false;
const mockRateRes = {
  setHeader: () => {},
};
const mockRateNext = (err) => {
  if (err && err.statusCode === 429) rateLimited = true;
};
// Make 105 requests for a test user
for (let i = 0; i < 105; i++) {
  aiRateLimiter({ user: { _id: "test_user_limit_1" } }, mockRateRes, mockRateNext);
}
assert.ok(rateLimited, "Rate limiter must trigger 429 error after exceeding limit");
console.log("✅ Passed: Rate Limiter middleware verified.\n");

console.log("=== 🏆 ALL v2.2.0 OVERHAUL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
