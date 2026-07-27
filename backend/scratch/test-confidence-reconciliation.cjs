const { verifyCoreFinancialBenchmarks, verifyAssumptionsBenchmarks, fillMissingAssumptionsWithBenchmarks } = require("../src/services/marketBenchmarkService");

async function runTest() {
  console.log("=== 1. Testing fillMissingAssumptionsWithBenchmarks explicit flag ===");
  let assumptions = {
    industry: "saas",
    targetCustomer: "B2B",
    businessModel: "Subscription",
    grossMarginPct: 0.8, // Founder independently types in 0.8 (happens to match default!)
  };
  
  // Fill missing assumptions from defaults (should fill monthlyChurn, cpl, valuationMultipleARR, but NOT grossMarginPct)
  assumptions = fillMissingAssumptionsWithBenchmarks(assumptions, "saas");
  console.log("Recorded _benchmarkFilledFields:", assumptions._benchmarkFilledFields);
  
  // Now verify and reconcile
  const verified = await verifyAssumptionsBenchmarks(assumptions);
  console.log("Attached benchmarkConfidence:", verified.benchmarkConfidence);
  console.log("Is grossMarginPct in benchmarkConfidence? (Should be undefined because founder typed it):", verified.benchmarkConfidence.grossMarginPct);
}

runTest().catch(console.error);
