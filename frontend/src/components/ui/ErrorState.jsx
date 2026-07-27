import { AlertTriangle, WifiOff, Lock } from "lucide-react";
import Button from "./Button.jsx";

const icons = {
  network: WifiOff,
  unauthorized: Lock,
  default: AlertTriangle,
};

export default function ErrorState({
  type = "default",
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
}) {
  const Icon = icons[type] || icons.default;

  return (
    <div className="flex flex-col items-center justify-center rounded border border-burgundy-200 bg-burgundy-50 px-6 py-16 text-center">
      <div className="mb-4 rounded bg-burgundy-100 p-4 text-burgundy-700">
        <Icon size={26} />
      </div>
      <h3 className="font-headline font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
