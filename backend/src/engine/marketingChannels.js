/**
 * Marketing Channel Model
 *
 * Each channel has a distinct cost structure, conversion rate, and ramp-up profile.
 * Lead generation uses logarithmic diminishing returns:
 *   leads = baseLeads × ln(1 + spend/baseSpend) / ln(2)
 *
 * This means doubling spend does NOT double leads — it adds one "base unit" of leads.
 */

const CHANNEL_TEMPLATES = {
  paidAds: {
    name: "Paid Ads",
    baseCostPerLead: 8,
    baseConversionRate: 0.04,
    rampUpMonths: 1,
    saturationSpendMultiplier: 200, // Can scale ad spend higher before saturation
    scalingCoefficient: 1.0,
    description: "Fast results, higher CAC. Google/Meta ads.",
  },
  organicSearch: {
    name: "Organic Search",
    baseCostPerLead: 3,
    baseConversionRate: 0.06,
    rampUpMonths: 4,
    saturationSpendMultiplier: 50,  // Saturates faster as SEO has volume limits
    scalingCoefficient: 0.8,
    description: "Slow initial results, lower long-term CAC. SEO & content.",
  },
  socialMedia: {
    name: "Social Media",
    baseCostPerLead: 5,
    baseConversionRate: 0.03,
    rampUpMonths: 2,
    saturationSpendMultiplier: 100,
    scalingCoefficient: 0.9,
    description: "Brand awareness and engagement. Variable conversion.",
  },
  referral: {
    name: "Referral",
    baseCostPerLead: 2,
    baseConversionRate: 0.08,
    rampUpMonths: 3,
    saturationSpendMultiplier: 50,
    scalingCoefficient: 1.2,
    description: "Lower cost, depends on customer satisfaction and base.",
  },
  partnerships: {
    name: "Partnerships",
    baseCostPerLead: 6,
    baseConversionRate: 0.05,
    rampUpMonths: 3,
    saturationSpendMultiplier: 80,
    scalingCoefficient: 0.85,
    description: "B2B partnerships and co-marketing. Medium ramp-up.",
  },
  directSales: {
    name: "Direct Sales",
    baseCostPerLead: 15,
    baseConversionRate: 0.12,
    rampUpMonths: 2,
    saturationSpendMultiplier: 150,
    scalingCoefficient: 1.1,
    description: "Expensive but high conversion. Requires sales team.",
  },
};

/**
 * Calculate leads from a single marketing channel for a given month.
 *
 * Uses diminishing returns: leads = baseLeads × ln(1 + spend/baseSpend) / ln(2) × scalingCoefficient
 * With ramp-up: channels don't reach full effectiveness until after rampUpMonths.
 *
 * @param {object} channel - Channel config { name, budget, baseCostPerLead, baseConversionRate, rampUpMonths, saturationSpendMultiplier, scalingCoefficient }
 * @param {number} month - Current month (1-indexed)
 * @param {number} activeCustomers - Current active customers (for referral scaling)
 * @returns {{ leads: number, customers: number, cost: number, effectiveCPL: number }}
 */
const calculateChannelLeads = (channel, month, activeCustomers = 0) => {
  const {
    budget = 0,
    baseCostPerLead,
    baseConversionRate,
    rampUpMonths = 1,
    saturationSpendMultiplier = 100,
    scalingCoefficient = 1.0,
  } = channel;

  if (budget <= 0 || baseCostPerLead <= 0) {
    return { leads: 0, customers: 0, cost: 0, effectiveCPL: 0 };
  }

  // Base spend unit — the spend level that produces leads linearly before diminishing returns
  const baseSpend = baseCostPerLead * saturationSpendMultiplier;

  // Diminishing returns: logarithmic scaling with channel-specific scaling coefficient
  const rawLeads = ((baseSpend / baseCostPerLead) * Math.log(1 + budget / baseSpend) / Math.log(2)) * scalingCoefficient;

  // Ramp-up factor: channel effectiveness increases over its ramp-up period
  const rampFactor = Math.min(1, month / Math.max(1, rampUpMonths));

  // Referral channel special case: scales with existing customer base
  let referralBonus = 1;
  if (channel.name === "Referral" && activeCustomers > 0) {
    referralBonus = Math.min(3, 1 + Math.log(1 + activeCustomers / 50) / Math.log(5));
  }

  const leads = Math.max(0, Math.round(rawLeads * rampFactor * referralBonus));
  const customers = Math.max(0, Math.round(leads * baseConversionRate));
  const effectiveCPL = leads > 0 ? budget / leads : 0;

  return {
    leads,
    customers,
    cost: budget,
    effectiveCPL: Math.round(effectiveCPL * 100) / 100,
  };
};

/**
 * Calculate total leads and customers across all marketing channels.
 *
 * @param {Array} channels - Array of channel configs
 * @param {number} month - Current month (1-indexed)
 * @param {number} activeCustomers - Current active customer count
 * @returns {{ totalLeads, totalNewCustomers, totalMarketingCost, channelBreakdown, blendedCPL }}
 */
const calculateAllChannels = (channels, month, activeCustomers = 0) => {
  const breakdown = channels.map((ch) => {
    const result = calculateChannelLeads(ch, month, activeCustomers);
    return { ...result, channelName: ch.name };
  });

  const totalLeads = breakdown.reduce((sum, ch) => sum + ch.leads, 0);
  const totalNewCustomers = breakdown.reduce((sum, ch) => sum + ch.customers, 0);
  const totalMarketingCost = breakdown.reduce((sum, ch) => sum + ch.cost, 0);
  const blendedCPL = totalLeads > 0
    ? Math.round((totalMarketingCost / totalLeads) * 100) / 100
    : 0;

  return {
    totalLeads,
    totalNewCustomers,
    totalMarketingCost,
    channelBreakdown: breakdown,
    blendedCPL,
  };
};

/**
 * Build default marketing channels from a total budget.
 * Distributes budget across Paid Ads (40%), Social Media (25%), Organic (20%), Referral (15%).
 */
const buildDefaultChannels = (totalBudget) => {
  return [
    {
      ...CHANNEL_TEMPLATES.paidAds,
      budget: Math.round(totalBudget * 0.4),
    },
    {
      ...CHANNEL_TEMPLATES.socialMedia,
      budget: Math.round(totalBudget * 0.25),
    },
    {
      ...CHANNEL_TEMPLATES.organicSearch,
      budget: Math.round(totalBudget * 0.2),
    },
    {
      ...CHANNEL_TEMPLATES.referral,
      budget: Math.round(totalBudget * 0.15),
    },
  ];
};

module.exports = {
  CHANNEL_TEMPLATES,
  calculateChannelLeads,
  calculateAllChannels,
  buildDefaultChannels,
};
