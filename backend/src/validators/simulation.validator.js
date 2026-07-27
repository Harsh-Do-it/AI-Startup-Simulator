const ApiError = require("../utils/ApiError");

// ─── V1 Legacy Validation ────────────────────────────────────────────────────

const legacyRequiredFields = [
  "startupName",
  "idea",
  "industry",
  "targetAudience",
  "businessModel",
  "pricing",
  "problemStatement",
  "uniqueSellingProposition",
];

const validateSimulationInput = (body) => {
  const errors = [];

  legacyRequiredFields.forEach((field) => {
    if (!body[field] || !String(body[field]).trim()) {
      errors.push(`${field} is required`);
    }
  });

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }
};

// ─── V2 Assumptions Validation ───────────────────────────────────────────────

const validateAssumptions = (assumptions) => {
  const errors = [];

  // Required string fields
  ["industry", "targetCustomer", "businessModel"].forEach((field) => {
    if (!assumptions[field] || !String(assumptions[field]).trim()) {
      errors.push(`${field} is required`);
    }
  });

  // Required positive numbers
  const positiveNumbers = {
    price: { min: 0.01, max: 100000, label: "Product price" },
    startingCapital: { min: 100, max: 100000000, label: "Starting capital" },
    conversionRate: { min: 0.001, max: 0.5, label: "Conversion rate" },
    monthlyChurn: { min: 0, max: 0.5, label: "Monthly churn" },
  };

  Object.entries(positiveNumbers).forEach(([field, { min, max, label }]) => {
    const val = assumptions[field];
    if (val === undefined || val === null || typeof val !== "number") {
      errors.push(`${label} is required and must be a number`);
    } else if (val < min || val > max) {
      errors.push(`${label} must be between ${min} and ${max}`);
    }
  });

  // Optional non-negative numbers
  const optionalNonNeg = [
    "initialCustomers",
    "competitionPressure",
    "initialMarketingBudget",
    "variableCostPerCustomer",
    "teamSize",
    "paymentProcessingRate",
  ];

  optionalNonNeg.forEach((field) => {
    const val = assumptions[field];
    if (val !== undefined && val !== null) {
      if (typeof val !== "number" || val < 0) {
        errors.push(`${field} must be a non-negative number`);
      }
    }
  });

  // Competition pressure range
  if (assumptions.competitionPressure !== undefined) {
    if (assumptions.competitionPressure < 0 || assumptions.competitionPressure > 1) {
      errors.push("Competition pressure must be between 0 and 1");
    }
  }

  // Team size
  if (assumptions.teamSize !== undefined) {
    if (assumptions.teamSize < 1 || assumptions.teamSize > 100) {
      errors.push("Team size must be between 1 and 100");
    }
  }

  // Fixed costs
  if (assumptions.fixedCosts) {
    Object.entries(assumptions.fixedCosts).forEach(([key, val]) => {
      if (val !== undefined && (typeof val !== "number" || val < 0)) {
        errors.push(`Fixed cost "${key}" must be a non-negative number`);
      }
    });
  }

  // Marketing channels
  if (assumptions.marketingChannels && Array.isArray(assumptions.marketingChannels)) {
    assumptions.marketingChannels.forEach((ch, i) => {
      if (!ch.name) errors.push(`Marketing channel ${i + 1}: name is required`);
      if (typeof ch.budget !== "number" || ch.budget < 0) {
        errors.push(`Marketing channel ${i + 1}: budget must be non-negative`);
      }
      if (typeof ch.baseCostPerLead !== "number" || ch.baseCostPerLead <= 0) {
        errors.push(`Marketing channel ${i + 1}: baseCostPerLead must be positive`);
      }
      if (typeof ch.baseConversionRate !== "number" || ch.baseConversionRate <= 0 || ch.baseConversionRate > 1) {
        errors.push(`Marketing channel ${i + 1}: baseConversionRate must be between 0 and 1`);
      }
    });
  }

  // Hiring plan
  if (assumptions.hiringPlan && Array.isArray(assumptions.hiringPlan)) {
    assumptions.hiringPlan.forEach((hire, i) => {
      if (typeof hire.month !== "number" || hire.month < 1 || hire.month > 12) {
        errors.push(`Hiring plan entry ${i + 1}: month must be between 1 and 12`);
      }
      if (!hire.role) errors.push(`Hiring plan entry ${i + 1}: role is required`);
      if (typeof hire.monthlyCost !== "number" || hire.monthlyCost < 0) {
        errors.push(`Hiring plan entry ${i + 1}: monthlyCost must be non-negative`);
      }
    });
  }

  // Milestones
  if (assumptions.milestones && Array.isArray(assumptions.milestones)) {
    assumptions.milestones.forEach((ms, i) => {
      if (!ms.name) errors.push(`Milestone ${i + 1}: name is required`);
      if (typeof ms.expectedMonth !== "number" || ms.expectedMonth < 1 || ms.expectedMonth > 12) {
        errors.push(`Milestone ${i + 1}: expectedMonth must be between 1 and 12`);
      }
      // Normalize legacy or alias impact types to match the shared Mongoose enum
      if (ms.impactType === "conversion") ms.impactType = "conversion_boost";
      else if (ms.impactType === "retention" || ms.impactType === "retention_boost") ms.impactType = "churn_reduction";
      else if (ms.impactType === "cpl") ms.impactType = "cpl_reduction";
      else if (ms.impactType === "price_increase") ms.impactType = "pricing";
    });
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Assumptions validation failed", errors);
  }
};

// ─── Extract Request Validation ──────────────────────────────────────────────

const validateExtractInput = (body) => {
  const errors = [];

  if (!body.startupName || !String(body.startupName).trim()) {
    errors.push("startupName is required");
  }

  if (!body.idea || !String(body.idea).trim()) {
    errors.push("idea is required");
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }
};

module.exports = { validateSimulationInput, validateAssumptions, validateExtractInput };