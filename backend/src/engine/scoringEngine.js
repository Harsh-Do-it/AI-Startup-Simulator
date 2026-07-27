/**
 * Startup Idea Scoring Engine — Deterministic Post-Simulation Scorer
 *
 * Runs AFTER the 12-month startup simulation has completed.
 * Evaluates startup readiness against predefined business criteria under the
 * selected simulation assumptions.
 *
 * PRINCIPLE:
 * The score is NOT a prediction of guaranteed success. It is a structured
 * decision-support readiness evaluation of how the business performs under
 * explicit simulated conditions.
 */

const { runSimulation } = require("./simulationEngine");
const { generateAllScenarios } = require("./scenarioGenerator");

// ─── Survival Multiplier & Classification Mapping ────────────────────────────

const calculateSurvivalFactor = (cashExhaustedMonth) => {
  if (!cashExhaustedMonth) return 1.0;
  if (cashExhaustedMonth >= 10) return 0.85;
  if (cashExhaustedMonth >= 6) return 0.65;
  return 0.45;
};

const getClassification = (score, cashExhaustedMonth = null, opportunityScore = 100) => {
  if (cashExhaustedMonth !== null && cashExhaustedMonth !== undefined && cashExhaustedMonth <= 12) {
    if (cashExhaustedMonth <= 5) {
      return "High Risk (Immediate Cash Insolvency)";
    }
    if (cashExhaustedMonth <= 9) {
      return "High Risk (Mid-Year Cash Insolvency)";
    }
    return opportunityScore >= 65 ? "Promising Idea — Unfunded Plan" : "High Risk — Unfunded Plan";
  }
  if (score >= 90) return "Exceptional Simulation Result";
  if (score >= 80) return "Strong Potential";
  if (score >= 65) return "Promising";
  if (score >= 50) return "Early Validation Required";
  return "Weak Fundamentals — Reconsider Core Assumptions";
};

// ─── Category 1: Market Opportunity (15 pts) ─────────────────────────────────

const scoreMarketOpportunity = (assumptions) => {
  const { industry = "", targetMarket = "Global", price = 0, startingCapital = 0 } = assumptions;
  let score = 8;
  const strengths = [];
  const weaknesses = [];

  // Market scope
  if (["global", "international", "north america", "us & canada", "worldwide"].includes(targetMarket.toLowerCase())) {
    score += 3;
    strengths.push("Large target market accessibility (Global/National scale)");
  } else {
    score += 1;
    weaknesses.push("Relatively focused or regional initial target market");
  }

  // Industry attractiveness (high growth tech sectors)
  const ind = industry.toLowerCase();
  if (ind.includes("ai") || ind.includes("tech") || ind.includes("saas") || ind.includes("health") || ind.includes("fintech") || ind.includes("edtech") || ind.includes("bio")) {
    score += 3;
    strengths.push(`High-growth and expanding industry sector (${industry})`);
  } else {
    score += 1;
  }

  // Starting capital runway readiness
  if (startingCapital >= 50000) {
    score += 1;
    strengths.push(`Solid initial capitalization ($${startingCapital.toLocaleString()}) to test market channels`);
  } else if (startingCapital < 15000) {
    weaknesses.push(`Limited starting capital ($${startingCapital.toLocaleString()}) constrains initial market expansion`);
  }

  const finalScore = Math.min(15, Math.max(3, score));
  return {
    category: "Market Opportunity",
    score: finalScore,
    maxScore: 15,
    metrics: { industry, targetMarket, startingCapital },
    strengths,
    weaknesses,
    explanation: `Targeting ${targetMarket} market in ${industry} with starting capital of $${startingCapital.toLocaleString()}. ${strengths[0] || ""}`.trim(),
  };
};

// ─── Category 2: Customer Problem Strength (15 pts) ──────────────────────────

