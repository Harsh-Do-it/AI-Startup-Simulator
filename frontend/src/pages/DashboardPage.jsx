import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Target, Trophy, PlusCircle, Clock } from "lucide-react";
import StatCard from "../components/dashboard/StatCard.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import useAuth from "../hooks/useAuth.js";
import simulationService from "../services/simulationService.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      setSimulations((await simulationService.getSimulations()).data || []);
    } catch (e) {
      setError(
        !e?.response ? "network" : e.response.status === 401 ? "unauthorized" : "default"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState type={error} onRetry={fetchData} />;

  const scores = simulations.map((s) => s.score?.overallScore ?? s.startupScore ?? s.analysis?.startupScore ?? 0);
  const average = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-6 rounded bg-ink-800 p-6 shadow-glass relative overflow-hidden sm:flex-row sm:items-center paper-grain"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-brass-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="font-headline text-2xl font-bold text-surface">
            Welcome back, {user?.name?.split(" ")[0] || "Founder"}
          </h1>
          <p className="mt-2 text-ink-200">
            Here's a snapshot of your AI startup simulations.
          </p>
        </div>
        <Link
          to="/simulations/new"
          className="wax-seal relative z-10 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <PlusCircle size={16} />
          Create New Simulation
        </Link>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Sparkles} label="Total Simulations" value={simulations.length} />
        <StatCard
          icon={Target}
          label="Average AI Score"
          value={average}
          decimals={1}
          suffix="/100"
          tone="green"
        />
        <StatCard
          icon={Trophy}
          label="Highest Score"
          value={scores.length ? Math.max(...scores) : 0}
          suffix="/100"
          tone="amber"
        />
      </div>

      <div className="dossier-card paper-grain">
        <div className="mb-4 flex justify-between px-6 pt-6">
          <h2 className="font-headline font-semibold text-ink-900">Recent Simulations</h2>
          <Link to="/simulations" className="text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors">
            View all
          </Link>
        </div>

        {simulations.length ? (
          <div className="px-6 pb-6 space-y-3">
            {simulations.slice(0, 5).map((s) => {
              const scoreVal = s.score?.overallScore ?? s.startupScore ?? s.analysis?.startupScore ?? 0;
              const ratingLabel = s.score?.classification || (scoreVal >= 80 ? "Strong Investment Candidate" : scoreVal >= 55 ? "Promising" : "Needs Refinement");
              const scoreTone = scoreVal >= 80 ? "green" : scoreVal >= 65 ? "blue" : scoreVal >= 50 ? "yellow" : "red";
              return (
                <Link
                  key={s._id}
                  to={`/simulations/${s._id}`}
                  className="flex items-center justify-between rounded border border-outline-variant p-3 hover:border-brass-400 hover:bg-surface-container-lowest transition-all"
                >
                  <span>
                    <b className="font-semibold text-ink-900">{s.startupName}</b>
                    <span className="ml-3 inline-flex items-center gap-1 text-xs text-on-surface-variant">
                      <Clock size={12} />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{ratingLabel}</span>
                    <Badge tone={scoreTone}>{scoreVal}/100</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-6 pb-6">
            <EmptyState
              icon={Sparkles}
              title="No simulations yet"
              description="Start your first AI startup simulation to see activity here."
              action={
                <Link to="/simulations/new">
                  <Button variant="primary">New Simulation</Button>
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
