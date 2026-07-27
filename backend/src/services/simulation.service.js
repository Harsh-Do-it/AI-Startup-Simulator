const Simulation = require("../models/simulation.model");
const ApiError = require("../utils/ApiError");
const { buildSimulationPrompt } = require("../prompts/simulation.prompt");
const { buildExtractAssumptionsPrompt } = require("../prompts/extractAssumptions.prompt");
const { buildQualitativeOverlayPrompt } = require("../prompts/qualitativeOverlay.prompt");
const { generateContent } = require("./gemini.service");
const { extractJson } = require("../utils/aiJsonParser");
const { runSimulation } = require("../engine/simulationEngine");
const { generateAllScenarios } = require("../engine/scenarioGenerator");
const { buildDefaultChannels } = require("../engine/marketingChannels");
const { calculateStartupScore } = require("../engine/scoringEngine");
const { buildScoringExplanationPrompt } = require("../prompts/scoringExplanation.prompt");
const { fillMissingAssumptionsWithBenchmarks, verifyAssumptionsBenchmarks, getBenchmarksForIndustry } = require("./marketBenchmarkService");

// ─── V1 Legacy Simulation (kept for backward compatibility) ──────────────────

const legacyRequiredAnalysisKeys = [
  "startupScore",
  "scoreBreakdown",
  "monthlyProjections",
  "marketPotential",
  "revenuePrediction",
  "growthPrediction",
  "cashFlow",
  "strengths",
  "weaknesses",
  "risks",
  "recommendations",
];

const validateLegacyAnalysis = (analysis) => {
  legacyRequiredAnalysisKeys.forEach((key) => {
    if (analysis[key] === undefined || analysis[key] === null) {
      throw new ApiError(502, `AI response missing required field: ${key}`);
    }
  });
  if (typeof analysis.startupScore !== "number") {
    throw new ApiError(502, "AI response startupScore must be a number");
  }
  if (!Array.isArray(analysis.monthlyProjections)) {
    throw new ApiError(502, "AI response monthlyProjections must be an array");
  }
  ["strengths", "weaknesses", "risks", "recommendations"].forEach((key) => {
    if (!Array.isArray(analysis[key])) {
      throw new ApiError(502, `AI response ${key} must be an array`);
    }
  });
};

const runLegacySimulation = async (userId, payload) => {
  const prompt = buildSimulationPrompt(payload);
  const rawResponse = await generateContent(prompt);
  const analysis = extractJson(rawResponse);
  validateLegacyAnalysis(analysis);

  const simulation = await Simulation.create({
    user: userId,
    version: 1,
    ...payload,
    analysis,
  });
  return simulation;
};

// ─── V2 Assumption Extraction ────────────────────────────────────────────────

const extractAssumptions = async (payload) => {
  const prompt = buildExtractAssumptionsPrompt(payload);
  const rawResponse = await generateContent(prompt);
  const assumptions = extractJson(rawResponse);

  // Ensure marketing channels exist
  if (!assumptions.marketingChannels || assumptions.marketingChannels.length === 0) {
    const budget = assumptions.initialMarketingBudget || 5000;
    assumptions.marketingChannels = buildDefaultChannels(budget);
  }

  // Ensure milestones exist
  if (!assumptions.milestones || assumptions.milestones.length === 0) {
    assumptions.milestones = [
      { name: "MVP Development", expectedMonth: 1, completed: false },
      { name: "First User Launch", expectedMonth: 3, completed: false },
      { name: "Major Feature Release", expectedMonth: 6, completed: false },
    ];
  }

  // Ensure hiring plan exists
  if (!assumptions.hiringPlan) {
    assumptions.hiringPlan = [];
  }

  // Ensure fixed costs object
  if (!assumptions.fixedCosts) {
    assumptions.fixedCosts = { salaries: 3000, softwareTools: 200, office: 0, admin: 100 };
  }

  // Defaults for missing numeric fields
  const defaults = {
    initialCustomers: 0,
    competitionPressure: 0.5,
    variableCostPerCustomer: 1,
    teamSize: 2,
    paymentProcessingRate: 0.029,
    conversionRate: 0.03,
    monthlyChurn: 0.05,
    price: 10,
    startingCapital: 50000,
    initialMarketingBudget: 5000,
  };

  Object.entries(defaults).forEach(([key, val]) => {
    if (assumptions[key] === undefined || assumptions[key] === null) {
      assumptions[key] = val;
    }
  });

  const groundedAssumptions = fillMissingAssumptionsWithBenchmarks(assumptions, assumptions.industry || "");
  const verifiedAssumptions = await verifyAssumptionsBenchmarks(groundedAssumptions);
  return verifiedAssumptions;
};