const scoreCustomerProblem = (assumptions, simResult) => {
  const { price = 0, monthlyChurn = 0.05, businessModel = "" } = assumptions;
  let score = 6;
  const strengths = [];
  const weaknesses = [];

  // Churn reflects how vital the product is (low churn = solving a painful problem)
  if (monthlyChurn <= 0.05) {
    score += 5;
    strengths.push(`Low simulated monthly churn (${(monthlyChurn * 100).toFixed(1)}%) indicates strong product stickiness and recurring need`);
  } else if (monthlyChurn <= 0.08) {
    score += 3;
  } else {
    weaknesses.push(`High monthly churn (${(monthlyChurn * 100).toFixed(1)}%) suggests existing solutions or alternatives may easily replace this product`);
  }

  // Willingness to pay
  if (price >= 25) {
    score += 4;
    strengths.push(`Demonstrated customer willingness to pay ($${price}/mo or transaction)`);
  } else if (price >= 10) {
    score += 3;
  } else {
    weaknesses.push(`Low price point ($${price}) requires high transaction volume to prove urgent problem value`);
  }

  const finalScore = Math.min(15, Math.max(3, score));
  return {
    category: "Customer Problem Strength",
    score: finalScore,
    maxScore: 15,
    metrics: { price, monthlyChurn, businessModel },
    strengths,
    weaknesses,
    explanation: `Monthly churn of ${(monthlyChurn * 100).toFixed(1)}% with $${price} pricing indicates ${monthlyChurn <= 0.06 ? 'a recurring customer pain point with strong retention potential' : 'moderate retention risk where customers may seek alternatives'}.`,
  };
};

// ─── Category 3: Customer Traction (15 pts) ──────────────────────────────────

const scoreCustomerTraction = (assumptions, simResult) => {
  const { summary, monthlySimulation = [] } = simResult;
  const { monthlyChurn = 0.05 } = assumptions;
  const m1Customers = monthlySimulation[0]?.activeCustomers || 0;
  const m12Customers = summary?.finalActiveCustomers || 0;
  
  let score = 4;
  const strengths = [];
  const weaknesses = [];

  // Customer growth
  const growthMultiplier = m1Customers > 0 ? (m12Customers / m1Customers) : (m12Customers > 0 ? 5 : 0);
  if (growthMultiplier >= 5) {
    score += 6;
    strengths.push(`Strong customer base expansion (grew from ${m1Customers} to ${m12Customers} active users)`);
  } else if (growthMultiplier >= 2) {
    score += 4;
    strengths.push(`Positive user acquisition trajectory over 12 months`);
  } else if (m12Customers > m1Customers) {
    score += 2;
  } else {
    weaknesses.push(`Stagnant or declining active customer count by Month 12`);
  }

  // Absolute volume check
  if (m12Customers >= 500) {
    score += 4;
  } else if (m12Customers >= 150) {
    score += 3;
  } else if (m12Customers < 50) {
    weaknesses.push(`Low ending customer volume (${m12Customers} users) limits traction proof`);
  }

  // Churn quality penalty (Do NOT reward high count with terrible churn)
  if (monthlyChurn > 0.09) {
    score -= 3;
    weaknesses.push(`High churn erodes long-term customer traction despite initial lead acquisition`);
  } else if (monthlyChurn <= 0.05) {
    score += 1;
    strengths.push(`Solid user retention protects acquisition gains`);
  }

  const finalScore = Math.min(15, Math.max(2, score));
  return {
    category: "Customer Traction",
    score: finalScore,
    maxScore: 15,
    metrics: { m1Customers, m12Customers, growthMultiplier: Math.round(growthMultiplier * 10) / 10 },
    strengths,
    weaknesses,
    explanation: `Active customers grew from ${m1Customers} to ${m12Customers} during the 12-month simulation with ${(monthlyChurn * 100).toFixed(1)}% monthly churn.`,
  };
};

// ─── Category 4: Business Model (15 pts) ─────────────────────────────────────

