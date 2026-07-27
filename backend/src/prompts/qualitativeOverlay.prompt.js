/**
 * Qualitative Overlay Prompt
 *
 * After the deterministic engine produces numerical results,
 * this prompt asks AI to generate contextual qualitative content:
 * - Monthly event descriptions
 * - Risk explanations
 * - Milestone descriptions
 * - Business context
 *
 * The AI MUST base its analysis on the actual numbers provided,
 * NOT invent different numbers.
 */

const buildQualitativeOverlayPrompt = ({ startupName, idea, assumptions, monthlySimulation, summary, warnings }) => {
  // Build a compact summary of what the engine calculated
  const monthSummaries = monthlySimulation.map((m) =>
    `Month ${m.month} (${m.stage}): ${m.activeCustomers} active customers, $${m.revenue} revenue, $${m.totalExpenses} expenses, $${m.endingCash} cash, CAC $${m.cac}, churn ${m.churnedCustomers}`
  ).join("\n");

  const warningsSummary = warnings.length > 0
    ? warnings.map((w) => `- ${w.message}`).join("\n")
    : "No critical warnings.";

  return `You are a startup business analyst providing qualitative context for a 12-month simulation.

The simulation has ALREADY been computed by a deterministic engine. The numbers below are FINAL and CORRECT. Do NOT change or reinterpret them.

Your job is to provide human-readable context, events, and risk explanations for each month.

Startup: ${startupName}
Idea: ${idea}
Industry: ${assumptions.industry}
Business Model: ${assumptions.businessModel}
Target Market: ${assumptions.targetMarket}
Starting Capital: $${assumptions.startingCapital}
Price: $${assumptions.price}

SIMULATION RESULTS:
${monthSummaries}

WARNINGS:
${warningsSummary}

SUMMARY:
- Final Active Customers: ${summary.finalActiveCustomers}
- Total Revenue: $${summary.totalRevenue}
- Total Expenses: $${summary.totalExpenses}
- Final Cash: $${summary.finalEndingCash}
- Break-even Month: ${summary.breakEvenMonth || "Not reached"}
- Cash Exhausted Month: ${summary.cashExhaustedMonth || "Not exhausted"}

Generate qualitative overlays for each month. Return ONLY valid JSON, no markdown.

{
  "monthlyOverlays": [
    {
      "month": 1,
      "event": "A short description of the main business event this month (1-2 sentences).",
      "risk": "A short description of the key risk this month (1-2 sentences).",
      "milestone": "Name of milestone if relevant, or null.",
      "insight": "One actionable insight for the founder (1 sentence)."
    }
  ],
  "overallAssessment": "A 2-3 sentence overall assessment of the 12-month trajectory.",
  "topRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"]
}

Rules:
- "monthlyOverlays" must contain exactly 12 objects, one per month.
- Events should be realistic and grounded in the numbers. For example:
  - If customers dropped, the event might reference a retention problem.
  - If CAC increased, mention marketing efficiency challenges.
  - If cash is declining, mention burn rate concerns.
- Do NOT create dramatic events every month. Some months should be routine.
- Do NOT contradict the simulation numbers.
- "milestone" should reference the actual milestones: ${assumptions.milestones?.map((m) => `"${m.name}" (Month ${m.expectedMonth})`).join(", ") || "No milestones defined"}.
- "topRisks" should be 3 key risks based on the actual simulation data.
- "keyDecisions" should be 3 strategic decisions the founder should consider.
- Return ONLY the raw JSON object, nothing else.`;
};

module.exports = { buildQualitativeOverlayPrompt };
