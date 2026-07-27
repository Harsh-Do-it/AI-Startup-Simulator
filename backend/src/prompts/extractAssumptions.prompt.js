/**
 * Assumption Extraction Prompt
 *
 * Takes a natural-language startup idea and instructs AI to extract
 * structured assumptions. The AI ONLY suggests initial parameters —
 * it does NOT generate financial projections.
 */

const buildExtractAssumptionsPrompt = ({ startupName, idea }) => {
  return `You are an experienced startup analyst. A founder has described their startup idea. Your task is to extract structured business assumptions from their description.

IMPORTANT RULES:
- Extract what the founder explicitly stated.
- For anything NOT explicitly stated, provide a reasonable DEFAULT with "source": "default".
- For anything the founder DID state, mark it as "source": "extracted".
- Be realistic and conservative — do NOT invent optimistic numbers.
- All monetary values should be in USD.
- Do NOT generate revenue projections, growth curves, or financial forecasts.
- You are ONLY extracting initial parameters.

Startup Name: ${startupName}
Founder's Description: ${idea}

Return ONLY valid JSON. No markdown, no code fences, no explanations.

{
  "industry": "",
  "targetCustomer": "",
  "targetMarket": "",
  "businessModel": "",
  "price": 0,
  "startingCapital": 0,
  "initialCustomers": 0,
  "conversionRate": 0.03,
  "monthlyChurn": 0.05,
  "competitionPressure": 0.5,
  "initialMarketingBudget": 0,
  "fixedCosts": {
    "salaries": 0,
    "softwareTools": 0,
    "office": 0,
    "admin": 0
  },
  "variableCostPerCustomer": 0,
  "teamSize": 2,
  "hiringPlan": [
    { "month": 5, "role": "developer", "monthlyCost": 0 },
    { "month": 8, "role": "sales", "monthlyCost": 0 }
  ],
  "milestones": [
    { "name": "MVP Development", "expectedMonth": 1, "completed": false },
    { "name": "First User Launch", "expectedMonth": 3, "completed": false },
    { "name": "Major Feature Release", "expectedMonth": 6, "completed": false }
  ],
  "marketingChannels": [
    {
      "name": "Paid Ads",
      "budget": 0,
      "baseCostPerLead": 8,
      "baseConversionRate": 0.04,
      "rampUpMonths": 1
    }
  ],
  "sources": {
    "industry": "extracted",
    "targetCustomer": "extracted",
    "targetMarket": "default",
    "businessModel": "extracted",
    "price": "default",
    "startingCapital": "default",
    "initialCustomers": "default",
    "conversionRate": "default",
    "monthlyChurn": "default",
    "competitionPressure": "default",
    "initialMarketingBudget": "default",
    "fixedCosts": "default",
    "variableCostPerCustomer": "default",
    "teamSize": "default"
  }
}

Rules:
- "industry" should be a specific industry category (e.g., "HealthTech", "EdTech", "FinTech", "SaaS", "E-Commerce").
- "businessModel" should be one of: "Subscription", "Freemium", "Marketplace", "One-Time Purchase", "SaaS", "E-Commerce".
- "price" is the monthly price per customer (for subscription) or average order value (for one-time).
- "startingCapital" should be realistic for the described startup stage. If not mentioned, use 25000 to 100000.
- "conversionRate" is the fraction of leads that become customers (0.01 to 0.15 typical).
- "monthlyChurn" is the fraction of customers lost per month (0.02 to 0.10 typical).
- "competitionPressure" is 0 (no competition) to 1 (extremely competitive). Most markets are 0.3 to 0.7.
- "fixedCosts.salaries" should reflect the team size and market. A 2-person team in India might be $2000-4000/month total.
- "variableCostPerCustomer" is the monthly cost to serve each customer (hosting, support, etc). Typically $0.50 to $5.
- "hiringPlan" should have 1-3 realistic hires. Each hire has a "month" (1-12), "role" (developer/sales/marketing/support/designer), and "monthlyCost".
- "milestones" should have 3-5 product milestones with "name", "expectedMonth" (1-12), and "completed" (always false).
- "marketingChannels" should have 2-4 channels. Each needs "name", "budget" (monthly), "baseCostPerLead", "baseConversionRate", "rampUpMonths".
  - Total channel budgets should approximately equal "initialMarketingBudget".
- "sources" must accurately reflect which values were extracted from the founder's text vs. which are your defaults.
- Return ONLY the raw JSON object, nothing else.`;
};

module.exports = { buildExtractAssumptionsPrompt };