const scoreBusinessModel = (assumptions, simResult) => {
  const { summary, monthlySimulation = [] } = simResult;
  const { businessModel = "" } = assumptions;
  const totalRev = summary?.totalRevenue || 0;
  const m1Rev = monthlySimulation[0]?.revenue || 0;
  const m12Rev = monthlySimulation[11]?.revenue || 0;

  let score = 3;
  const strengths = [];
  const weaknesses = [];

  // Revenue scale
  if (totalRev >= 150000) {
    score += 7;
    strengths.push(`Strong revenue generation ($${totalRev.toLocaleString()} over 12 months)`);
  } else if (totalRev >= 50000) {
    score += 5;
    strengths.push(`Healthy initial revenue scale ($${totalRev.toLocaleString()})`);
  } else if (totalRev >= 15000) {
    score += 3;
  } else {
    weaknesses.push(`Low cumulative revenue ($${totalRev.toLocaleString()}) indicates early monetization friction`);
  }

  // Revenue growth consistency
  if (m12Rev > m1Rev * 1.5) {
    score += 3;
    strengths.push(`Consistent upward monthly revenue trend ($${m1Rev.toLocaleString()} ➔ $${m12Rev.toLocaleString()})`);
  } else if (m12Rev <= m1Rev) {
    weaknesses.push(`Revenue failed to scale between Month 1 and Month 12`);
  }

  // Model clarity
  if (businessModel.toLowerCase().includes("subscription") || businessModel.toLowerCase().includes("saas")) {
    score += 2;
    strengths.push(`Predictable recurring subscription business model`);
  } else {
    score += 1;
  }

  const finalScore = Math.min(15, Math.max(2, score));
  return {
    category: "Business Model",
    score: finalScore,
    maxScore: 15,
    metrics: { totalRevenue: totalRev, m1Revenue: m1Rev, m12Revenue: m12Rev, businessModel },
    strengths,
    weaknesses,
    explanation: `Generated $${totalRev.toLocaleString()} in total 12-month revenue with ${m12Rev > m1Rev ? 'a positive monthly growth trajectory' : 'flat or declining monthly revenue'}.`,
  };
};

// ─── Category 5: Unit Economics (15 pts) ─────────────────────────────────────

const scoreUnitEconomics = (assumptions, simResult) => {
  const { summary } = simResult;
  const cac = summary?.finalCAC || 0;
  const ltv = summary?.finalLTV || 0;
  const ratio = summary?.finalLtvCacRatio || 0;

  let score = 2;
  const strengths = [];
  const weaknesses = [];

  // LTV:CAC relationship
  if (ratio >= 3.0) {
    score += 8;
    strengths.push(`Excellent LTV:CAC ratio (${ratio}:1), exceeding industry benchmark of 3:1`);
  } else if (ratio >= 2.0) {
    score += 6;
    strengths.push(`Healthy LTV:CAC ratio (${ratio}:1) supporting sustainable acquisition`);
  } else if (ratio >= 1.0) {
    score += 3;
    weaknesses.push(`LTV:CAC ratio (${ratio}:1) is below 2:1, leaving narrow margins for acquisition costs`);
  } else if (cac > 0) {
    weaknesses.push(`Unhealthy unit economics: Customer Acquisition Cost ($${cac}) exceeds Lifetime Value ($${ltv})`);
  }

  // CAC efficiency
  if (cac > 0 && cac < 150) {
    score += 3;
    strengths.push(`Efficient customer acquisition cost ($${cac}/user)`);
  } else if (cac >= 400) {
    weaknesses.push(`High acquisition cost ($${cac}/user) requires high retention to recover investment`);
  } else if (cac === 0) {
    score += 2; // Pure organic or zero ad spend
  }

  // LTV scale
  if (ltv >= 500) {
    score += 2;
  }

  const finalScore = Math.min(15, Math.max(1, score));
  return {
    category: "Unit Economics",
    score: finalScore,
    maxScore: 15,
    metrics: { cac, ltv, ltvCacRatio: ratio },
    strengths,
    weaknesses,
    explanation: `Simulated Lifetime Value of $${ltv} versus Acquisition Cost of $${cac} yields an LTV:CAC ratio of ${ratio}:1.`,
  };
};

// ─── Category 6: Financial Sustainability (15 pts) ───────────────────────────

