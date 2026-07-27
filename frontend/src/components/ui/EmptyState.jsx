import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded border border-dashed border-brass-400 bg-surface-container-lowest px-6 py-16 text-center shadow-soft"
    >
      {Icon && (
        <div className="mb-4 rounded bg-brass-100 p-4 text-brass-700">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-headline font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
