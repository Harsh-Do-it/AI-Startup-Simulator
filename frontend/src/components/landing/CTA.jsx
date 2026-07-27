import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-4 py-24 bg-surface">
      <div className="mx-auto max-w-4xl rounded-xl border border-brass-500 bg-ink-800 px-6 py-16 text-center shadow-glass relative overflow-hidden paper-grain">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-brass-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brass-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <h2 className="font-headline text-3xl font-bold text-surface sm:text-5xl relative z-10">
          Ready to Test Your Startup Idea?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-ink-200 text-lg relative z-10">
          Join founders using AI to validate ideas before investing months of time and money.
        </p>
        <Link
          to="/signup"
          className="wax-seal mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-base relative z-10"
        >
          Get Started for Free <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
