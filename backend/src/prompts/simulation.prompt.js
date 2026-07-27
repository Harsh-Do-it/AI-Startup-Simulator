const buildSimulationPrompt = ({
  startupName,
  idea,
  industry,
  targetAudience,
  businessModel,
  pricing,
  problemStatement,
  uniqueSellingProposition,
}) => {
  return `You are an experienced Startup Mentor and Venture Capitalist with 20 years of experience evaluating early-stage startups.

Analyze the following startup idea and return a professional, realistic evaluation.

Startup Name: ${startupName}
Idea: ${idea}
Industry: ${industry}
Target Audience: ${targetAudience}
Business Model: ${businessModel}
Pricing: ${pricing}
Problem Statement: ${problemStatement}
Unique Selling Proposition: ${uniqueSellingProposition}

Evaluate the startup on market potential, revenue prediction, growth prediction, cash flow outlook, strengths, weaknesses, risks, and recommendations. Provide a score breakdown across Market, Product, Team, and Execution. Provide a realistic 12-month financial projection (revenue and expenses).

You must respond with ONLY valid JSON. Do not include markdown formatting, code fences, explanations, or any text outside the JSON object.

Return the JSON in exactly this structure:

{
  "startupScore": 0,
  "scoreBreakdown": {
    "market": 0,
    "product": 0,
    "team": 0,
    "execution": 0
  },
  "monthlyProjections": [
    { "month": "Jan", "revenue": 0, "expenses": 0 },
    ... 11 more months
  ],
  "marketPotential": "",
  "revenuePrediction": "",
  "growthPrediction": "",
  "cashFlow": "",
  "strengths": [],
  "weaknesses": [],
  "risks": [],
  "recommendations": []
}

Rules:
- "startupScore" and the values in "scoreBreakdown" must be numbers between 0 and 100.
- "monthlyProjections" must contain exactly 12 objects, with "month" (e.g., "Jan", "Feb", etc.), "revenue" (numeric), and "expenses" (numeric).
- "marketPotential", "revenuePrediction", "growthPrediction", and "cashFlow" must be concise professional paragraphs (2-3 sentences each).
- "strengths", "weaknesses", "risks", and "recommendations" must each be arrays of 3 to 5 short string items.
- Return ONLY the raw JSON object, nothing else.`;
};

module.exports = { buildSimulationPrompt };