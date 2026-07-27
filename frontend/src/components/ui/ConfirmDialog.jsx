import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 z-[60] flex items-center justify-center glass-overlay px-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded dossier-card p-6 paper-grain"
          >
            <div className="w-fit rounded bg-burgundy-50 p-3 text-burgundy-600">
              <AlertTriangle size={20} />
            </div>
            <h3 className="mt-4 font-headline font-semibold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm text-on-surface-variant">{description}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
