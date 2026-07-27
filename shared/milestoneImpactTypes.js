export const MILESTONE_IMPACT_TYPES = [
  { value: "conversion_boost", label: "Conversion Boost" },
  { value: "churn_reduction", label: "Retention / Churn Reduction" },
  { value: "cpl_reduction", label: "CPL Reduction" },
  { value: "pricing", label: "Pricing / ARPU Increase" },
  { value: "none", label: "No Numerical Impact" },
];

export const MILESTONE_IMPACT_ENUM = [
  "conversion_boost",
  "churn_reduction",
  "cpl_reduction",
  "pricing",
  "none",
  null,
  "",
];

export default {
  MILESTONE_IMPACT_TYPES,
  MILESTONE_IMPACT_ENUM,
};
