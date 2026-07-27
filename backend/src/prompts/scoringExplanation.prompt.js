/**
 * Scoring Explanation Prompt Builder
 *
 * Generates an AI prompt to enrich the deterministic scoring evaluation with
 * tailored qualitative insights and business explanations.
 *
 * NOTE: The AI does NOT assign numerical point values. The backend engine has
 * already calculated the exact scores. The AI only provides narrative depth.
 */

const buildScoringExplanationPrompt = ({ startupName, idea, assumptions, scoreResult }) => {
  return `You are a Senior Venture Capital Partner and Executive Startup Advisor at Startup Matrix.
We have just completed a deterministic 12-month financial simulation and calculated a Readiness Score for the startup:

STARTUP NAME: ${startupName}
IDEA: ${idea}
INDUSTRY: ${assumptions.industry || "General"}
TARGET CUSTOMER: ${assumptions.targetCustomer || "General"}

OVERALL DETERMINISTIC SCORE: ${scoreResult.overallScore} / 100 (${scoreResult.classification})
CONFIDENCE LEVEL: ${scoreResult.confidence?.level} (${scoreResult.confidence?.score}/100)

DETERMINISTIC CATEGORY BREAKDOWN:
${Object.values(scoreResult.breakdown || {}).map((cat) => `
- ${cat.category}: ${cat.score} / ${cat.maxScore} points
  Current Explanation: ${cat.explanation}
  Key Metrics: ${JSON.stringify(cat.metrics)}
`).join("\n")}

YOUR TASK:
Review the startup's deterministic readiness score and provide sharp, professional narrative explanations for each category.
You must NOT change any numbers or scores. Your job is only to provide deeper executive insight and context.

RETURN ONLY VALID JSON matching this exact schema (no markdown formatting, no code blocks):
{
  "breakdown": {
    "marketOpportunity": { "explanation": "Rich 2-sentence executive assessment of market size and accessibility." },
    "customerProblem": { "explanation": "Rich 2-sentence assessment of problem pain point and willingness to pay." },
    "customerTraction": { "explanation": "Rich 2-sentence assessment of user growth vs. churn dynamics." },
    "businessModel": { "explanation": "Rich 2-sentence assessment of revenue scaling and monetization." },
    "unitEconomics": { "explanation": "Rich 2-sentence assessment of CAC, LTV, and customer payback efficiency." },
    "financialSustainability": { "explanation": "Rich 2-sentence assessment of cash runway, burn rate, and break-even progress." },
    "competition": { "explanation": "Rich 2-sentence assessment of defensibility and competitive rivalry." }
  },
  "overallAssessment": "A 3-4 sentence executive summary of the startup's readiness under these simulated assumptions."
}`;
};

module.exports = {
  buildScoringExplanationPrompt,
};