const buildFullStartupAnalysis = async (assumptions, engineResult, scoreResult, qualitative, scenarios) => {
  const benchmarks = getBenchmarksForIndustry(assumptions.industry || "saas");
  
  // Aggregate SWOT from scoreResult categories
  const strengths = [];
  const weaknesses = [];
  if (scoreResult.breakdown) {
    Object.values(scoreResult.breakdown).forEach((cat) => {
      if (cat.strengths && Array.isArray(cat.strengths)) strengths.push(...cat.strengths);
      if (cat.weaknesses && Array.isArray(cat.weaknesses)) weaknesses.push(...cat.weaknesses);
    });
  }
  if (strengths.length === 0) strengths.push("Valid product hypothesis in target sector");
  if (weaknesses.length === 0) weaknesses.push("Execution risks associated with early-stage growth");

  const opportunities = [
    `Expand market share within the ${assumptions.industry || "target"} sector through channel partnerships and organic virality`,
    `Optimize unit economics (current LTV:CAC is ${engineResult.summary.finalLtvCacRatio}:1) by scaling top-performing acquisition channels`,
    `Introduce tiered enterprise or expansion pricing to grow average revenue per user beyond $${assumptions.price || 0}/mo`
  ];

  const threats = qualitative.topRisks || scoreResult.topRisks || [
    `Customer churn exceeding simulated rate (${((assumptions.monthlyChurn || 0.05) * 100).toFixed(1)}%) could erode recurring revenue base`,
    `Rising customer acquisition costs (CPL) in competitive advertising networks`,
    `Cash flow exhaustion before reaching self-sustaining profitability`
  ];

  const strategicRecommendations = qualitative.keyDecisions || [
    `Monitor monthly burn rate closely against starting capital of $${(assumptions.startingCapital || 0).toLocaleString()}`,
    `Focus on achieving product-market fit to reduce churn below ${((assumptions.monthlyChurn || 0.05) * 100).toFixed(1)}%`,
    `Validate customer willingness to pay at the $${assumptions.price || 0} price point before aggressive marketing spend`
  ];

  const tam = assumptions.tam || benchmarks.tam || `$5.0B+ Global ${assumptions.industry || "SaaS"} Total Addressable Market`;
  const sam = assumptions.sam || benchmarks.sam || `$850M+ Serviceable Addressable Market (${assumptions.targetMarket || "Primary Segment"})`;
  // SOM heuristic: 2.9x 12-month revenue represents a realistic Year 3 market capture target assuming a defensible 70% YoY growth trajectory (1.70 * 1.70 = 2.89x) from Year 1 base
  const som = assumptions.som || `$${Math.round((engineResult.summary.totalRevenue || 150000) * 2.9).toLocaleString()} Serviceable Obtainable Market (3-Year Target)`;

  const competitors = assumptions.competitors || [
    { name: "Incumbent Enterprise Solution", pricing: benchmarks.competitorPricingSignals || "High-end tiered pricing", differentiation: "Legacy feature set with high operational complexity" },
    { name: "Low-Cost DIY Alternative", pricing: "Freemium / Low cost", differentiation: "Limited capabilities and self-serve support" },
    { name: "Direct Specialized Competitor", pricing: `$${assumptions.price || 49}/mo market standard`, differentiation: "Similar core value proposition without AI/specialized automation" },
  ];

  const regulatoryFlags = assumptions.regulatoryFlags || benchmarks.regulatoryFlags || ["Standard Data Privacy (GDPR/CCPA)", "Basic Terms of Service Compliance"];

  // Wire TAM/SAM/SOM, competitor, and regulatory-flag content through verification path
  const citations = Array.isArray(assumptions.benchmarkCitations) ? [...assumptions.benchmarkCitations] : [];
  const addAnalysisCitation = (field, val, sourceName = "Industry Default Estimate", sourceUrl = "not independently verified") => {
    if (!citations.some((c) => c.field === field)) {
      citations.push({
        field,
        injectedValue: typeof val === "object" ? JSON.stringify(val) : String(val),
        sourceName,
        sourceUrl,
        retrievedAt: new Date().toISOString().split("T")[0],
        confidence: "low",
        reason: `Market/regulatory estimate for '${field}'; evaluated for verification provenance.`,
      });
    }
  };

  addAnalysisCitation("tam", tam, benchmarks.tam ? `${benchmarks.industryName} TAM Benchmark` : "Industry Default Estimate", benchmarks.tamSourceUrl || "not independently verified");
  addAnalysisCitation("sam", sam, benchmarks.sam ? `${benchmarks.industryName} SAM Benchmark` : "Industry Default Estimate", benchmarks.samSourceUrl || "not independently verified");
  addAnalysisCitation("som", som, "3-Year SOM Projection Model", "not independently verified");
  addAnalysisCitation("competitors", competitors, benchmarks.competitorPricingSignals ? `${benchmarks.industryName} Competitor Signals` : "Industry Default Estimate", benchmarks.competitorPricingSignalsSourceUrl || "not independently verified");
  addAnalysisCitation("regulatoryFlags", regulatoryFlags, benchmarks.regulatoryFlags ? `${benchmarks.industryName} Regulatory Framework` : "Industry Default Estimate", benchmarks.regulatoryFlagsSourceUrl || "not independently verified");

  const verifiedHolder = await verifyAssumptionsBenchmarks({ benchmarkCitations: citations });
  const finalCitations = verifiedHolder.benchmarkCitations || citations;

  return {
    generatedAt: new Date().toISOString(),
    scoringEngineVersion: scoreResult.scoringEngineVersion || "2.2.0",
    tam,
    sam,
    som,
    targetMarket: {
      tam,
      sam,
      som,
      description: `Targeting ${assumptions.targetMarket || "Global users"} in the ${assumptions.industry || "General"} sector.`,
    },
    competitors,
    regulatoryFlags,
    strengths,
    weaknesses,
    opportunities,
    threats,
    strategicRecommendations,
    aiNarrative: {
      overallAssessment: qualitative.overallAssessment || scoreResult.classificationExplanation || "Simulation complete.",
      topRisks: qualitative.topRisks || scoreResult.topRisks || [],
      keyDecisions: qualitative.keyDecisions || [],
      marketPotential: `${assumptions.industry || "Target"} industry shows promising expansion opportunities with high addressable demand.`,
      revenuePrediction: `Projected 12-month cumulative revenue of $${(engineResult.summary.totalRevenue || 0).toLocaleString()} across ${engineResult.summary.finalActiveCustomers || 0} active users.`,
      growthPrediction: `Monthly active customer trajectory expanding from ${engineResult.monthlySimulation[0]?.activeCustomers || 0} in Month 1 to ${engineResult.summary.finalActiveCustomers || 0} in Month 12.`,
      cashFlowNarrative: engineResult.summary.cashExhaustedMonth
        ? `Critical cash flow warning: Runway exhausted in Month ${engineResult.summary.cashExhaustedMonth} with final cash deficit of $${(engineResult.summary.finalEndingCash || 0).toLocaleString()}.`
        : `Positive liquidity maintained throughout simulation, ending with $${(engineResult.summary.finalEndingCash || 0).toLocaleString()} in reserves.`,
    },
    readinessScore: {
      overall: scoreResult.overallScore,
      opportunityScore: scoreResult.opportunityScore,
      viabilityScore: scoreResult.viabilityScore,
      survivalFactor: scoreResult.survivalFactor,
      classification: scoreResult.classification,
      confidence: scoreResult.confidence,
    },
    financialHealth: {
      totalRevenue: engineResult.summary.totalRevenue,
      totalExpenses: engineResult.summary.totalExpenses,
      netCashFlow: engineResult.summary.totalRevenue - engineResult.summary.totalExpenses,
      finalEndingCash: engineResult.summary.finalEndingCash,
      survivalOutlook: engineResult.summary.survivalOutlook,
      isProfitableByMonth12: engineResult.summary.isProfitableByMonth12,
      breakEvenMonth: engineResult.summary.breakEvenMonth,
    },
    unitEconomics: {
      cac_fullyLoaded: engineResult.summary.cac_fullyLoaded,
      cac_marketingOnly: engineResult.summary.cac_marketingOnly,
      finalLTV: engineResult.summary.finalLTV,
      grossMarginPct: engineResult.summary.grossMarginPct,
      ltvCacRatio: engineResult.summary.finalLtvCacRatio,
      healthAssessment: engineResult.summary.finalLtvCacRatio >= 3 ? "Healthy (>=3.0x)" : (engineResult.summary.finalLtvCacRatio >= 1 ? "Marginal (1.0x - 3.0x)" : "Unhealthy (<1.0x)"),
    },
    marketBenchmarking: {
      appliedIndustryBenchmark: assumptions.appliedIndustryBenchmark || assumptions.industry || "General",
      citations: finalCitations,
    },
    riskAssessment: {
      topRisks: qualitative.topRisks || scoreResult.topRisks || [],
      criticalWarnings: (engineResult.warnings || []).filter((w) => w.severity === "critical"),
      sensitivityAnalysis: scoreResult.sensitivityAnalysis || [],
    },
    scenarioSummary: {
      pessimisticM12Cash: scenarios.pessimistic?.summary?.finalEndingCash || 0,
      realisticM12Cash: scenarios.realistic?.summary?.finalEndingCash || 0,
      optimisticM12Cash: scenarios.optimistic?.summary?.finalEndingCash || 0,
    },
  };
};

