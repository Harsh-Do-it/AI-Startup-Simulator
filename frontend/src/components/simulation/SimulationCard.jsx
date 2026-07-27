import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Building2, Eye, Trash2 } from "lucide-react";
import Badge from "../ui/Badge.jsx";

const tone = (score) => (score >= 75 ? "green" : score >= 50 ? "yellow" : "red");

export default function SimulationCard({ simulation, onDeleteClick }) {
  const score = simulation.score?.overallScore ?? simulation.startupScore ?? simulation.analysis?.startupScore ?? 0;
  const date = new Date(simulation.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "var(--shadow-card)" }}
      className="dossier-card flex flex-col p-5 paper-grain"
    >
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-headline font-semibold text-ink-900">{simulation.startupName}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Building2 size={14} />
            {simulation.industry}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={tone(score)}>{score}/100</Badge>
          <span className="text-[0.65rem] font-semibold text-on-surface-variant uppercase tracking-wider">
            {simulation.score?.classification || (score >= 80 ? "Strong Candidate" : score >= 55 ? "Promising" : "Needs Refinement")}
          </span>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant/70">
        <Calendar size={13} />
        {date}
      </p>

      <div className="mt-5 flex gap-2">
        <Link
          to={`/simulations/${simulation._id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded bg-ink-800 px-3 py-2 text-sm font-semibold text-surface hover:bg-ink-700 transition-colors"
        >
          <Eye size={15} />
          View
        </Link>
        <button
          onClick={() => onDeleteClick(simulation)}
          className="rounded border border-burgundy-200 px-3 text-burgundy-700 hover:bg-burgundy-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}
