import React, { useState } from "react";
import AssumptionField from "./AssumptionField";
import { Plus, Trash2 } from "lucide-react";
import { MILESTONE_IMPACT_TYPES } from "../../../../shared/milestoneImpactTypes.js";

const AssumptionsPanel = ({ assumptions, onChange, disabled = false }) => {
  const [activeTab, setActiveTab] = useState("core");

  if (!assumptions) return null;

  const sources = assumptions.sources || {};

  const handleFieldChange = (name, value, source = "user") => {
    const keys = name.split(".");
    if (keys.length === 1) {
      onChange({
        ...assumptions,
        [name]: value,
        sources: { ...sources, [name]: source },
      });
    } else if (keys.length === 2 && keys[0] === "fixedCosts") {
      onChange({
        ...assumptions,
        fixedCosts: {
          ...(assumptions.fixedCosts || {}),
          [keys[1]]: value,
        },
        sources: { ...sources, [name]: source },
      });
    }
  };

  // Marketing Channel helpers
  const handleChannelChange = (index, field, value) => {
    const updatedChannels = [...(assumptions.marketingChannels || [])];
    updatedChannels[index] = { ...updatedChannels[index], [field]: value };
    onChange({ ...assumptions, marketingChannels: updatedChannels });
  };

  const addChannel = () => {
    const updatedChannels = [
      ...(assumptions.marketingChannels || []),
      {
        name: "New Channel",
        budget: 1000,
        baseCostPerLead: 10,
        baseConversionRate: 0.05,
        rampUpMonths: 2,
      },
    ];
    onChange({ ...assumptions, marketingChannels: updatedChannels });
  };

  const removeChannel = (index) => {
    const updatedChannels = [...(assumptions.marketingChannels || [])];
    updatedChannels.splice(index, 1);
    onChange({ ...assumptions, marketingChannels: updatedChannels });
  };

  // Hiring Plan helpers
  const handleHireChange = (index, field, value) => {
    const updatedHiring = [...(assumptions.hiringPlan || [])];
    updatedHiring[index] = { ...updatedHiring[index], [field]: value };
    onChange({ ...assumptions, hiringPlan: updatedHiring });
  };

  const addHire = () => {
    const updatedHiring = [
      ...(assumptions.hiringPlan || []),
      { month: 6, role: "developer", monthlyCost: 4000 },
    ];
    onChange({ ...assumptions, hiringPlan: updatedHiring });
  };

  const removeHire = (index) => {
    const updatedHiring = [...(assumptions.hiringPlan || [])];
    updatedHiring.splice(index, 1);
    onChange({ ...assumptions, hiringPlan: updatedHiring });
  };

  // Milestone helpers
  const getNormalizedImpactType = (val) => {
    if (val === "conversion") return "conversion_boost";
    if (val === "retention" || val === "retention_boost") return "churn_reduction";
    if (val === "cpl") return "cpl_reduction";
    if (val === "price_increase") return "pricing";
    if (!val) return "conversion_boost";
    return val;
  };

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...(assumptions.milestones || [])];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    onChange({ ...assumptions, milestones: updatedMilestones });
  };

  const addMilestone = () => {
    const updatedMilestones = [
      ...(assumptions.milestones || []),
      { name: "New Feature", expectedMonth: 6, impactType: "conversion_boost", value: 0.2, completed: false },
    ];
    onChange({ ...assumptions, milestones: updatedMilestones });
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...(assumptions.milestones || [])];
    updatedMilestones.splice(index, 1);
    onChange({ ...assumptions, milestones: updatedMilestones });
  };

  const tabs = [
    { id: "core", label: "Core Business" },
    { id: "growth", label: "Growth & Churn" },
    { id: "marketing", label: `Marketing (${assumptions.marketingChannels?.length || 0})` },
    { id: "team", label: `Team & Costs (${assumptions.hiringPlan?.length || 0} hires)` },
    { id: "milestones", label: `Milestones (${assumptions.milestones?.length || 0})` },
  ];

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 shadow-soft">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-outline-variant mb-6 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-brass-500 text-ink-900 font-bold bg-surface-container-lowest rounded-t"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Core Business Tab */}
      {activeTab === "core" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AssumptionField
            label="Industry"
            name="industry"
            type="text"
            value={assumptions.industry}
            source={sources.industry}
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Business Model"
            name="businessModel"
            type="select"
            value={assumptions.businessModel}
            source={sources.businessModel}
            options={[
              { label: "Subscription (SaaS)", value: "Subscription" },
              { label: "Freemium", value: "Freemium" },
              { label: "Marketplace", value: "Marketplace" },
              { label: "One-Time Purchase", value: "One-Time Purchase" },
              { label: "E-Commerce", value: "E-Commerce" },
            ]}
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Target Customer"
            name="targetCustomer"
            type="text"
            value={assumptions.targetCustomer}
            source={sources.targetCustomer}
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Price per Unit / Month"
            name="price"
            type="number"
            value={assumptions.price}
            source={sources.price}
            prefix="$"
            min={0.01}
            step="any"
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Starting Capital"
            name="startingCapital"
            type="number"
            value={assumptions.startingCapital}
            source={sources.startingCapital}
            prefix="$"
            min={100}
            step="1000"
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Initial Active Customers"
            name="initialCustomers"
            type="number"
            value={assumptions.initialCustomers}
            source={sources.initialCustomers}
            min={0}
            step="1"
            onChange={handleFieldChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Growth & Churn Tab */}
      {activeTab === "growth" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AssumptionField
            label="Base Conversion Rate"
            name="conversionRate"
            type="number"
            value={assumptions.conversionRate}
            source={sources.conversionRate}
            min={0.001}
            max={0.5}
            step="0.005"
            helperText="Fraction of leads converting to customers (e.g., 0.03 = 3%)"
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Monthly Churn Rate"
            name="monthlyChurn"
            type="number"
            value={assumptions.monthlyChurn}
            source={sources.monthlyChurn}
            min={0}
            max={0.5}
            step="0.005"
            helperText="Fraction of existing customers canceling per month (e.g., 0.05 = 5%)"
            onChange={handleFieldChange}
            disabled={disabled}
          />
          <AssumptionField
            label="Competition Pressure"
            name="competitionPressure"
            type="number"
            value={assumptions.competitionPressure}
            source={sources.competitionPressure}
            min={0}
            max={1}
            step="0.05"
            helperText="0 = Blue ocean (no competition), 1 = Cutthroat market"
            onChange={handleFieldChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === "marketing" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-ink-500">
              Each channel generates leads based on logarithmic diminishing returns.
            </p>
            <button
              type="button"
              onClick={addChannel}
              disabled={disabled}
              className="flex items-center gap-1 bg-ink-800 text-surface text-xs font-semibold px-3 py-1.5 rounded hover:bg-ink-700 transition"
            >
              <Plus size={14} /> Add Channel
            </button>
          </div>

          <div className="space-y-4">
            {(assumptions.marketingChannels || []).map((ch, index) => (
              <div
                key={index}
                className="bg-surface-container-lowest p-4 rounded border border-outline-variant flex flex-col md:flex-row gap-4 items-center justify-between"
              >
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1 w-full">
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block mb-1">
                      Channel Name
                    </label>
                    <input
                      type="text"
                      value={ch.name}
                      onChange={(e) => handleChannelChange(index, "name", e.target.value)}
                      disabled={disabled}
                      className="w-full text-sm font-medium border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block mb-1">
                      Monthly Budget ($)
                    </label>
                    <input
                      type="number"
                      value={ch.budget}
                      min={0}
                      onChange={(e) => handleChannelChange(index, "budget", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block mb-1">
                      Base Cost/Lead ($)
                    </label>
                    <input
                      type="number"
                      value={ch.baseCostPerLead}
                      min={0.1}
                      step="0.5"
                      onChange={(e) => handleChannelChange(index, "baseCostPerLead", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block mb-1">
                      Conv. Rate (0-1)
                    </label>
                    <input
                      type="number"
                      value={ch.baseConversionRate}
                      min={0.001}
                      max={1}
                      step="0.005"
                      onChange={(e) => handleChannelChange(index, "baseConversionRate", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block mb-1">
                      Ramp Up (Mos)
                    </label>
                    <input
                      type="number"
                      value={ch.rampUpMonths}
                      min={1}
                      max={12}
                      onChange={(e) => handleChannelChange(index, "rampUpMonths", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeChannel(index)}
                  disabled={disabled || assumptions.marketingChannels.length <= 1}
                  className="text-burgundy-600 hover:text-burgundy-800 p-2 disabled:opacity-30"
                  title="Remove channel"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team & Costs Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AssumptionField
              label="Initial Team Size"
              name="teamSize"
              type="number"
              value={assumptions.teamSize}
              source={sources.teamSize}
              min={1}
              step="1"
              helperText="Number of founders / early team members starting in Month 1"
              onChange={handleFieldChange}
              disabled={disabled}
            />
            <AssumptionField
              label="Variable Cost / Customer ($/mo)"
              name="variableCostPerCustomer"
              type="number"
              value={assumptions.variableCostPerCustomer}
              source={sources.variableCostPerCustomer}
              prefix="$"
              min={0}
              step="0.1"
              helperText="Server hosting, AI tokens, support cost per user"
              onChange={handleFieldChange}
              disabled={disabled}
            />
          </div>

          <div className="border-t border-outline-variant pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-900 mb-3">
              Fixed Monthly Costs ($)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AssumptionField
                label="Base Salaries"
                name="fixedCosts.salaries"
                type="number"
                value={assumptions.fixedCosts?.salaries || 0}
                prefix="$"
                min={0}
                onChange={handleFieldChange}
                disabled={disabled}
              />
              <AssumptionField
                label="Software Tools"
                name="fixedCosts.softwareTools"
                type="number"
                value={assumptions.fixedCosts?.softwareTools || 0}
                prefix="$"
                min={0}
                onChange={handleFieldChange}
                disabled={disabled}
              />
              <AssumptionField
                label="Office / Rent"
                name="fixedCosts.office"
                type="number"
                value={assumptions.fixedCosts?.office || 0}
                prefix="$"
                min={0}
                onChange={handleFieldChange}
                disabled={disabled}
              />
              <AssumptionField
                label="Admin / Legal"
                name="fixedCosts.admin"
                type="number"
                value={assumptions.fixedCosts?.admin || 0}
                prefix="$"
                min={0}
                onChange={handleFieldChange}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="border-t border-outline-variant pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
                Hiring Plan
              </h4>
              <button
                type="button"
                onClick={addHire}
                disabled={disabled}
                className="flex items-center gap-1 bg-ink-800 text-surface text-xs font-semibold px-3 py-1.5 rounded hover:bg-ink-700 transition"
              >
                <Plus size={14} /> Add Hire
              </button>
            </div>

            {(!assumptions.hiringPlan || assumptions.hiringPlan.length === 0) ? (
              <p className="text-xs text-ink-500 italic py-2">No planned hires in the first 12 months.</p>
            ) : (
              <div className="space-y-2">
                {assumptions.hiringPlan.map((hire, index) => (
                  <div
                    key={index}
                    className="bg-surface-container-lowest p-3 rounded border border-outline-variant flex gap-3 items-center justify-between"
                  >
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div>
                        <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                          Month to Hire (1-12)
                        </label>
                        <input
                          type="number"
                          value={hire.month}
                          min={1}
                          max={12}
                          onChange={(e) => handleHireChange(index, "month", Number(e.target.value))}
                          disabled={disabled}
                          className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                          Role
                        </label>
                        <select
                          value={hire.role}
                          onChange={(e) => handleHireChange(index, "role", e.target.value)}
                          disabled={disabled}
                          className="w-full text-sm font-medium border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                        >
                          <option value="developer">Developer (+30 cap)</option>
                          <option value="sales">Sales (+80 cap)</option>
                          <option value="marketing">Marketing (+60 cap)</option>
                          <option value="support">Support (+120 cap)</option>
                          <option value="designer">Designer (+40 cap)</option>
                          <option value="general">General (+60 cap)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                          Monthly Salary ($)
                        </label>
                        <input
                          type="number"
                          value={hire.monthlyCost}
                          min={0}
                          step="500"
                          onChange={(e) => handleHireChange(index, "monthlyCost", Number(e.target.value))}
                          disabled={disabled}
                          className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHire(index)}
                      disabled={disabled}
                      className="text-burgundy-600 hover:text-burgundy-800 p-2"
                      title="Remove hire"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === "milestones" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-ink-500">
              Product milestones affect channel effectiveness and feature readiness.
            </p>
            <button
              type="button"
              onClick={addMilestone}
              disabled={disabled}
              className="flex items-center gap-1 bg-ink-800 text-surface text-xs font-semibold px-3 py-1.5 rounded hover:bg-ink-700 transition"
            >
              <Plus size={14} /> Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {(assumptions.milestones || []).map((ms, index) => (
              <div
                key={index}
                className="bg-surface-container-lowest p-3 rounded border border-outline-variant flex gap-3 items-center justify-between"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div className="sm:col-span-1">
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                      Milestone Name
                    </label>
                    <input
                      type="text"
                      value={ms.name}
                      onChange={(e) => handleMilestoneChange(index, "name", e.target.value)}
                      disabled={disabled}
                      className="w-full text-sm font-medium border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                      Expected Month (1-12)
                    </label>
                    <input
                      type="number"
                      value={ms.expectedMonth}
                      min={1}
                      max={12}
                      onChange={(e) => handleMilestoneChange(index, "expectedMonth", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                      Impact Type
                    </label>
                    <select
                      value={getNormalizedImpactType(ms.impactType)}
                      onChange={(e) => handleMilestoneChange(index, "impactType", e.target.value)}
                      disabled={disabled}
                      className="w-full text-sm border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    >
                      {MILESTONE_IMPACT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase font-semibold text-ink-500 block">
                      Value (+/- %)
                    </label>
                    <input
                      type="number"
                      value={ms.value !== undefined ? ms.value : 0.2}
                      step="0.05"
                      onChange={(e) => handleMilestoneChange(index, "value", Number(e.target.value))}
                      disabled={disabled}
                      className="w-full text-sm font-data border border-outline-variant rounded px-2 py-1 bg-surface-container-low"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  disabled={disabled}
                  className="text-burgundy-600 hover:text-burgundy-800 p-2"
                  title="Remove milestone"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssumptionsPanel;