// ─── V2 Full Simulation ─────────────────────────────────────────────────────

const runFullSimulation = async (userId, startupName, idea, assumptions) => {
  // 0. Verify core financial benchmarks & assumptions citations before engine execution
  const verifiedAssumptions = await verifyAssumptionsBenchmarks(assumptions);

  // 1. Run deterministic engine for the realistic scenario
  const engineResult = runSimulation(verifiedAssumptions);

  // 2. Generate all three scenarios
  const scenarios = generateAllScenarios(verifiedAssumptions);

  // 3. Run AI qualitative overlay
  let qualitative = {
    monthlyOverlays: [],
    overallAssessment: "",
    topRisks: [],
    keyDecisions: [],
  };

  try {
    const overlayPrompt = buildQualitativeOverlayPrompt({
      startupName,
      idea,
      assumptions: verifiedAssumptions,
      monthlySimulation: engineResult.monthlySimulation,
      summary: engineResult.summary,
      warnings: engineResult.warnings,
    });

    const rawOverlay = await generateContent(overlayPrompt);
    qualitative = extractJson(rawOverlay);
  } catch (err) {
    // AI overlay is non-critical — simulation works without it
    console.error("[Simulation] Qualitative overlay failed, using defaults:", err.message);
  }

  // 4. Merge qualitative overlays into monthly simulation
  const monthlySimulation = engineResult.monthlySimulation.map((month) => {
    const overlay = (qualitative.monthlyOverlays || []).find((o) => o.month === month.month);
    return {
      ...month,
      event: overlay?.event || "",
      risk: overlay?.risk || "",
      milestone: overlay?.milestone || null,
      insight: overlay?.insight || "",
    };
  });

  // 5. Calculate Startup Readiness Score
  const scoreResult = calculateStartupScore(verifiedAssumptions, engineResult, scenarios);
  try {
    const scorePrompt = buildScoringExplanationPrompt({
      startupName,
      idea,
      assumptions: verifiedAssumptions,
      scoreResult,
    });
    const rawScoreExplanation = await generateContent(scorePrompt);
    const scoreJson = extractJson(rawScoreExplanation);
    if (scoreJson && scoreJson.breakdown) {
      Object.keys(scoreResult.breakdown).forEach((k) => {
        if (scoreJson.breakdown[k]?.explanation) {
          scoreResult.breakdown[k].explanation = scoreJson.breakdown[k].explanation;
        }
      });
    }
  } catch (err) {
    console.error("[Simulation] Score explanation overlay failed, using defaults:", err.message);
  }

  const fullStartupAnalysis = await buildFullStartupAnalysis(verifiedAssumptions, engineResult, scoreResult, qualitative, scenarios);

  // 6. Save to database
  const simulation = await Simulation.create({
    user: userId,
    startupName,
    idea,
    version: 2,
    startupScore: scoreResult.overallScore,
    assumptions: verifiedAssumptions,
    monthlySimulation,
    scenarios: {
      pessimistic: scenarios.pessimistic,
      realistic: scenarios.realistic,
      optimistic: scenarios.optimistic,
    },
    summary: engineResult.summary,
    warnings: engineResult.warnings,
    qualitative: {
      overallAssessment: qualitative.overallAssessment || "",
      topRisks: qualitative.topRisks || [],
      keyDecisions: qualitative.keyDecisions || [],
    },
    score: scoreResult,
    fullStartupAnalysis,
  });

  return simulation;
};

