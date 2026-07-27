import React from "react";
import { Users, DollarSign, TrendingUp, AlertTriangle, Lightbulb, Flag, ShieldAlert, Activity, PieChart } from "lucide-react";

const MonthSnapshot = ({ monthData }) => {
  if (!monthData) return null;

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercent = (val) => {
    if (val === undefined || val === null) return "0%";
    return `${Math.round(val * 100)}%`;
  };

  const isExhausted = monthData.endingCash <= 0;
  const isPositive = monthData.isCashFlowPositive;

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      {isExhausted ? (
        <div className="bg-burgundy-50 border-l-4 border-burgundy-600 p-4 rounded-r-lg shadow-card flex items-start gap-3">
          <AlertTriangle className="text-burgundy-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-burgundy-900 text-sm">Cash Exhausted in Month {monthData.month}</h4>
            <p className="text-xs text-burgundy-800 mt-0.5">
              The company has run out of operating capital (Cash balance: {formatCurrency(monthData.endingCash)}). Marketing and operations are severely constrained.
            </p>
          </div>
        </div>
      ) : isPositive ? (
        <div className="bg-ink-50 border-l-4 border-ink-600 p-4 rounded-r-lg shadow-card flex items-start gap-3">
          <TrendingUp className="text-ink-700 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-ink-900 text-sm">Cash Flow Positive (+{formatCurrency(monthData.revenue - monthData.totalExpenses)})</h4>
            <p className="text-xs text-ink-700 mt-0.5">
              Revenue exceeds monthly operating expenses. The startup is self-sustaining without additional capital injection.
            </p>
          </div>
        </div>
      ) : null}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider">Active Customers</span>
            <Users size={16} className="text-brass-600" />
          </div>
          <div className="font-data text-2xl font-bold text-ink-900">
            {monthData.activeCustomers?.toLocaleString() || 0}
          </div>
          <div className="text-[0.7rem] text-ink-500 mt-1 flex justify-between font-data">
            <span className="text-ink-700">+{monthData.newCustomers} new</span>
            <span className="text-burgundy-600">-{monthData.churnedCustomers} churn</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider">Monthly Revenue</span>
            <DollarSign size={16} className="text-ink-600" />
          </div>
          <div className="font-data text-2xl font-bold text-ink-900">
            {formatCurrency(monthData.revenue)}
          </div>
          <div className="text-[0.7rem] text-ink-500 mt-1">
            <span>Expenses: {formatCurrency(monthData.totalExpenses)}</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider">Ending Cash</span>
            <Activity size={16} className={isExhausted ? "text-burgundy-600" : "text-brass-600"} />
          </div>
          <div className={`font-data text-2xl font-bold ${isExhausted ? "text-burgundy-600" : "text-ink-900"}`}>
            {formatCurrency(monthData.endingCash)}
          </div>
          <div className="text-[0.7rem] text-ink-500 mt-1 font-data">
            {monthData.runway ? `Runway: ${monthData.runway} mos` : isPositive ? "Runway: Infinite" : "Runway: 0 mos"}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider">LTV / CAC Ratio</span>
            <PieChart size={16} className={monthData.ltvCacRatio < 1 ? "text-burgundy-600" : "text-ink-600"} />
          </div>
          <div className={`font-data text-2xl font-bold ${monthData.ltvCacRatio < 1 && monthData.cac > 0 ? "text-burgundy-600" : "text-ink-900"}`}>
            {monthData.ltvCacRatio ? `${monthData.ltvCacRatio.toFixed(1)}x` : "N/A"}
          </div>
          <div className="text-[0.7rem] text-ink-500 mt-1 flex justify-between font-data">
            <span>CAC: ${monthData.cac}</span>
            <span>LTV: ${monthData.ltv}</span>
          </div>
        </div>
      </div>

      {/* AI Qualitative Overlay & Story of the Month */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-3">
          <span className="w-2 h-2 rounded-full bg-brass-500"></span>
          <h3 className="font-headline text-lg font-bold text-ink-900">
            Month {monthData.month} Story & Qualitative Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-3.5 rounded border border-outline-variant">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
              <Activity size={14} className="text-brass-600" />
              <span>Key Business Event</span>
            </div>
            <p className="text-sm text-ink-900 leading-relaxed">
              {monthData.event || `During the ${monthData.stage} stage, the team acquired ${monthData.newCustomers} new customers and maintained ${monthData.activeCustomers} active users.`}
            </p>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded border border-outline-variant">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy-700 mb-1.5">
              <ShieldAlert size={14} className="text-burgundy-600" />
              <span>Primary Risk This Month</span>
            </div>
            <p className="text-sm text-ink-900 leading-relaxed">
              {monthData.risk || (monthData.ltvCacRatio < 1 && monthData.cac > 0
                ? "Customer acquisition economics are currently upside down (CAC exceeds LTV)."
                : "Monitoring churn and channel ramp-up to ensure steady cohort expansion.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-surface-container-low p-3.5 rounded border border-outline-variant">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brass-800 mb-1.5">
              <Lightbulb size={14} className="text-brass-600" />
              <span>Strategic Insight</span>
            </div>
            <p className="text-sm text-ink-900 leading-relaxed italic">
              {monthData.insight || "Focus on optimizing lead conversion and retaining early adopters to strengthen unit economics."}
            </p>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
              <Flag size={14} className="text-ink-600" />
              <span>Product Milestone Status</span>
            </div>
            <div>
              {monthData.milestone ? (
                <div className="flex items-center gap-2">
                  <span className="badge-extracted">Milestone Target</span>
                  <span className="text-sm font-bold text-ink-900">{monthData.milestone}</span>
                </div>
              ) : (
                <p className="text-sm text-ink-500 italic">No milestone scheduled for this month.</p>
              )}
            </div>
            {monthData.isDelayed && (
              <p className="text-[0.75rem] text-burgundy-600 font-semibold mt-1">
                ⚠️ Overdue milestones are temporarily dampening marketing conversion rates.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Operations & Costs Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Breakdown */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-soft">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-3 pb-2 border-b border-outline-variant">
            Expense Breakdown ({formatCurrency(monthData.totalExpenses)})
          </h4>
          <div className="space-y-2 text-sm font-data">
            {monthData.costBreakdown && Object.entries(monthData.costBreakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b border-outline-variant/40 last:border-0">
                <span className="capitalize text-ink-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold text-ink-900">{formatCurrency(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Channels Performance */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-soft">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-3 pb-2 border-b border-outline-variant">
            Channel Acquisition ({monthData.newCustomers} new customers)
          </h4>
          {(!monthData.channelBreakdown || monthData.channelBreakdown.length === 0) ? (
            <p className="text-xs text-ink-500 italic">No marketing channel activity.</p>
          ) : (
            <div className="space-y-2.5">
              {monthData.channelBreakdown.map((ch, i) => (
                <div key={i} className="bg-surface-container-low p-2.5 rounded border border-outline-variant/60 text-xs font-data flex justify-between items-center">
                  <div>
                    <span className="font-bold text-ink-900 block">{ch.channelName}</span>
                    <span className="text-ink-500">{ch.leads} leads → {ch.customers} customers</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-ink-900 block">{formatCurrency(ch.cost)}</span>
                    <span className="text-ink-500">CPL: ${ch.effectiveCPL}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthSnapshot;
