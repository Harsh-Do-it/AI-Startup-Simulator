import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCircle,
  Mail,
  Calendar,
  Sparkles,
  Target,
  Trophy,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import useAuth from "../hooks/useAuth.js";
import simulationService from "../services/simulationService.js";
import investorService from "../services/investorService.js";

export default function ProfilePage() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [investorSessions, setInvestorSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [simsRes, invRes] = await Promise.all([
        simulationService.getSimulations(),
        investorService.getHistory(),
      ]);
      setSimulations(simsRes.data || []);
      setInvestorSessions(invRes.data || []);
    } catch (e) {
      setError(
        !e?.response ? "network" : e.response.status === 401 ? "unauthorized" : "default"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState type={error} onRetry={fetchData} />;

  const simScores = simulations.map((s) => s.score?.overallScore ?? s.startupScore ?? s.analysis?.startupScore ?? 0);
  const avgSimScore = simScores.length
    ? simScores.reduce((a, b) => a + b, 0) / simScores.length
    : 0;
  const highestSimScore = simScores.length ? Math.max(...simScores) : 0;

  const completedSessions = investorSessions.filter(
    (s) => s.status === "completed"
  );
  const invScores = completedSessions
    .map((s) => s.overallScore)
    .filter((s) => s != null);
  const avgInvScore = invScores.length
    ? invScores.reduce((a, b) => a + b, 0) / invScores.length
    : 0;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dossier-card p-6 paper-grain"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-ink-800 font-headline text-3xl font-bold text-brass-500 shadow-soft">
            {initial}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-headline text-2xl font-bold text-ink-900">{user?.name || "Founder"}</h1>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Mail size={14} />
                {user?.email}
              </span>
              <span className="hidden text-brass-300 sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Calendar size={14} />
                Joined {joinDate}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge tone="blue">{user?.role || "user"}</Badge>
              {simulations.length >= 5 && (
                <Badge tone="green">Active Founder</Badge>
              )}
              {completedSessions.length >= 3 && (
                <Badge tone="yellow">Pitch Veteran</Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Sparkles}
          label="Total Simulations"
          value={simulations.length}
        />
        <StatCard
          icon={Target}
          label="Avg Simulation Score"
          value={avgSimScore}
          decimals={1}
          suffix="/100"
          tone="green"
        />
        <StatCard
          icon={Users}
          label="Investor Sessions"
          value={investorSessions.length}
          tone="purple"
        />
        <StatCard
          icon={Trophy}
          label="Avg Investor Score"
          value={avgInvScore}
          decimals={1}
          suffix="/100"
          tone="amber"
        />
      </div>

      {/* Recent Simulations */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dossier-card paper-grain"
      >
        <div className="mb-4 flex items-center justify-between px-6 pt-6">
          <h2 className="font-headline font-semibold text-ink-900">Recent Simulations</h2>
          <Link to="/simulations" className="text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors">
            View all
          </Link>
        </div>
        {simulations.length ? (
          <div className="space-y-3 px-6 pb-6">
            {simulations.slice(0, 5).map((s) => (
              <Link
                key={s._id}
                to={`/simulations/${s._id}`}
                className="flex items-center justify-between rounded border border-outline-variant p-3 hover:border-brass-400 hover:bg-surface-container-lowest transition-all"
              >
                <div>
                  <p className="font-semibold text-ink-900">{s.startupName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Clock size={12} />
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="blue">{s.score?.overallScore ?? s.startupScore ?? s.analysis?.startupScore ?? 0}/100</Badge>
                  <ArrowRight size={14} className="text-brass-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-6">
            <p className="text-sm text-on-surface-variant">
              No simulations yet.{" "}
              <Link to="/simulations/new" className="font-semibold text-brass-700 hover:text-brass-600 transition-colors">
                Create your first one
              </Link>
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Investor Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="dossier-card paper-grain"
      >
        <div className="mb-4 flex items-center justify-between px-6 pt-6">
          <h2 className="font-headline font-semibold text-ink-900">Recent Investor Sessions</h2>
          <Link to="/investor-history" className="text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors">
            View all
          </Link>
        </div>
        {investorSessions.length ? (
          <div className="space-y-3 px-6 pb-6">
            {investorSessions.slice(0, 5).map((ses) => {
              const isCompleted = ses.status === "completed";
              return (
                <Link
                  key={ses._id}
                  to={`/investor-session/${ses._id}`}
                  className="flex items-center justify-between rounded border border-outline-variant p-3 hover:border-brass-400 hover:bg-surface-container-lowest transition-all"
                >
                  <div>
                    <p className="font-semibold text-ink-900">
                      {ses.simulation?.startupName || "Session"}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Clock size={12} />
                      {new Date(ses.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Badge tone={isCompleted ? "green" : "yellow"}>
                        {isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                      {isCompleted && ses.overallScore != null && (
                        <Badge tone="blue">{ses.overallScore}/100</Badge>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-brass-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-6 pb-6">
            <p className="text-sm text-on-surface-variant">
              No investor sessions yet.{" "}
              <Link to="/investor-room" className="font-semibold text-brass-700 hover:text-brass-600 transition-colors">
                Enter the Investor Room
              </Link>
            </p>
          </div>
        )}
      </motion.div>

      {/* Disclaimer */}
      <div className="rounded border border-dashed border-outline-variant bg-surface-container-low p-4 text-center">
        <p className="text-xs text-on-surface-variant">
          All simulations and investor evaluations are AI-generated and illustrative.
          They are not financial advice or a guarantee of real-world performance.
        </p>
      </div>
    </div>
  );
}
