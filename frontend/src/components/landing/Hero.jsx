import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-surface via-surface to-surface-container-lowest px-4 pb-20 pt-24 text-center paper-grain">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl relative z-10"
      >
        <p className="mb-6 inline-flex items-center gap-2 rounded border border-brass-500 bg-brass-50 px-4 py-1.5 text-sm font-semibold tracking-wide text-ink-900 uppercase">
          <Sparkles size={14} className="text-brass-600" />
          Powered by Google Gemini AI
        </p>
        <h1 className="font-headline text-5xl font-bold tracking-tight text-ink-900 sm:text-7xl">
          Validate Your Startup Idea
          <span className="block text-ink-700 italic mt-2">Before You Build It</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant font-medium">
          Simulate your startup with AI, get venture-capital grade analysis, and pitch to an
          AI investor panel — before you write a single line of code.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="wax-seal inline-flex items-center justify-center gap-2 px-8 py-3 text-sm shadow-soft"
          >
            Start Simulating Free <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="rounded border border-brass-500 bg-transparent px-8 py-3 text-sm font-semibold text-ink-900 hover:bg-brass-50 transition-colors"
          >
            I Already Have an Account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
