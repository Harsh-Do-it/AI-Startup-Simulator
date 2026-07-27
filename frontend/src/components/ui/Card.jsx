import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={hover ? { y: -4, boxShadow: "var(--shadow-card)" } : {}}
      className={`dossier-card p-6 paper-grain ${className}`}
    >
      {children}
    </motion.div>
  );
}
