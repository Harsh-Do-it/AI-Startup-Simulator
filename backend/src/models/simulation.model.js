const mongoose = require("mongoose");
const { MILESTONE_IMPACT_ENUM } = require("../../../shared/milestoneImpactTypes");

// ─── V2 Simulation Schema (12-Month Engine) ──────────────────────────────────

const marketingChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    budget: { type: Number, required: true },
    baseCostPerLead: { type: Number, required: true },
    baseConversionRate: { type: Number, required: true },
    rampUpMonths: { type: Number, default: 1 },
  },
  { _id: false }
);

const hiringEntrySchema = new mongoose.Schema(
  {
    month: { type: Number, required: true },
    role: { type: String, required: true },
    monthlyCost: { type: Number, required: true },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    expectedMonth: { type: Number },
    month: { type: Number },
    completed: { type: Boolean, default: false },
    impactType: { type: String, enum: MILESTONE_IMPACT_ENUM, default: null },
    value: { type: Number, default: 0 },
  },
  { _id: false }
);

const assumptionsSchema = new mongoose.Schema(
  {
    industry: { type: String, required: true },
    targetCustomer: { type: String, required: true },
    targetMarket: { type: String, default: "Global" },
    businessModel: { type: String, required: true },
    price: { type: Number, required: true },
    startingCapital: { type: Number, required: true },
    initialCustomers: { type: Number, default: 0 },
    conversionRate: { type: Number, required: true },
    monthlyChurn: { type: Number, required: true },
    competitionPressure: { type: Number, default: 0.5 },
    grossMarginPct: { type: Number },
    initialMarketingBudget: { type: Number, default: 5000 },
    fixedCosts: {
      salaries: { type: Number, default: 0 },
      softwareTools: { type: Number, default: 0 },
      office: { type: Number, default: 0 },
      admin: { type: Number, default: 0 },
    },
    variableCostPerCustomer: { type: Number, default: 1 },
    teamSize: { type: Number, default: 2 },
    hiringPlan: { type: [hiringEntrySchema], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    marketingChannels: { type: [marketingChannelSchema], default: [] },
    paymentProcessingRate: { type: Number, default: 0.029 },
    takeRate: { type: Number, default: 0.15 },
    transactionsPerCustomer: { type: Number, default: 2 },
    freemiumConversion: { type: Number, default: 0.05 },
    repeatPurchaseRate: { type: Number, default: 0.1 },
    sources: { type: mongoose.Schema.Types.Mixed, default: {} },
    benchmarkCitations: { type: [mongoose.Schema.Types.Mixed], default: [] },
    benchmarkConfidence: { type: mongoose.Schema.Types.Mixed, default: {} },
    _benchmarkFilledFields: { type: [String], default: [] },
    appliedIndustryBenchmark: { type: String },
  },
  { _id: false }
);

const channelBreakdownSchema = new mongoose.Schema(
  {
    channelName: { type: String },
    leads: { type: Number },
    customers: { type: Number },
    cost: { type: Number },
    effectiveCPL: { type: Number },
  },
  { _id: false }
);

const costBreakdownSchema = new mongoose.Schema(
  {
    salaries: Number,
    softwareTools: Number,
    office: Number,
    admin: Number,
    infrastructure: Number,
    paymentProcessing: Number,
    marketing: Number,
  },
  { _id: false }
);

const monthlyResultSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true },
    stage: { type: String, required: true },
    newCustomers: { type: Number, required: true },
    activeCustomers: { type: Number, required: true },
    churnedCustomers: { type: Number, required: true },
    leads: { type: Number, default: 0 },
    effectiveConversionRate: { type: Number, default: 0 },
    revenue: { type: Number, required: true },
    fixedCosts: { type: Number, required: true },
    variableCosts: { type: Number, required: true },
    marketingCosts: { type: Number, required: true },
    totalExpenses: { type: Number, required: true },
    costBreakdown: { type: costBreakdownSchema, default: {} },
    beginningCash: { type: Number, required: true },
    endingCash: { type: Number, required: true },
    burn: { type: Number, default: 0 },
    runway: { type: mongoose.Schema.Types.Mixed, default: null },
    isCashFlowPositive: { type: Boolean, default: false },
    isInsolvent: { type: Boolean, default: false },
    cac: { type: Number, default: 0 },
    cac_marketingOnly: { type: Number, default: 0 },
    cac_fullyLoaded: { type: Number, default: 0 },
    ltv: { type: Number, default: 0 },
    grossMarginPct: { type: Number, default: 0 },
    ltvCacRatio: { type: Number, default: 0 },
    teamSize: { type: Number, default: 0 },
    capacityUtilization: { type: Number, default: 0 },
    hiredThisMonth: { type: mongoose.Schema.Types.Mixed, default: null },
    competitionPressure: { type: Number, default: 0 },
    channelBreakdown: { type: [channelBreakdownSchema], default: [] },
    isDelayed: { type: Boolean, default: false },
    // Qualitative overlay fields (populated by AI after engine runs)
    event: { type: String, default: "" },
    risk: { type: String, default: "" },
    milestone: { type: String, default: null },
    insight: { type: String, default: "" },
  },
  { _id: false }
);

const warningSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    month: { type: Number, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["warning", "critical"], default: "warning" },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    finalActiveCustomers: Number,
    totalRevenue: Number,
    totalExpenses: Number,
    finalEndingCash: Number,
    finalCAC: Number,
    cac_marketingOnly: Number,
    cac_fullyLoaded: Number,
    finalLTV: Number,
    grossMarginPct: Number,
    finalLtvCacRatio: Number,
    breakEvenMonth: Number,
    cashExhaustedMonth: Number,
    survivalOutlook: String,
    isProfitableByMonth12: Boolean,
    peakBurn: Number,
  },
  { _id: false }
);

const scenarioSchema = new mongoose.Schema(
  {
    label: String,
    monthlySimulation: [monthlyResultSchema],
    summary: summarySchema,
    warnings: [warningSchema],
  },
  { _id: false }
);

// ─── Startup Score Schema ────────────────────────────────────────────────────

const scoreCategorySchema = new mongoose.Schema(
  {
    category: String,
    score: Number,
    maxScore: Number,
    metrics: mongoose.Schema.Types.Mixed,
    strengths: [String],
    weaknesses: [String],
    explanation: String,
  },
  { _id: false }
);

const scoreSchema = new mongoose.Schema(
  {
    scoringEngineVersion: { type: String, default: "2.1.0" },
    overallScore: Number,
    opportunityScore: Number,
    viabilityScore: Number,
    survivalFactor: Number,
    cashExhaustedMonth: Number,
    classification: String,
    confidence: {
      level: String,
      score: Number,
      reasons: [String],
    },
    breakdown: {
      marketOpportunity: scoreCategorySchema,
      customerProblem: scoreCategorySchema,
      customerTraction: scoreCategorySchema,
      businessModel: scoreCategorySchema,
      unitEconomics: scoreCategorySchema,
      financialSustainability: scoreCategorySchema,
      competition: scoreCategorySchema,
    },
    topStrengths: [String],
    topRisks: [String],
    recommendations: [
      {
        category: String,
        title: String,
        recommendation: String,
      },
    ],
    sensitivityAnalysis: [
      {
        action: String,
        param: String,
        newScore: Number,
        impactDelta: Number,
        description: String,
      },
    ],
    scenarioScores: {
      pessimistic: Number,
      realistic: Number,
      optimistic: Number,
    },
  },
  { _id: false }
);

// ─── Main Simulation Schema ─────────────────────────────────────────────────
// Supports both V1 (legacy) and V2 (engine-based) simulations via `version` field

const simulationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startupName: {
      type: String,
      required: true,
      trim: true,
    },
    idea: {
      type: String,
      required: true,
      trim: true,
    },
    startupScore: {
      type: Number,
      default: 0,
    },

    // ── V2 Fields (Engine-based simulation) ──
    version: {
      type: Number,
      default: 1, // 1 = legacy, 2 = engine-based
    },
    assumptions: {
      type: assumptionsSchema,
      default: undefined, // Only present in V2
    },
    monthlySimulation: {
      type: [monthlyResultSchema],
      default: undefined,
    },
    scenarios: {
      pessimistic: { type: scenarioSchema, default: undefined },
      realistic: { type: scenarioSchema, default: undefined },
      optimistic: { type: scenarioSchema, default: undefined },
    },
    summary: {
      type: summarySchema,
      default: undefined,
    },
    warnings: {
      type: [warningSchema],
      default: [],
    },
    qualitative: {
      overallAssessment: { type: String, default: "" },
      topRisks: { type: [String], default: [] },
      keyDecisions: { type: [String], default: [] },
    },
    score: {
      type: scoreSchema,
      default: undefined,
    },
    fullStartupAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },

    // ── V1 Legacy Fields (kept for backward compatibility) ──
    industry: {
      type: String,
      trim: true,
    },
    targetAudience: {
      type: String,
      trim: true,
    },
    businessModel: {
      type: String,
      trim: true,
    },
    pricing: {
      type: String,
      trim: true,
    },
    problemStatement: {
      type: String,
      trim: true,
    },
    uniqueSellingProposition: {
      type: String,
      trim: true,
    },
    analysis: {
      startupScore: Number,
      scoreBreakdown: {
        market: { type: Number, default: 0 },
        product: { type: Number, default: 0 },
        team: { type: Number, default: 0 },
        execution: { type: Number, default: 0 },
      },
      monthlyProjections: [
        {
          month: String,
          revenue: Number,
          expenses: Number,
        },
      ],
      marketPotential: String,
      revenuePrediction: String,
      growthPrediction: String,
      cashFlow: String,
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      risks: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Simulation", simulationSchema);