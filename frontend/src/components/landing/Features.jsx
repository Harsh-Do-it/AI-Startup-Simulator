import { Brain, TrendingUp, ShieldCheck, Users2 } from "lucide-react";
import SectionCard from "../ui/SectionCard.jsx";

const data = [
  [Brain, "AI Startup Analysis", "Get a detailed evaluation of market potential, revenue outlook, and growth trajectory in seconds."],
  [Users2, "AI Investor Interviews", "Practice a realistic Shark Tank / YC-style pitch interview with an AI investor panel."],
  [TrendingUp, "Growth Predictions", "Understand cash flow, revenue, and scaling potential before committing real resources."],
  [ShieldCheck, "Risk Assessment", "Identify strengths, weaknesses, and risks that could make or break your startup."],
];

export default function Features() {
  return (
    <section className="px-4 py-20 bg-surface">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold text-ink-900 sm:text-5xl">
            Everything You Need to Validate Your Idea
          </h2>
          <p className="mt-4 text-on-surface-variant font-medium text-lg">
            Built for founders who want data-driven answers, not guesswork.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.map(([Icon, title, description]) => (
            <SectionCard key={title} icon={Icon} title={title} tone="amber" className="h-full">
              <p className="text-sm text-on-surface-variant">{description}</p>
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  );
}
