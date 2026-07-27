/**
 * Capacity Model
 *
 * Handles team capacity constraints and hiring plan logic.
 * - Each team member can serve a finite number of customers.
 * - Hiring plan adds team members at specified months, increasing costs and capacity.
 * - Growth is capped when active customers approach capacity ceiling.
 */

/**
 * Default capacity per team member by role.
 */
const CAPACITY_PER_ROLE = {
  founder: 50,
  developer: 30,
  sales: 80,
  marketing: 60,
  support: 120,
  operations: 70,
  designer: 40,
  general: 60,
};

/**
 * Calculate team size and capacity for a given month,
 * incorporating the hiring plan.
 *
 * @param {number} initialTeamSize - Starting team size
 * @param {Array} hiringPlan - Array of { month, role, monthlyCost }
 * @param {number} currentMonth - Current simulation month (1-indexed)
 * @returns {{ teamSize, totalCapacity, monthlyTeamCost, hiredThisMonth }}
 */
const calculateTeamCapacity = (initialTeamSize, hiringPlan = [], currentMonth) => {
  const baseCapacityPerPerson = CAPACITY_PER_ROLE.general;
  let teamSize = initialTeamSize;
  let totalCapacity = initialTeamSize * baseCapacityPerPerson;
  let additionalCost = 0;
  let hiredThisMonth = null;

  for (const hire of hiringPlan) {
    if (hire.month <= currentMonth) {
      teamSize += 1;
      const roleCapacity = CAPACITY_PER_ROLE[hire.role] || CAPACITY_PER_ROLE.general;
      totalCapacity += roleCapacity;
      additionalCost += hire.monthlyCost || 0;

      if (hire.month === currentMonth) {
        hiredThisMonth = hire;
      }
    }
  }

  return {
    teamSize,
    totalCapacity,
    monthlyTeamCost: additionalCost,
    hiredThisMonth,
  };
};

/**
 * Apply capacity constraints to new customer acquisition.
 * If active customers + new customers would exceed capacity,
 * cap new customers to what capacity allows.
 *
 * Uses a soft cap: growth slows as capacity is approached (80%+).
 *
 * @param {number} potentialNewCustomers - Customers marketing could acquire
 * @param {number} activeCustomers - Current active customers
 * @param {number} totalCapacity - Max customers team can serve
 * @returns {{ cappedNewCustomers, capacityUtilization, isAtCapacity }}
 */
const applyCapacityConstraints = (potentialNewCustomers, activeCustomers, totalCapacity) => {
  if (totalCapacity <= 0) {
    return {
      cappedNewCustomers: 0,
      capacityUtilization: 1,
      isAtCapacity: true,
    };
  }

  const utilization = activeCustomers / totalCapacity;

  // Soft cap: start throttling at 80% capacity
  let growthMultiplier = 1;
  if (utilization >= 1) {
    growthMultiplier = 0;
  } else if (utilization >= 0.8) {
    // Linear reduction from 1.0 to 0.0 between 80% and 100% utilization
    growthMultiplier = (1 - utilization) / 0.2;
  }

  const cappedNewCustomers = Math.max(
    0,
    Math.round(potentialNewCustomers * growthMultiplier)
  );

  const finalUtilization = totalCapacity > 0
    ? (activeCustomers + cappedNewCustomers) / totalCapacity
    : 1;

  return {
    cappedNewCustomers,
    capacityUtilization: Math.round(finalUtilization * 100) / 100,
    isAtCapacity: utilization >= 0.95,
  };
};

/**
 * Calculate total monthly salary costs from base salaries plus hiring plan.
 *
 * @param {number} baseMonthlySalaries - Starting monthly salary bill
 * @param {Array} hiringPlan - Hiring plan array
 * @param {number} currentMonth - Current month (1-indexed)
 * @returns {number} Total monthly salary cost
 */
const calculateSalaryCosts = (baseMonthlySalaries, hiringPlan = [], currentMonth) => {
  let total = baseMonthlySalaries;

  for (const hire of hiringPlan) {
    if (hire.month <= currentMonth) {
      total += hire.monthlyCost || 0;
    }
  }

  return total;
};

/**
 * Calculate portion of headcount salary cost attributable to sales/marketing roles.
 *
 * @param {Array} hiringPlan - Hiring plan array
 * @param {number} currentMonth - Current month (1-indexed)
 * @returns {number} Sales and marketing headcount cost
 */
const calculateSalesHeadcountCost = (hiringPlan = [], currentMonth) => {
  let salesTotal = 0;
  for (const hire of hiringPlan) {
    if (hire.month <= currentMonth) {
      const role = (hire.role || "").toLowerCase();
      if (role.includes("sales") || role.includes("marketing") || role.includes("growth") || role.includes("business dev") || role.includes("sdr") || role.includes("ae")) {
        salesTotal += hire.monthlyCost || 0;
      }
    }
  }
  return salesTotal;
};

module.exports = {
  CAPACITY_PER_ROLE,
  calculateTeamCapacity,
  applyCapacityConstraints,
  calculateSalaryCosts,
  calculateSalesHeadcountCost,
};
