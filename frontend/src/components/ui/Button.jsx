import { motion } from "framer-motion";
import ButtonLoader from "./ButtonLoader.jsx";

const styles = {
  primary: "bg-ink-800 text-surface hover:bg-ink-700 hover:border-brass-500 border border-transparent",
  outline: "border border-brass-500 text-ink-800 hover:bg-brass-50",
  ghost: "text-brass-600 hover:bg-surface-container",
  danger: "bg-burgundy-700 text-white hover:bg-burgundy-600 border border-transparent",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...rest
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        styles[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? <ButtonLoader /> : children}
    </motion.button>
  );
}