const scoreFinancialSustainability = (assumptions, simResult) => {
  const { summary } = simResult;
  const { startingCapital = 0 } = assumptions;
  const cashExhaustedMonth = summary?.cashExhaustedMonth || null;
  const breakEvenMonth = summary?.breakEvenMonth || null;
  const endingCash = summary?.finalEndingCash || 0;

  let score = 5;
  const strengths = [];
  const weaknesses = [];

  const criticalAlertsCount = (simResult.warnings || []).filter((w) => w.severity === "critical").length;

  if (cashExhaustedMonth) {
    // CRITICAL PENALTY: Startup ran out of cash
    if (cashExhaustedMonth <= 3) score = 0;
    else if (cashExhaustedMonth <= 6) score = 1;
    else if (cashExhaustedMonth <= 9 || criticalAlertsCount >= 3) score = 2;
    else score = 3;
    weaknesses.push(`Critical risk: Startup runs out of cash in Month ${cashExhaustedMonth} under current expense and revenue assumptions`);
    weaknesses.push(`Current capitalization ($${startingCapital.toLocaleString()}) is insufficient to reach profitability`);
  } else {
    // Survived 12 months
    score += 4;
    strengths.push(`Maintained positive cash flow balance through all 12 months without insolvency`);

    if (breakEvenMonth) {
      score += 4;
      strengths.push(`Achieved monthly break-even profitability in Month ${breakEvenMonth}`);
    } else {
      weaknesses.push(`Did not achieve monthly break-even within the first 12 months`);
    }

    if (endingCash >= startingCapital) {
      score += 2;
      strengths.push(`Ending cash balance ($${endingCash.toLocaleString()}) exceeds starting capital`);
    } else if (endingCash < startingCapital * 0.3) {
      weaknesses.push(`Low ending cash runway ($${endingCash.toLocaleString()}) indicates upcoming capital need`);
    }
  }

  const finalScore = Math.min(15, Math.max(0, score));
  return {
    category: "Financial Sustainability",
    score: finalScore,
    maxScore: 15,
    metrics: { startingCapital, endingCash, breakEvenMonth, cashExhaustedMonth },
    strengths,
    weaknesses,
    explanation: cashExhaustedMonth 
      ? `The startup has traction potential, but current funding and expense assumptions cause cash exhaustion in Month ${cashExhaustedMonth}.`
      : `Survived 12 months with ending cash of $${endingCash.toLocaleString()}${breakEvenMonth ? ' and reached break-even in Month ' + breakEvenMonth : ''}.`,
  };
};

// ─── Category 7: Competition and Differentiation (10 pts) ────────────────────

const scoreCompetition = (assumptions, simResult) => {
  const { competitionPressure = 0.5, targetCustomer = "" } = assumptions;
  let score = 4;
  const strengths = [];
  const weaknesses = [];

  if (competitionPressure <= 0.3) {
    score += 4;
    strengths.push(`Low competitive pressure (${competitionPressure * 100}%) allows easier market entry and pricing power`);
  } else if (competitionPressure <= 0.6) {
    score += 2;
    strengths.push(`Manageable competitive rivalry in target sector`);
  } else {
    weaknesses.push(`Intense competition pressure (${competitionPressure * 100}%) increases CAC and churn risk`);
  }

  // Niche targeting check
  if (targetCustomer && targetCustomer.length > 5 && !targetCustomer.toLowerCase().includes("everyone")) {
    score += 2;
    strengths.push(`Clear, specific target customer niche ('${targetCustomer}') improves defensibility`);
  } else {
    weaknesses.push(`Broad or generic customer targeting makes differentiation against incumbents harder`);
  }

  const finalScore = Math.min(10, Math.max(2, score));
  return {
    category: "Competition and Differentiation",
    score: finalScore,
    maxScore: 10,
    metrics: { competitionPressure, targetCustomer },
    strengths,
    weaknesses,
    explanation: `Competitive pressure factor of ${(competitionPressure * 100).toFixed(0)}% targeting '${targetCustomer}'. ${strengths[0] || weaknesses[0] || ""}`.trim(),
  };
};

// ─── Confidence Level Calculation ────────────────────────────────────────────

