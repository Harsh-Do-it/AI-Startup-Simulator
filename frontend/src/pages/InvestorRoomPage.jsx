import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Users,
  MessageSquareText,
  Send,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Gauge,
  Gavel,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import Badge from "../components/ui/Badge.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import Select from "../components/ui/Select.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import simulationService from "../services/simulationService.js";
import investorService from "../services/investorService.js";

const scoreTone = (s) => (s >= 75 ? "green" : s >= 50 ? "yellow" : "red");

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

function FeedbackPanel({ feedback }) {
  if (!feedback) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4 rounded border border-brass-200 bg-brass-50 p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-headline font-bold text-ink-900">AI Investor Evaluation</h4>
        <Badge tone={scoreTone(feedback.score)}>{feedback.score}/100</Badge>
      </div>

      <p className="text-sm italic text-ink-800">"{feedback.investorComment}"</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
            <CheckCircle2 size={13} /> Strengths
          </p>
          <ul className="space-y-1.5">
            {feedback.strengths?.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-sm text-ink-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy-700">
            <XCircle size={13} /> Weaknesses
          </p>
          <ul className="space-y-1.5">
            {feedback.weaknesses?.map((w, i) => (
              <li key={i} className="flex gap-1.5 text-sm text-ink-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brass-700">
            <Lightbulb size={13} /> Improvements
          </p>
          <ul className="space-y-1.5">
            {feedback.improvements?.map((imp, i) => (
              <li key={i} className="flex gap-1.5 text-sm text-ink-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function FinalReport({ report }) {
  if (!report) return null;
  const decisionTone =
    report.decision === "Fund"
      ? "green"
      : report.decision === "Do Not Fund"
        ? "red"
        : "yellow";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="dossier-card p-8 text-center paper-grain">
        <Trophy size={32} className="mx-auto text-brass-600" />
        <h2 className="font-headline mt-4 text-2xl font-bold text-ink-900">Investor Verdict</h2>
        <div className="mt-6 flex items-center justify-center gap-8">
          <ScoreRing score={report.overallScore} />
          <div className="text-left">
            <Badge tone={decisionTone} className="text-base px-4 py-1.5 font-headline font-bold">{report.decision}</Badge>
            <p className="mt-2 text-sm text-on-surface-variant">
              Funding Probability: <b className="text-ink-900 font-data">{report.probabilityOfFunding}</b>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SectionCard icon={CheckCircle2} title="Strong Points" tone="green">
          <ul className="space-y-2">
            {report.strongPoints?.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {p}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard icon={XCircle} title="Weak Points" tone="red">
          <ul className="space-y-2">
            {report.weakPoints?.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-500" />
                {p}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard icon={ShieldAlert} title="Major Risks" tone="amber">
          <ul className="space-y-2">
            {report.majorRisks?.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard icon={Lightbulb} title="Suggestions">
          <ul className="space-y-2">
            {report.suggestions?.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                {s}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="rounded border border-brass-200 bg-brass-50 p-6 text-center">
        <p className="text-sm text-ink-800">
          Your investor session is complete. You can review it anytime from your{" "}
          <Link to="/investor-history" className="font-semibold text-brass-700 hover:text-brass-600 hover:underline">
            Investor History
          </Link>.
        </p>
      </div>
    </motion.div>
  );
}

export default function InvestorRoomPage() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("simulationId");

  /* ─── state ──────────────────────────────────── */
  const [simulations, setSimulations] = useState([]);
  const [loadingSims, setLoadingSims] = useState(true);
  const [simsError, setSimsError] = useState(null);

  const [selectedSimId, setSelectedSimId] = useState(preselectedId || "");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0); // 0-indexed pointer
  const [answer, setAnswer] = useState("");
  const [feedbacks, setFeedbacks] = useState([]); // array of feedback objects per question
  const [finalReport, setFinalReport] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [startingSession, setStartingSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ─── load simulations ───────────────────────── */
  const fetchSimulations = useCallback(async () => {
    setLoadingSims(true);
    setSimsError(null);
    try {
      const res = await simulationService.getSimulations();
      setSimulations(res.data || []);
    } catch (e) {
      setSimsError(
        !e?.response ? "network" : e.response.status === 401 ? "unauthorized" : "default"
      );
    } finally {
      setLoadingSims(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  /* ─── auto-start if preselected ──────────────── */
  useEffect(() => {
    if (preselectedId && simulations.length && !sessionId) {
      setSelectedSimId(preselectedId);
    }
  }, [preselectedId, simulations, sessionId]);

  /* ─── start session ──────────────────────────── */
  const handleStart = async () => {
    if (!selectedSimId) {
      toast.error("Please select a simulation first.");
      return;
    }
    setStartingSession(true);
    try {
      const res = await investorService.startSession(selectedSimId);
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setCurrentQ(0);
      setFeedbacks([]);
      setFinalReport(null);
      setSessionCompleted(false);
      setAnswer("");
      toast.success("Investor session started! Answer the first question.");
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to start investor session. Try again."
      );
    } finally {
      setStartingSession(false);
    }
  };

  /* ─── submit answer ──────────────────────────── */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please type your answer before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const questionNumber = questions[currentQ].questionNumber;
      const res = await investorService.answerQuestion({
        sessionId,
        questionNumber,
        answer: answer.trim(),
      });

      setFeedbacks((prev) => [...prev, { questionNumber, userAnswer: answer.trim(), ...res.data.feedback }]);

      if (res.data.sessionCompleted) {
        setFinalReport(res.data.finalReport);
        setSessionCompleted(true);
        toast.success("All questions answered! Here's your investor verdict.");
      } else {
        setCurrentQ((prev) => prev + 1);
        toast.success(`Answer ${questionNumber}/10 evaluated. Next question!`);
      }
      setAnswer("");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit answer. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── reset ──────────────────────────────────── */
  const handleReset = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrentQ(0);
    setFeedbacks([]);
    setFinalReport(null);
    setSessionCompleted(false);
    setAnswer("");
    setSelectedSimId("");
  };

  /* ─── loading / error ────────────────────────── */
  if (loadingSims) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (simsError) {
    return <ErrorState type={simsError} onRetry={fetchSimulations} />;
  }

  /* ─── no simulations at all ──────────────────── */
  if (!simulations.length) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No simulations found"
        description="You need to run a startup simulation first before entering the Investor Room."
        action={
          <Link to="/simulations/new">
            <Button variant="primary">Create a Simulation</Button>
          </Link>
        }
      />
    );
  }

  /* ─── session completed → show final report ──── */
  if (sessionCompleted && finalReport) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <FinalReport report={finalReport} />

        {/* Q&A Transcript */}
        <SectionCard icon={MessageSquareText} title="Full Q&A Transcript">
          <div className="space-y-4">
            {feedbacks.map((fb, idx) => {
              const q = questions[idx];
              return (
                <div key={idx} className="rounded border border-outline-variant bg-surface-container-lowest p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-headline font-semibold text-ink-900">
                      Q{q.questionNumber}. <Badge tone="blue" className="ml-1">{q.category}</Badge>
                    </p>
                    <Badge tone={scoreTone(fb.score)}>{fb.score}/100</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-800">{q.question}</p>
                  <p className="mt-3 rounded border border-brass-200 bg-brass-50 p-3 text-sm text-ink-800">
                    <b className="text-ink-900">Your answer:</b> {fb.userAnswer}
                  </p>
                  <p className="mt-3 text-sm italic text-on-surface-variant">"{fb.investorComment}"</p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="text-center mt-8">
          <Button onClick={handleReset} variant="outline">Start Another Session</Button>
        </div>
      </div>
    );
  }

  /* ─── active Q&A session ─────────────────────── */
  if (sessionId && questions.length) {
    const q = questions[currentQ];
    const progressPct = ((currentQ) / questions.length) * 100;
    const lastFeedback = feedbacks.length ? feedbacks[feedbacks.length - 1] : null;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-headline text-2xl font-bold text-ink-900">Investor Room</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Answer the investor's questions. Each answer is evaluated in real time.
            </p>
          </div>
          <Badge tone="blue">
            Question {currentQ + 1} of {questions.length}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-brass-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Previous answer feedback */}
        <AnimatePresence>
          {lastFeedback && currentQ > 0 && (
            <FeedbackPanel feedback={lastFeedback} />
          )}
        </AnimatePresence>

        {/* Current question card */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="dossier-card p-6 paper-grain"
        >
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-ink-800 font-data text-xs font-bold text-surface">
              {q.questionNumber}
            </div>
            <Badge tone="blue">{q.category}</Badge>
          </div>
          <p className="mt-4 text-base font-semibold text-ink-900">{q.question}</p>

          <div className="mt-6">
            <Textarea
              label="Your Answer"
              placeholder="Type your answer here... Be specific and strategic."
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              helperText={`${answer.length} characters`}
            />
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              onClick={handleSubmitAnswer}
              loading={submitting}
              fullWidth
            >
              <Send size={16} />
              Submit Answer ({currentQ + 1}/{questions.length})
            </Button>
          </div>
        </motion.div>

        {/* Answered questions summary */}
        {feedbacks.length > 0 && (
          <details className="rounded border border-outline-variant bg-surface-container-lowest p-4 shadow-soft">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-on-surface-variant outline-none">
              Previous Answers ({feedbacks.length}/{questions.length} completed)
            </summary>
            <div className="mt-4 space-y-3">
              {feedbacks.map((fb, idx) => (
                <div key={idx} className="flex items-center justify-between rounded border border-outline-variant p-3 bg-surface">
                  <span className="text-sm font-medium text-ink-800">
                    Q{fb.questionNumber}. {questions[idx]?.category}
                  </span>
                  <Badge tone={scoreTone(fb.score)}>{fb.score}/100</Badge>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  }

  /* ─── simulation selection (default view) ────── */
  const selectedSim = simulations.find((s) => s._id === selectedSimId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-brass-50 text-brass-700">
            <Users size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-ink-900">Investor Room</h1>
            <p className="text-sm text-on-surface-variant">
              Pitch your startup to an AI investor panel. 10 tough questions. Real-time scoring.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dossier-card p-6 paper-grain"
      >
        <h2 className="mb-4 font-semibold uppercase tracking-wider text-xs text-on-surface-variant">Select a Startup to Pitch</h2>

        <div className="space-y-5">
          <select
            value={selectedSimId}
            onChange={(e) => setSelectedSimId(e.target.value)}
            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm outline-none focus:border-brass-500 focus:ring-2 focus:ring-brass-100"
          >
            <option value="">Choose a simulation...</option>
            {simulations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.startupName} — {s.industry} (Score: {s.score?.overallScore ?? s.startupScore ?? s.analysis?.startupScore ?? 0}/100)
              </option>
            ))}
          </select>

          {selectedSim && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded border border-brass-200 bg-brass-50 p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-headline text-lg font-bold text-ink-900">{selectedSim.startupName}</p>
                  <p className="text-sm text-brass-700 font-semibold uppercase tracking-wider text-xs mt-1">{selectedSim.industry}</p>
                </div>
                <div className="text-center bg-white rounded p-2 border border-brass-200">
                  <p className="text-[10px] font-semibold uppercase text-on-surface-variant">AI Score</p>
                  <p className="font-data text-xl font-bold text-ink-900 leading-none mt-1">
                    {selectedSim.score?.overallScore ?? selectedSim.startupScore ?? selectedSim.analysis?.startupScore ?? 0}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-800 line-clamp-2 leading-relaxed">
                {selectedSim.idea}
              </p>
            </motion.div>
          )}

          <Button onClick={handleStart} loading={startingSession} fullWidth disabled={!selectedSimId}>
            <Gavel size={16} />
            Enter the Investor Room
          </Button>
        </div>
      </motion.div>

      <div className="rounded border border-dashed border-brass-300 bg-surface-container-lowest p-6 text-center shadow-soft">
        <Gauge size={24} className="mx-auto text-brass-600" />
        <h3 className="mt-3 font-headline font-semibold text-ink-900">How It Works</h3>
        <div className="mx-auto mt-5 grid max-w-xl gap-4 sm:grid-cols-3">
          {[
            ["10 Questions", "AI asks 10 tough VC questions about your startup."],
            ["Real-time Scoring", "Each answer is scored with strengths and weaknesses."],
            ["Final Verdict", "Get a funding decision and probability."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded bg-surface p-4 border border-outline-variant">
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="mt-1.5 text-xs text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
