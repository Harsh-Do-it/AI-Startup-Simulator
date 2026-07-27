const { getBenchmarksForIndustry } = require("../services/marketBenchmarkService");

const buildInvestorQuestionsPrompt = (simulation) => {
  const comps = getBenchmarksForIndustry(simulation.industry || "");
  const compsText = `Market Comps (${comps.industryName}): ARR Valuation Multiple ${comps.valuationMultipleARR.value}x (Range ${comps.valuationMultipleARR.min}x-${comps.valuationMultipleARR.max}x; Source: ${comps.valuationMultipleARR.sourceName}), Typical Monthly Churn ${(comps.churnRate.value * 100).toFixed(1)}%, Regulatory Flags: ${comps.regulatoryFlags.join(", ")}`;

  return `You are a panel of experienced venture capital investors conducting a Shark Tank / Y Combinator style interview for the following startup.

Startup Name: ${simulation.startupName}
Idea: ${simulation.idea}
Industry: ${simulation.industry}
Target Audience: ${simulation.targetAudience}
Business Model: ${simulation.businessModel}
Pricing: ${simulation.pricing}
Problem Statement: ${simulation.problemStatement}
Unique Selling Proposition: ${simulation.uniqueSellingProposition}
${compsText}

Generate exactly 10 tough, realistic, specific investor interview questions covering these categories in this exact order: Problem, Market, Revenue, Competition, Growth, Team, Business Model, Pricing, Marketing, Risks. Ground your Market, Revenue, and Risks questions in the provided Market Comps.

You must respond with ONLY valid JSON. Do not include markdown formatting, code fences, explanations, or any text outside the JSON.

Return the JSON as an array of exactly 10 objects in exactly this structure:

[
  {
    "questionNumber": 1,
    "category": "Problem",
    "question": ""
  }
]

Rules:
- "questionNumber" must be sequential integers from 1 to 10.
- "category" must match the corresponding category from the list above, in order.
- "question" must be specific and challenging, directly referencing details of this startup, not generic.
- Return ONLY the raw JSON array, nothing else.`;
};

const buildAnswerEvaluationPrompt = ({ simulation, question, answer }) => {
  return `You are a senior venture capital investor evaluating a founder's answer during a live pitch interview.

Startup Name: ${simulation.startupName}
Idea: ${simulation.idea}
Industry: ${simulation.industry}

Investor Question: ${question}

Founder's Answer: ${answer}

Evaluate the founder's answer critically and realistically, as a real investor would.

You must respond with ONLY valid JSON. Do not include markdown formatting, code fences, explanations, or any text outside the JSON.

Return the JSON in exactly this structure:

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "investorComment": ""
}

Rules:
- "score" must be a number between 0 and 100 rating the quality of the answer.
- "strengths" must be an array of 1 to 3 short string items.
- "weaknesses" must be an array of 1 to 3 short string items.
- "improvements" must be an array of 1 to 3 short actionable string items.
- "investorComment" must be a short, realistic in-character reaction (1-2 sentences) as a skeptical but fair investor.
- Return ONLY the raw JSON object, nothing else.`;
};

const buildFinalReportPrompt = ({ simulation, questions, answers }) => {
  const comps = getBenchmarksForIndustry(simulation.industry || "");
  const compsText = `Market Comps (${comps.industryName}): ARR Valuation Multiple ${comps.valuationMultipleARR.value}x (Range ${comps.valuationMultipleARR.min}x-${comps.valuationMultipleARR.max}x; Source: ${comps.valuationMultipleARR.sourceName}), Typical Monthly Churn ${(comps.churnRate.value * 100).toFixed(1)}%, Regulatory Flags: ${comps.regulatoryFlags.join(", ")}`;

  const transcript = questions
    .map((q) => {
      const matchingAnswer = answers.find((a) => a.questionNumber === q.questionNumber);
      return `Q${q.questionNumber} (${q.category}): ${q.question}\nAnswer: ${
        matchingAnswer ? matchingAnswer.answer : "No answer provided"
      }\nScore given: ${matchingAnswer ? matchingAnswer.score : "N/A"}`;
    })
    .join("\n\n");

  return `You are a senior venture capital investor delivering a final funding decision after a complete interview with a founder.

Startup Name: ${simulation.startupName}
Idea: ${simulation.idea}
Industry: ${simulation.industry}
Target Audience: ${simulation.targetAudience}
Business Model: ${simulation.businessModel}
Pricing: ${simulation.pricing}
${compsText}

Full Interview Transcript:
${transcript}

Based on the entire interview, produce a final investor report.

You must respond with ONLY valid JSON. Do not include markdown formatting, code fences, explanations, or any text outside the JSON.

Return the JSON in exactly this structure:

{
  "overallScore": 0,
  "decision": "",
  "majorRisks": [],
  "strongPoints": [],
  "weakPoints": [],
  "suggestions": [],
  "probabilityOfFunding": ""
}

Rules:
- "overallScore" must be a number between 0 and 100.
- "decision" must be one of: "Fund", "Do Not Fund", "Fund with Conditions".
- "majorRisks" must be an array of 2 to 5 short string items.
- "strongPoints" must be an array of 2 to 5 short string items.
- "weakPoints" must be an array of 2 to 5 short string items.
- "suggestions" must be an array of 2 to 5 short actionable string items.
- "probabilityOfFunding" must be a short string such as "High", "Medium", "Low", or a percentage description.
- Return ONLY the raw JSON object, nothing else.`;
};

module.exports = {
  buildInvestorQuestionsPrompt,
  buildAnswerEvaluationPrompt,
  buildFinalReportPrompt,
};