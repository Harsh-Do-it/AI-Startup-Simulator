import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter.jsx";

const tones = {
  primary: "bg-ink-100 text-ink-700",
  green: "bg-surface-container-high text-ink-600",
  amber: "bg-brass-50 text-brass-700",
  purple: "bg-ink-50 text-ink-800",
};

export default function StatCard({ icon: Icon, label, value, suffix = "", decimals = 0, tone = "primary" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dossier-card p-5 paper-grain"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">{label}</p>
        <div className={`rounded p-2.5 ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="font-data mt-3 text-2xl font-bold text-ink-900">
        <AnimatedCounter value={value} decimals={decimals} />
        {suffix}
      </p>
    </motion.div>
  );
}