// ─── V2 Re-run Simulation ───────────────────────────────────────────────────

const rerunSimulation = async (userId, simulationId, updatedAssumptions) => {
  const simulation = await Simulation.findOne({ _id: simulationId, user: userId });
  if (!simulation) {
    throw new ApiError(404, "Simulation not found");
  }
  if (simulation.version !== 2) {
    throw new ApiError(400, "Cannot re-run legacy (V1) simulations. Please create a new simulation.");
  }

  // 0. Verify core financial benchmarks & assumptions citations before engine execution
  const verifiedAssumptions = await verifyAssumptionsBenchmarks(updatedAssumptions);

  // Re-run engine
  const engineResult = runSimulation(verifiedAssumptions);
  const scenarios = generateAllScenarios(verifiedAssumptions);

  // Re-run qualitative overlay
  let qualitative = {
    monthlyOverlays: [],
    overallAssessment: "",
    topRisks: [],
    keyDecisions: [],
  };

  try {
    const overlayPrompt = buildQualitativeOverlayPrompt({
      startupName: simulation.startupName,
      idea: simulation.idea,
      assumptions: verifiedAssumptions,
      monthlySimulation: engineResult.monthlySimulation,
      summary: engineResult.summary,
      warnings: engineResult.warnings,
    });
    const rawOverlay = await generateContent(overlayPrompt);
    qualitative = extractJson(rawOverlay);
  } catch (err) {
    console.error("[Simulation] Qualitative overlay failed on rerun:", err.message);
  }

  const monthlySimulation = engineResult.monthlySimulation.map((month) => {
    const overlay = (qualitative.monthlyOverlays || []).find((o) => o.month === month.month);
    return {
      ...month,
      event: overlay?.event || "",
      risk: overlay?.risk || "",
      milestone: overlay?.milestone || null,
      insight: overlay?.insight || "",
    };
  });

  // Calculate Startup Readiness Score
  const scoreResult = calculateStartupScore(verifiedAssumptions, engineResult, scenarios);
  try {
    const scorePrompt = buildScoringExplanationPrompt({
      startupName: simulation.startupName,
      idea: simulation.idea,
      assumptions: verifiedAssumptions,
      scoreResult,
    });
    const rawScoreExplanation = await generateContent(scorePrompt);
    const scoreJson = extractJson(rawScoreExplanation);
    if (scoreJson && scoreJson.breakdown) {
      Object.keys(scoreResult.breakdown).forEach((k) => {
        if (scoreJson.breakdown[k]?.explanation) {
          scoreResult.breakdown[k].explanation = scoreJson.breakdown[k].explanation;
        }
      });
    }
  } catch (err) {
    console.error("[Simulation] Score explanation overlay failed on rerun:", err.message);
  }

  const fullStartupAnalysis = await buildFullStartupAnalysis(verifiedAssumptions, engineResult, scoreResult, qualitative, scenarios);

  // Update document
  simulation.startupScore = scoreResult.overallScore;
  simulation.assumptions = verifiedAssumptions;
  simulation.monthlySimulation = monthlySimulation;
  simulation.scenarios = {
    pessimistic: scenarios.pessimistic,
    realistic: scenarios.realistic,
    optimistic: scenarios.optimistic,
  };
  simulation.summary = engineResult.summary;
  simulation.warnings = engineResult.warnings;
  simulation.qualitative = {
    overallAssessment: qualitative.overallAssessment || "",
    topRisks: qualitative.topRisks || [],
    keyDecisions: qualitative.keyDecisions || [],
  };
  simulation.score = scoreResult;
  simulation.fullStartupAnalysis = fullStartupAnalysis;

  await simulation.save();
  return simulation;
};

// ─── Common CRUD ─────────────────────────────────────────────────────────────

const getUserSimulations = async (userId) => {
  return Simulation.find({ user: userId })
    .select("startupName idea version industry createdAt summary analysis score startupScore fullStartupAnalysis")
    .sort({ createdAt: -1 });
};

const getSimulationById = async (userId, simulationId) => {
  const simulation = await Simulation.findOne({ _id: simulationId, user: userId });
  if (!simulation) {
    throw new ApiError(404, "Simulation not found");
  }
  return simulation;
};

const deleteSimulationById = async (userId, simulationId) => {
  const simulation = await Simulation.findOneAndDelete({ _id: simulationId, user: userId });
  if (!simulation) {
    throw new ApiError(404, "Simulation not found");
  }
  return simulation;
};

module.exports = {
  runLegacySimulation,
  extractAssumptions,
  runFullSimulation,
  rerunSimulation,
  getUserSimulations,
  getSimulationById,
  deleteSimulationById,
};