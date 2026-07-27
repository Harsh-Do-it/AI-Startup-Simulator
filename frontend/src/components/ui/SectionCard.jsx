import { motion } from "framer-motion";

const tones = {
  primary: "bg-ink-100 text-ink-700",
  green: "bg-surface-container-high text-ink-600",
  red: "bg-burgundy-50 text-burgundy-700",
  amber: "bg-brass-50 text-brass-700",
  purple: "bg-ink-50 text-ink-800",
};

export default function SectionCard({ icon: Icon, title, tone = "primary", children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dossier-card p-6 paper-grain ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div className={`rounded p-2.5 ${tones[tone]}`}>
            <Icon size={17} />
          </div>
        )}
        <h3 className="font-headline font-semibold text-ink-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