const calculateConfidence = (assumptions, simResult) => {
  const reasons = [];
  let confidencePoints = 75; // Start at medium-high

  // User provided custom pricing / starting cash
  if (assumptions.price && assumptions.startingCapital) {
    reasons.push("Core financial inputs (pricing, starting capital) were explicitly defined");
  }

  // Check marketing channels
  if (assumptions.marketingChannels && assumptions.marketingChannels.length > 0) {
    reasons.push("Acquisition strategy includes defined channel budgets and CAC estimates");
    confidencePoints += 10;
  } else {
    reasons.push("Marketing acquisition uses general industry baseline estimates");
    confidencePoints -= 15;
  }

  // Check hiring plan / salaries
  if (assumptions.hiringPlan && assumptions.hiringPlan.length > 0) {
    reasons.push("Operational expense scaling includes a structured hiring timeline");
    confidencePoints += 5;
  }

  // Check for verified market benchmark grounding
  if (assumptions.benchmarkCitations && assumptions.benchmarkCitations.length > 0) {
    reasons.push(`${assumptions.benchmarkCitations.length} omitted inputs were grounded in verified 2026 industry benchmarks`);
    confidencePoints += 5;
  }

  // Check if simulation ran into extreme edge cases
  if (simResult.summary?.cashExhaustedMonth <= 3) {
    reasons.push("Rapid early cash exhaustion limits long-term simulation observability");
    confidencePoints -= 10;
  }

  let level = "Medium";
  if (confidencePoints >= 80) level = "High";
  else if (confidencePoints < 60) level = "Low";

  return {
    level,
    score: Math.min(95, Math.max(40, confidencePoints)),
    reasons,
  };
};

// ─── Recommendations Generator ───────────────────────────────────────────────

const generateRecommendations = (categories) => {
  // Sort categories by their normalized percentage score ascending
  const sorted = [...categories].sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore));
  const recs = [];

  for (const cat of sorted) {
    if (recs.length >= 3) break;

    if (cat.category === "Unit Economics") {
      recs.push({
        category: cat.category,
        title: "Optimize Acquisition & Unit Economics",
        recommendation: "Your Customer Acquisition Cost is high relative to Lifetime Value. Consider testing organic or content channels, improving onboarding retention, or focusing on higher-paying customer segments.",
      });
    } else if (cat.category === "Financial Sustainability") {
      recs.push({
        category: cat.category,
        title: "Extend Cash Runway & Control Burn",
        recommendation: "The simulation reveals cash flow pressure before reaching profitability. Consider trimming initial fixed overhead, delaying non-essential hiring until Month 6, or securing a larger starting capital buffer.",
      });
    } else if (cat.category === "Customer Traction") {
      recs.push({
        category: cat.category,
        title: "Boost User Growth and Minimize Churn",
        recommendation: "Customer growth is restrained by churn or lead conversion bottlenecks. Prioritize product-market fit improvements in early months and streamline the conversion funnel.",
      });
    } else if (cat.category === "Business Model") {
      recs.push({
        category: cat.category,
        title: "Refine Pricing & Revenue Scaling",
        recommendation: "Cumulative 12-month revenue remains modest. Experiment with tiered subscription pricing, annual billing discounts, or add-on monetization to increase average revenue per user.",
      });
    } else if (cat.category === "Competition and Differentiation") {
      recs.push({
        category: cat.category,
        title: "Strengthen Niche Defensibility",
        recommendation: "Competitive rivalry could erode margins. Double down on a specialized customer niche or proprietary workflow feature that established incumbents cannot easily replicate.",
      });
    } else if (cat.category === "Customer Problem Strength") {
      recs.push({
        category: cat.category,
        title: "Validate Problem Urgency & Stickiness",
        recommendation: "Ensure the product solves a must-have operational or financial pain point rather than a convenience, which will naturally lower churn and support higher pricing.",
      });
    } else if (cat.category === "Market Opportunity") {
      recs.push({
        category: cat.category,
        title: "Expand Target Market Reach",
        recommendation: "Evaluate pathways to scale from initial niche adoption into broader national or international market segments once product-market fit is validated.",
      });
    }
  }

  return recs;
};

// ─── Score Sensitivity Analysis ──────────────────────────────────────────────

