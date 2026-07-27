import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Target,
  TrendingUp,
  Wallet,
  ShieldAlert,
  Lightbulb,
  Gauge,
  CheckCircle2,
  XCircle,
  Landmark,
  BarChart,
  PieChart
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import Badge from "../ui/Badge.jsx";
import SectionCard from "../ui/SectionCard.jsx";

const scoreTone = (score) =>
  score >= 75 ? "green" : score >= 50 ? "yellow" : "red";

const recommendation = (score) =>
  score >= 80
    ? [
        "Strong Investment Candidate",
        "green",
        "This startup shows strong fundamentals and is well-positioned to attract investor interest.",
      ]
    : score >= 55
      ? [
          "Promising with Reservations",
          "yellow",
          "This startup has potential but should address key risks and weaknesses before pursuing funding.",
        ]
      : [
          "Needs Significant Refinement",
          "red",
          "This startup requires substantial validation and refinement before it is investment-ready.",
        ];

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-line text-sm text-ink-900 leading-relaxed">
        {value || "—"}
      </p>
    </div>
  );
}

function List({ items, emptyText }) {
  return Array.isArray(items) && items.length ? (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5 text-sm text-ink-800 leading-relaxed">
          <i className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-400" />
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-on-surface-variant">{emptyText}</p>
  );
}

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-outline-variant bg-surface p-3 shadow-glass">
        <p className="font-semibold text-ink-900 mb-2">{label}</p>
        <p className="text-sm text-green-700">Revenue: ${payload[0].value.toLocaleString()}</p>
        <p className="text-sm text-burgundy-700">Expenses: ${payload[1].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function LegacySimulationDetails({ simulation }) {
  const navigate = useNavigate();

  const a = simulation.analysis || {};
  const score = a.startupScore || 0;
  const [label, tone, text] = recommendation(score);

  const mockProjections = Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    revenue: Math.round(5000 + i * (score * 100) + Math.random() * 5000),
    expenses: Math.round(8000 + i * (score * 50) + Math.random() * 3000),
  }));

  const projectionsData = a.monthlyProjections?.length ? a.monthlyProjections : mockProjections;

  const mockBreakdown = {
    market: Math.min(100, score + Math.round(Math.random() * 20 - 10)),
    product: Math.min(100, score + Math.round(Math.random() * 20 - 10)),
    team: Math.min(100, score + Math.round(Math.random() * 20 - 10)),
    execution: Math.min(100, score + Math.round(Math.random() * 20 - 10)),
  };

  const breakdown = a.scoreBreakdown || mockBreakdown;

  const radarData = [
    { subject: "Market", A: breakdown.market, fullMark: 100 },
    { subject: "Product", A: breakdown.product, fullMark: 100 },
    { subject: "Team", A: breakdown.team, fullMark: 100 },
    { subject: "Execution", A: breakdown.execution, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/simulations")}
        className="flex items-center gap-1.5 text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Simulations
      </button>

      {/* Header */}
      <div className="dossier-card flex flex-col justify-between gap-6 p-6 paper-grain sm:flex-row sm:items-center">
        <div>
          <div className="flex gap-3 items-center">
            <h1 className="font-headline text-2xl font-bold text-ink-900">{simulation.startupName}</h1>
            {simulation.industry && <Badge tone="blue">{simulation.industry}</Badge>}
            <span className="bg-ink-100 text-ink-800 text-[0.7rem] px-2 py-0.5 rounded font-data font-semibold">
              Legacy V1 Simulation
            </span>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            Simulated on {new Date(simulation.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded border border-brass-200 bg-brass-50 px-6 py-4 text-center shadow-soft">
          <span className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brass-700">
            <Gauge size={16} />
            AI Score
          </span>
          <p className="font-data mt-2 text-3xl font-bold text-ink-900">{score}/100</p>
          <div className="mt-2">
            <Badge tone={scoreTone(score)}>{label}</Badge>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Radar Chart */}
        <SectionCard icon={PieChart} title="Score Breakdown" className="lg:col-span-1">
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#14231c', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#B08D4A"
                  fill="#B08D4A"
                  fillOpacity={0.3}
                />
                <RechartsTooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Projections Area Chart */}
        <SectionCard icon={BarChart} title="12-Month Financial Projections" className="lg:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projectionsData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F3D2B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1F3D2B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2D26" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B2D26" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1F3D2B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#7B2D26"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {!a.monthlyProjections?.length && (
             <p className="mt-2 text-[10px] text-center text-on-surface-variant uppercase tracking-wider">
               * Illustrative mock projections (Legacy Simulation)
             </p>
          )}
        </SectionCard>
      </div>

      {/* Startup Overview */}
      <SectionCard icon={Building2} title="Startup Overview">
        <div className="grid gap-6 sm:grid-cols-2">
          <Info label="Problem Statement" value={simulation.problemStatement} />
          <Info label="Idea / Solution Details" value={simulation.idea} />
          <Info label="Target Audience" value={simulation.targetAudience} />
          <Info label="Business Model" value={simulation.businessModel} />
          <Info label="Funding Required" value={simulation.pricing} />
          <Info label="Unique Selling Proposition" value={simulation.uniqueSellingProposition} />
        </div>
      </SectionCard>

      {/* Market & Revenue Text Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={Target} title="Market Potential" className="h-full">
          <p className="text-sm text-ink-800 leading-relaxed">{a.marketPotential}</p>
        </SectionCard>
        <SectionCard icon={Wallet} title="Revenue Prediction" tone="green" className="h-full">
          <div className="space-y-5">
            <Info label="Revenue Prediction" value={a.revenuePrediction} />
            <Info label="Growth Prediction" value={a.growthPrediction} />
            <Info label="Cash Flow Outlook" value={a.cashFlow} />
          </div>
        </SectionCard>
      </div>

      {/* SWOT Analysis */}
      <h2 className="font-headline mt-10 text-xl font-bold text-ink-900">SWOT Analysis</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <SectionCard icon={CheckCircle2} title="Strengths" tone="green">
          <List items={a.strengths} emptyText="No strengths identified." />
        </SectionCard>
        <SectionCard icon={XCircle} title="Weaknesses" tone="red">
          <List items={a.weaknesses} emptyText="No weaknesses identified." />
        </SectionCard>
        <SectionCard icon={Lightbulb} title="Opportunities">
          <List items={a.recommendations} emptyText="No opportunities identified." />
        </SectionCard>
        <SectionCard icon={ShieldAlert} title="Threats" tone="amber">
          <List items={a.risks} emptyText="No threats identified." />
        </SectionCard>
      </div>

      {/* Funding Recommendation */}
      <SectionCard icon={Landmark} title="Funding Recommendation" tone="purple">
        <Badge tone={tone}>{label}</Badge>
        <p className="mt-4 text-sm text-ink-800 leading-relaxed">{text}</p>
      </SectionCard>

      {/* Final Verdict */}
      <div className="rounded border border-ink-800 bg-ink-900 p-8 shadow-glass paper-grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brass-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-headline text-xl font-bold text-surface">Final Verdict</h3>
            <p className="mt-2 text-sm text-ink-200 max-w-xl leading-relaxed">
              With an AI score of <b className="text-brass-400 font-data text-base">{score}/100</b>, this startup falls into
              the "<span className="text-white">{label}</span>" category. {text}
            </p>
          </div>
          <Link
            to={`/investor-room?simulationId=${simulation._id}`}
            className="wax-seal shrink-0 inline-flex items-center justify-center px-6 py-3 text-sm"
          >
            Pitch in Investor Room
          </Link>
        </div>
      </div>
    </div>
  );
}
