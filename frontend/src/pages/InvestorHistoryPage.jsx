import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { History, Users, Calendar, Trophy, ArrowRight, Sparkles } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Button from "../components/ui/Button.jsx";
import investorService from "../services/investorService.js";

const scoreTone = (s) => (s >= 75 ? "green" : s >= 50 ? "yellow" : "red");
const decisionTone = (d) =>
  d === "Fund" ? "green" : d === "Do Not Fund" ? "red" : "yellow";

export default function InvestorHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await investorService.getHistory();
      setSessions(res.data || []);
    } catch (e) {
      setError(
        !e?.response ? "network" : e.response.status === 401 ? "unauthorized" : "default"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState type={error} onRetry={fetchHistory} />;

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-brass-50 text-brass-700">
            <History size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-ink-900">Investor History</h1>
            <p className="text-sm text-on-surface-variant">
              Review all your past investor sessions and verdicts.
            </p>
          </div>
        </div>
        <Link to="/investor-room">
          <Button variant="primary" className="gap-2">
            <Users size={16} />
            New Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No investor sessions yet"
          description="Enter the Investor Room to pitch your startup to an AI investor panel."
          action={
            <Link to="/investor-room">
              <Button variant="primary">Enter Investor Room</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, idx) => {
            const startupName =
              session.simulation?.startupName || "Unknown Startup";
            const industry = session.simulation?.industry || "—";
            const isCompleted = session.status === "completed";
            const date = new Date(session.createdAt).toLocaleDateString(
              "en-US",
              { day: "numeric", month: "short", year: "numeric" }
            );

            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, boxShadow: "var(--shadow-card)" }}
                className="dossier-card flex flex-col p-5 paper-grain"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-headline font-semibold text-ink-900">{startupName}</h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-xs text-on-surface-variant">{industry}</p>
                  </div>
                  <Badge tone={isCompleted ? "green" : "yellow"}>
                    {isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                {isCompleted && session.overallScore !== null && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded border border-brass-200 bg-brass-50 px-2.5 py-1">
                      <Trophy size={14} className="text-brass-600" />
                      <span className="font-data text-sm font-bold text-ink-900">
                        {session.overallScore}/100
                      </span>
                    </div>
                    {session.decision && (
                      <Badge tone={decisionTone(session.decision)}>
                        {session.decision}
                      </Badge>
                    )}
                  </div>
                )}

                <p className="mt-4 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Calendar size={13} />
                  {date}
                </p>

                <p className="mt-1 text-xs text-on-surface-variant">
                  {session.answers?.length || 0}/{session.questions?.length || 10} questions answered
                </p>

                <div className="mt-5">
                  <Link
                    to={`/investor-session/${session._id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded bg-ink-800 px-3 py-2 text-sm font-semibold text-surface hover:bg-ink-700 transition-colors"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
