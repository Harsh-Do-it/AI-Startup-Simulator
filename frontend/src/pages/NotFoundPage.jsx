import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center paper-grain">
      <h1 className="font-headline text-7xl font-extrabold text-ink-900">404</h1>
      <p className="mt-4 text-xl font-medium text-on-surface-variant">Page not found</p>
      <Link
        to="/"
        className="mt-8 rounded bg-ink-800 px-6 py-3 text-sm font-semibold text-surface hover:bg-ink-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
