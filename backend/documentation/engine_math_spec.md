# Canonical Engine Math & Scenario Modifiers Specification

**Version:** 2.1.0  
**Source of Truth:** `backend/src/engine/marketingChannels.js`, `backend/src/engine/simulationEngine.js`, `backend/src/config/scenarioModifiers.config.js`

This document defines the canonical mathematical formulas and parameters used in the AI Startup Simulator backend. Any changes to simulation mathematics must be reflected here and verified via automated test suites.

---

## 1. Marketing Lead Generation & Diminishing Returns

Each marketing channel generates leads based on logarithmic diminishing returns and a time-delayed ramp-up curve:

```
baseSpend = baseCostPerLead * saturationSpendMultiplier
rawLeads = ((baseSpend / baseCostPerLead) * ln(1 + budget / baseSpend) / ln(2)) * scalingCoefficient
rampFactor = min(1.0, month / max(1, rampUpMonths))
leads = max(0, round(rawLeads * rampFactor * referralBonus))
```

### Channel Template Configurations
| Channel | baseCostPerLead | baseConversionRate | rampUpMonths | saturationSpendMultiplier | scalingCoefficient |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Paid Ads** | $8 | 0.04 (4%) | 1 | 200 | 1.0 |
| **Organic Search** | $3 | 0.06 (6%) | 4 | 50 | 0.8 |
| **Social Media** | $5 | 0.03 (3%) | 2 | 100 | 0.9 |
| **Referral** | $2 | 0.08 (8%) | 3 | 50 | 1.2 |
| **Partnerships** | $6 | 0.05 (5%) | 3 | 80 | 0.85 |
| **Direct Sales** | $15 | 0.12 (12%) | 2 | 150 | 1.1 |

---

## 2. Unit Economics (LTV & CAC)

### Margin-Adjusted Lifetime Value (LTV)
LTV accounts for variable hosting/infrastructure costs and payment processing fees (e.g. Stripe 2.9% + $0.30):

```
grossMarginPct = max(0.05, 1 - ((variableCostPerUser + paymentProcessingFeePerUser) / price))
LTV = round((price * grossMarginPct) / max(0.01, monthlyChurn) * 100) / 100
```

### Fully-Loaded vs. Marketing-Only CAC
To prevent sales-led startups from hiding acquisition headcount overhead, CAC is calculated in two ways:

```
salesHeadcountCost = sum(salary for hire in hiringPlan where role in ['Sales', 'Marketing', 'sales', 'marketing'] and hire.month <= currentMonth)
cac_marketingOnly = newCustomers > 0 ? (marketingSpend / newCustomers) : 0
cac_fullyLoaded = newCustomers > 0 ? ((marketingSpend + salesHeadcountCost) / newCustomers) : 0
```
*Note: `cac_fullyLoaded` is used for all LTV:CAC scoring and VC benchmark evaluations.*

---

## 3. Scenario Adjustments (`scenarioModifiers.config.js`)

| Parameter | Realistic | Pessimistic | Optimistic |
| :--- | :--- | :--- | :--- |
| **Conversion Rate Multiplier** | 1.0x | 0.6x (-40%) | 1.4x (+40%) |
| **Monthly Churn Multiplier** | 1.0x | 1.5x (+50%) | 0.6x (-40%) |
| **Marketing Yield Multiplier** | 1.0x | 0.7x (-30%) | 1.3x (+30%) |
| **Cost Inflation Multiplier** | 1.0x | 1.15x (+15%) | 0.95x (-5%) |
| **Price Multiplier** | 1.0x | 0.9x (-10%) | 1.0x (0%) |
| **Milestone Execution Delay** | 0 mos | +1 mo | 0 mos |
