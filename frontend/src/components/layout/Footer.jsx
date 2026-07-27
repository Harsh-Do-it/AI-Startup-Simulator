import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-ink-700/30 bg-ink-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500 text-xs font-bold text-ink-800">
            AI
          </div>
          <span className="text-sm font-semibold text-surface">AI Startup Simulator</span>
        </div>
        <div className="flex gap-6 text-sm text-ink-200">
          <Link to="/" className="hover:text-brass-400 transition-colors">Home</Link>
          <Link to="/login" className="hover:text-brass-400 transition-colors">Login</Link>
          <Link to="/signup" className="hover:text-brass-400 transition-colors">Get Started</Link>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} AI Startup Simulator. All rights reserved.
      </p>
    </footer>
  );
}
