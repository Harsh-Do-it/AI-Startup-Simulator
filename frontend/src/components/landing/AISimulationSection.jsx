import { BarChart3, Target, Wallet, TrendingUp } from "lucide-react";
import Card from "../ui/Card.jsx";

const metrics = [
  [Target, "Startup Score", "0-100"],
  [BarChart3, "Market Potential", "Analyzed"],
  [Wallet, "Cash Flow Outlook", "Projected"],
  [TrendingUp, "Growth Prediction", "Forecasted"],
];

export default function AISimulationSection() {
  return (
    <section className="px-4 py-20 bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-headline text-3xl font-bold text-ink-900 sm:text-5xl">
            AI Simulation Engine
          </h2>
          <p className="mt-6 text-on-surface-variant text-lg leading-relaxed">
            Submit your startup idea and let our AI mentor act as an experienced venture
            capitalist — scoring your startup, predicting revenue and growth, and surfacing
            risks you might have missed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map(([Icon, label, value]) => (
            <Card key={label} className="!p-5">
              <div className="mb-3 w-fit rounded bg-brass-50 p-2.5 text-brass-700">
                <Icon size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{label}</p>
              <p className="font-data mt-1 text-lg font-bold text-ink-900">{value}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