const runSensitivityAnalysis = (assumptions, currentOverallScore) => {
  const testCases = [
    {
      action: "Reduce customer acquisition cost by 20%",
      param: "marketingChannels",
      modify: (a) => {
        const copy = JSON.parse(JSON.stringify(a));
        if (copy.marketingChannels) {
          copy.marketingChannels.forEach((ch) => {
            ch.baseCostPerLead = Math.max(1, ch.baseCostPerLead * 0.8);
          });
        }
        return copy;
      },
      description: "Lowering CPL directly decreases CAC, improving LTV:CAC ratios and marketing efficiency.",
    },
    {
      action: "Reduce monthly churn by 2%",
      param: "monthlyChurn",
      modify: (a) => {
        const copy = JSON.parse(JSON.stringify(a));
        copy.monthlyChurn = Math.max(0.01, copy.monthlyChurn - 0.02);
        return copy;
      },
      description: "Improving customer retention extends user lifetime value and accelerates compounding user growth.",
    },
    {
      action: "Increase product pricing by 15%",
      param: "price",
      modify: (a) => {
        const copy = JSON.parse(JSON.stringify(a));
        copy.price = Math.round(copy.price * 1.15);
        return copy;
      },
      description: "Higher average revenue per user immediately boosts monthly revenue and gross margins.",
    },
    {
      action: "Reduce fixed overhead & salaries by 15%",
      param: "fixedCosts",
      modify: (a) => {
        const copy = JSON.parse(JSON.stringify(a));
        if (copy.fixedCosts) {
          copy.fixedCosts.salaries = Math.round((copy.fixedCosts.salaries || 0) * 0.85);
          copy.fixedCosts.softwareTools = Math.round((copy.fixedCosts.softwareTools || 0) * 0.85);
        }
        return copy;
      },
      description: "Controlling operational expenses lowers monthly burn and extends runway without sacrificing growth.",
    },
    {
      action: "Increase ad conversion rate by 25%",
      param: "conversionRate",
      modify: (a) => {
        const copy = JSON.parse(JSON.stringify(a));
        copy.conversionRate = Math.min(0.5, copy.conversionRate * 1.25);
        if (copy.marketingChannels) {
          copy.marketingChannels.forEach((ch) => {
            ch.baseConversionRate = Math.min(0.5, ch.baseConversionRate * 1.25);
          });
        }
        return copy;
      },
      description: "Optimizing landing pages and onboarding funnels generates significantly more customers from the same ad budget.",
    },
  ];

  const results = [];

  for (const tc of testCases) {
    try {
      const modifiedAssumptions = tc.modify(assumptions);
      const simRes = runSimulation(modifiedAssumptions);
      
      // Calculate new score purely from the deterministic functions
      const mOpp = scoreMarketOpportunity(modifiedAssumptions);
      const cProb = scoreCustomerProblem(modifiedAssumptions, simRes);
      const cTrac = scoreCustomerTraction(modifiedAssumptions, simRes);
      const bMod = scoreBusinessModel(modifiedAssumptions, simRes);
      const uEcon = scoreUnitEconomics(modifiedAssumptions, simRes);
      const fSust = scoreFinancialSustainability(modifiedAssumptions, simRes);
      const comp = scoreCompetition(modifiedAssumptions, simRes);

      const rawNewScore = Math.min(100, Math.max(0, mOpp.score + cProb.score + cTrac.score + bMod.score + uEcon.score + fSust.score + comp.score));
      const newSurvivalFactor = calculateSurvivalFactor(simRes.summary?.cashExhaustedMonth || null);
      const newScore = Math.round(rawNewScore * newSurvivalFactor);
      const delta = Math.round(newScore - currentOverallScore);

      let description = tc.description;
      if (delta < 0) {
        description = `${tc.description} (Why did this lower the score? Under your current capital and burn constraints, faster customer acquisition increases operational burn and support/server scaling load, accelerating cash exhaustion earlier when runway buffer is tight.)`;
      }

      results.push({
        action: tc.action,
        param: tc.param,
        newScore,
        impactDelta: delta,
        description,
      });
    } catch (err) {
      // If a test case fails, skip it gracefully
    }
  }

  // Sort by highest impact first
  return results.sort((a, b) => b.impactDelta - a.impactDelta);
};

// ─── Main Scorer Function ────────────────────────────────────────────────────

/**
 * Calculate the complete Startup Readiness Score after simulation.
 *
 * @param {object} assumptions - Validated startup assumptions
 * @param {object} simResult - Result from runSimulation()
 * @param {object} [existingScenarios] - Optional precalculated scenarios
 * @returns {object} Full scoring assessment object
 */
