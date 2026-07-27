import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, PieChart, Activity, Target } from "lucide-react";

const SimulationCharts = ({ monthlyData = [] }) => {
  const [activeChart, setActiveChart] = useState("revenue");

  if (!monthlyData || monthlyData.length === 0) return null;

  // Transform data for charts
  const chartData = monthlyData.map((m) => ({
    month: `M${m.month}`,
    rawMonth: m.month,
    stage: m.stage,
    revenue: m.revenue || 0,
    expenses: m.totalExpenses || 0,
    netProfit: (m.revenue || 0) - (m.totalExpenses || 0),
    endingCash: m.endingCash || 0,
    burn: m.burn || 0,
    activeCustomers: m.activeCustomers || 0,
    newCustomers: m.newCustomers || 0,
    churnedCustomers: m.churnedCustomers || 0,
    cac: m.cac || 0,
    ltv: m.ltv || 0,
    ltvCacRatio: m.ltvCacRatio || 0,
    leads: m.leads || 0,
    marketingCosts: m.marketingCosts || 0,
    // Cost breakdown
    salaries: m.costBreakdown?.salaries || 0,
    marketing: m.costBreakdown?.marketing || 0,
    infrastructure: m.costBreakdown?.infrastructure || 0,
    office: m.costBreakdown?.office || 0,
    other: (m.costBreakdown?.softwareTools || 0) + (m.costBreakdown?.admin || 0) + (m.costBreakdown?.paymentProcessing || 0),
  }));

  const formatCurrency = (val) => `$${val?.toLocaleString() || 0}`;

  const tabs = [
    { id: "revenue", label: "Revenue vs Expenses", icon: DollarSign },
    { id: "cash", label: "Cash Balance & Burn", icon: Activity },
    { id: "customers", label: "Customer Growth & Churn", icon: Users },
    { id: "unit", label: "CAC vs LTV", icon: Target },
    { id: "costs", label: "Cost Breakdown", icon: PieChart },
    { id: "marketing", label: "Marketing Efficiency", icon: TrendingUp },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-soft">
      {/* Chart Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant mb-6 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChart === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? "bg-ink-900 text-surface shadow-card scale-[1.02]"
                  : "bg-surface-container-low text-ink-600 hover:text-ink-900 hover:bg-surface-container-high"
              }`}
            >
              <Icon size={14} className={isActive ? "text-brass-300" : "text-brass-600"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Render Area */}
      <div className="h-[360px] w-full pt-2">
        {activeChart === "revenue" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#526259" }} />
              <Tooltip formatter={(val) => [formatCurrency(val), ""]} contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="revenue" name="Monthly Revenue ($)" fill="#3a6a4e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Total Expenses ($)" fill="#ba1a1a" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line type="monotone" dataKey="netProfit" name="Net Profit / Loss ($)" stroke="#b08d4a" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChart === "cash" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#526259" }} />
              <Tooltip formatter={(val) => [formatCurrency(val), ""]} contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Area type="monotone" dataKey="endingCash" name="Ending Cash Balance ($)" stroke="#14231c" fill="#b9cbc0" strokeWidth={2} />
              <Line type="monotone" dataKey="burn" name="Monthly Burn Rate ($)" stroke="#ba1a1a" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "customers" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis tick={{ fontSize: 12, fill: "#526259" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="newCustomers" name="New Customers Acquired" fill="#3a6a4e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churnedCustomers" name="Churned Customers" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="activeCustomers" name="Total Active Customers" stroke="#b08d4a" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChart === "unit" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#526259" }} />
              <Tooltip formatter={(val) => [formatCurrency(val), ""]} contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="ltv" name="Customer Lifetime Value (LTV $)" stroke="#3a6a4e" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="cac" name="Customer Acquisition Cost (CAC $)" stroke="#ba1a1a" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === "costs" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#526259" }} />
              <Tooltip formatter={(val) => [formatCurrency(val), ""]} contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="salaries" name="Salaries ($)" stackId="a" fill="#14231c" />
              <Bar dataKey="marketing" name="Marketing ($)" stackId="a" fill="#b08d4a" />
              <Bar dataKey="infrastructure" name="Infrastructure & Hosting ($)" stackId="a" fill="#3a6a4e" />
              <Bar dataKey="office" name="Office / Rent ($)" stackId="a" fill="#526259" />
              <Bar dataKey="other" name="Other (Software/Admin/Fees) ($)" stackId="a" fill="#7b8b82" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "marketing" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis yAxisId="left" tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#526259" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#b08d4a" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0a1610", color: "#fdf9f2", borderRadius: "8px" }} />
              <Legend />
              <Bar yAxisId="left" dataKey="marketingCosts" name="Marketing Spend ($)" fill="#14231c" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="leads" name="Total Leads Generated" stroke="#b08d4a" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="newCustomers" name="New Customers Acquired" stroke="#3a6a4e" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SimulationCharts;
