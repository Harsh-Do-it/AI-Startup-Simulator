import { MessageSquareText, Gavel, PercentCircle } from "lucide-react";

const points = [
  [MessageSquareText, "10 Real Investor Questions", "Covering problem, market, revenue, competition, team, and more."],
  [Gavel, "Live AI Evaluation", "Every answer is scored with strengths, weaknesses, and improvements."],
  [PercentCircle, "Funding Probability", "Get a final investment decision and your probability of funding."],
];

export default function InvestorRoomSection() {
  return (
    <section className="bg-surface-container px-4 py-20 border-y border-outline-variant/30">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          {points.map(([Icon, title, text]) => (
            <div key={title} className="flex gap-4 p-4 rounded bg-surface-container-lowest shadow-soft group hover:border-brass-500 border border-transparent transition-colors">
              <div className="h-fit rounded bg-brass-100 p-3 text-brass-700 group-hover:bg-ink-800 group-hover:text-brass-500 transition-colors">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-headline text-lg font-semibold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-headline text-3xl font-bold text-ink-900 sm:text-5xl">
            Step Into the Investor Room
          </h2>
          <p className="mt-6 text-on-surface-variant text-lg leading-relaxed">
            Face an AI-powered investor panel modeled after Shark Tank and Y Combinator
            interviews. Sharpen your pitch before a real boardroom.
          </p>
        </div>
      </div>
    </section>
  );
}