const calculateStartupScore = (assumptions, simResult, existingScenarios = null) => {
  const mOpp = scoreMarketOpportunity(assumptions);
  const cProb = scoreCustomerProblem(assumptions, simResult);
  const cTrac = scoreCustomerTraction(assumptions, simResult);
  const bMod = scoreBusinessModel(assumptions, simResult);
  const uEcon = scoreUnitEconomics(assumptions, simResult);
  const fSust = scoreFinancialSustainability(assumptions, simResult);
  const comp = scoreCompetition(assumptions, simResult);

  const categories = [mOpp, cProb, cTrac, bMod, uEcon, fSust, comp];
  const opportunityScore = Math.min(100, Math.max(0, categories.reduce((sum, cat) => sum + cat.score, 0)));
  
  const cashExhaustedMonth = simResult.summary?.cashExhaustedMonth || null;
  const survivalFactor = calculateSurvivalFactor(cashExhaustedMonth);
  const viabilityScore = Math.round(opportunityScore * survivalFactor);
  const overallScore = viabilityScore;

  const classification = getClassification(overallScore, cashExhaustedMonth, opportunityScore);
  const confidence = calculateConfidence(assumptions, simResult);
  const recommendations = generateRecommendations(categories);
  const sensitivityAnalysis = runSensitivityAnalysis(assumptions, overallScore);

  // Scenario scores comparison
  const scenariosToUse = existingScenarios || generateAllScenarios(assumptions);
  const scenarioScores = {};

  for (const [key, scenData] of Object.entries(scenariosToUse)) {
    if (scenData && scenData.assumptions && scenData.summary) {
      const sMOpp = scoreMarketOpportunity(scenData.assumptions);
      const sCProb = scoreCustomerProblem(scenData.assumptions, scenData);
      const sCTrac = scoreCustomerTraction(scenData.assumptions, scenData);
      const sBMod = scoreBusinessModel(scenData.assumptions, scenData);
      const sUEcon = scoreUnitEconomics(scenData.assumptions, scenData);
      const sFSust = scoreFinancialSustainability(scenData.assumptions, scenData);
      const sComp = scoreCompetition(scenData.assumptions, scenData);

      const sOppScore = Math.min(100, Math.max(0, sMOpp.score + sCProb.score + sCTrac.score + sBMod.score + sUEcon.score + sFSust.score + sComp.score));
      const sSurvivalFactor = calculateSurvivalFactor(scenData.summary?.cashExhaustedMonth || null);
      scenarioScores[key] = Math.round(sOppScore * sSurvivalFactor);
    } else {
      scenarioScores[key] = overallScore;
    }
  }

  // Combine category breakdown into structured dictionary matching Master Prompt schema
  const breakdown = {
    marketOpportunity: mOpp,
    customerProblem: cProb,
    customerTraction: cTrac,
    businessModel: bMod,
    unitEconomics: uEcon,
    financialSustainability: fSust,
    competition: comp,
  };

  // Extract top strengths and risks across all categories
  const topStrengths = [];
  const topRisks = [];

  categories.forEach((cat) => {
    if (cat.strengths && cat.strengths.length > 0) topStrengths.push(...cat.strengths);
    if (cat.weaknesses && cat.weaknesses.length > 0) topRisks.push(...cat.weaknesses);
  });

  return {
    scoringEngineVersion: "2.2.0",
    overallScore,
    opportunityScore,
    viabilityScore,
    survivalFactor,
    cashExhaustedMonth,
    classification,
    scoringEngineVersion: "2.2.0",
    confidence,
    breakdown,
    topStrengths: topStrengths.slice(0, 5),
    topRisks: topRisks.slice(0, 5),
    recommendations,
    sensitivityAnalysis,
    scenarioScores,
  };
};

module.exports = {
  calculateStartupScore,
  calculateSurvivalFactor,
  getClassification,
  runSensitivityAnalysis,
  scoreMarketOpportunity,
  scoreCustomerProblem,
  scoreCustomerTraction,
  scoreBusinessModel,
  scoreUnitEconomics,
  scoreFinancialSustainability,
  scoreCompetition,
};
