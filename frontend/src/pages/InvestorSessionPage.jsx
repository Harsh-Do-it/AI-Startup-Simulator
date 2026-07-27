import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ShieldAlert,
  MessageSquareText,
  Gauge,
} from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import investorService from "../services/investorService.js";

const scoreTone = (s) => (s >= 75 ? "green" : s >= 50 ? "yellow" : "red");
const decisionTone = (d) =>
  d === "Fund" ? "green" : d === "Do Not Fund" ? "red" : "yellow";

function ScoreRing({ score }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 75
      ? "#1F3D2B" // Deep Forest
      : score >= 50
        ? "#B08D4A" // Aged Brass
        : "#7B2D26"; // Muted Burgundy

  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-outline-variant)" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="54" textAnchor="middle" className="fill-ink-900 font-data text-lg font-bold" fontSize="18">
        {score}
      </text>
    </svg>
  );
}

export default function InvestorSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await investorService.getSession(id);
      setSession(res.data);
    } catch (e) {
      setError(
        !e?.response ? "network" : e.response.status === 401 ? "unauthorized" : "default"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <ErrorState
        type={error || "default"}
        title="Session Not Found"
        onRetry={fetchSession}
      />
    );
  }

  const isCompleted = session.status === "completed";
  const fb = session.feedback;
  const avgScore =
    session.answers?.length
      ? Math.round(
          session.answers.reduce((sum, a) => sum + (a.score || 0), 0) /
            session.answers.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate("/investor-history")}
        className="flex items-center gap-1.5 text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Investor History
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dossier-card flex flex-col justify-between gap-6 p-6 paper-grain sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900">Investor Session</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {new Date(session.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-3 flex gap-2">
            <Badge tone={isCompleted ? "green" : "yellow"}>
              {isCompleted ? "Completed" : "In Progress"}
            </Badge>
            <Badge tone="blue">
              {session.answers?.length || 0}/{session.questions?.length || 10} Answered
            </Badge>
          </div>
        </div>

        <div className="rounded border border-brass-200 bg-brass-50 px-6 py-4 text-center shadow-soft">
          <span className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brass-700">
            <Gauge size={16} />
            Avg. Score
          </span>
          <p className="font-data mt-2 text-3xl font-bold text-ink-900">{avgScore}/100</p>
        </div>
      </motion.div>

      {/* Final Report */}
      {isCompleted && fb && (
        <div className="space-y-6">
          <div className="dossier-card p-8 text-center paper-grain">
            <Trophy size={32} className="mx-auto text-brass-600" />
            <h2 className="font-headline mt-4 text-2xl font-bold text-ink-900">Final Investor Verdict</h2>
            <div className="mt-6 flex items-center justify-center gap-8">
              <ScoreRing score={fb.overallScore} />
              <div className="text-left">
                <Badge
                  tone={decisionTone(fb.decision)}
                  className="font-headline text-base font-bold px-4 py-1.5"
                >
                  {fb.decision}
                </Badge>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Funding Probability: <b className="font-data text-ink-900">{fb.probabilityOfFunding}</b>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard icon={CheckCircle2} title="Strong Points" tone="green">
              <ul className="space-y-2">
                {fb.strongPoints?.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard icon={XCircle} title="Weak Points" tone="red">
              <ul className="space-y-2">
                {fb.weakPoints?.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard icon={ShieldAlert} title="Major Risks" tone="amber">
              <ul className="space-y-2">
                {fb.majorRisks?.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard icon={Lightbulb} title="Suggestions">
              <ul className="space-y-2">
                {fb.suggestions?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Q&A Transcript */}
      <SectionCard icon={MessageSquareText} title="Q&A Transcript">
        <div className="space-y-4">
          {session.questions?.map((q, idx) => {
            const ans = session.answers?.find(
              (a) => a.questionNumber === q.questionNumber
            );
            return (
              <div
                key={idx}
                className="rounded border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-headline font-semibold text-ink-900">
                    Q{q.questionNumber}.{" "}
                    <Badge tone="blue" className="ml-1">
                      {q.category}
                    </Badge>
                  </p>
                  {ans && (
                    <Badge tone={scoreTone(ans.score)}>{ans.score}/100</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-ink-800">{q.question}</p>

                {ans ? (
                  <>
                    <p className="mt-3 rounded border border-brass-200 bg-brass-50 p-3 text-sm text-ink-800">
                      <b className="text-ink-900">Your answer:</b> {ans.answer}
                    </p>
                    <p className="mt-3 text-sm italic text-on-surface-variant">
                      "{ans.investorComment}"
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      {ans.strengths?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                            Strengths
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {ans.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-ink-800">
                                • {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ans.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-700">
                            Weaknesses
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {ans.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-ink-800">
                                • {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ans.improvements?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-brass-700">
                            Improvements
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {ans.improvements.map((imp, i) => (
                              <li key={i} className="text-xs text-ink-800">
                                • {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm italic text-on-surface-variant">
                    Not answered yet
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
