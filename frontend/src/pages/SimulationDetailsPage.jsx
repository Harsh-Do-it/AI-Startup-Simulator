import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Gauge,
  Sliders,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "../components/ui/Skeleton.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import useSimulationDashboard from "../hooks/useSimulationDashboard.js";
import LegacySimulationDetails from "../components/simulation/LegacySimulationDetails.jsx";
import ScenarioToggle from "../components/simulation/ScenarioToggle.jsx";
import TimelineScrubber from "../components/simulation/TimelineScrubber.jsx";
import MonthSnapshot from "../components/simulation/MonthSnapshot.jsx";
import SimulationCharts from "../components/simulation/SimulationCharts.jsx";
import WarningsBanner from "../components/simulation/WarningsBanner.jsx";
import AssumptionsPanel from "../components/simulation/AssumptionsPanel.jsx";
import StartupScorerDashboard from "../components/simulation/StartupScorerDashboard.jsx";

export default function SimulationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    simulation,
    loading,
    error,
    rerunning,
    isLegacy,
    activeScenario,
    setActiveScenario,
    selectedMonth,
    setSelectedMonth,
    currentScenarioData,
    selectedMonthData,
    summary,
    warnings,
    assumptions,
    handleRerun,
    refetch,
  } = useSimulationDashboard(id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [editedAssumptions, setEditedAssumptions] = useState(null);
  const [activeTab, setActiveTab] = useState("scorer");

  // Sync edited assumptions when loaded
  useEffect(() => {
    if (assumptions && !editedAssumptions) {
      setEditedAssumptions(JSON.parse(JSON.stringify(assumptions)));
    }
  }, [assumptions, editedAssumptions]);

  // Handle timeline play animation
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedMonth((prev) => (prev >= 12 ? 1 : prev + 1));
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, setSelectedMonth]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <ErrorState
        type={error === "network" ? "network" : "default"}
        title={error === "default" ? "Simulation Not Found" : "Error Loading Simulation"}
        onRetry={refetch}
      />
    );
  }

  // Preserve legacy V1 simulations exactly as they were
  if (isLegacy) {
    return <LegacySimulationDetails simulation={simulation} />;
  }

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyAssumptions = async () => {
    if (!editedAssumptions) return;
    try {
      await handleRerun(editedAssumptions);
      toast.success("Simulation re-calculated successfully with updated assumptions!");
      setShowAssumptions(false);
    } catch (err) {
      toast.error(err.message || "Failed to re-run simulation");
    }
  };

  const monthlyList = currentScenarioData?.monthlySimulation || [];
  const isExhausted = summary?.cashExhaustedMonth !== null && summary?.cashExhaustedMonth !== undefined;

  const scoreVal = simulation.score?.overallScore ?? simulation.startupScore ?? simulation.analysis?.startupScore ?? 0;
  const scoreClassification = simulation.score?.classification || (scoreVal >= 80 ? "Strong Investment Candidate" : scoreVal >= 55 ? "Promising" : "Needs Refinement");
  const scoreTone = scoreVal >= 80 ? "green" : scoreVal >= 65 ? "blue" : scoreVal >= 50 ? "yellow" : "red";

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => navigate("/simulations")}
        className="flex items-center gap-1.5 text-sm font-semibold text-brass-700 hover:text-brass-600 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Simulations</span>
      </button>

      {/* V2 Header Dossier */}
      <div className="dossier-card p-6 paper-grain flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-3xl font-bold text-ink-900">{simulation.startupName}</h1>
            {simulation.industry && <Badge tone="blue">{simulation.industry}</Badge>}
            <span className="bg-brass-100 text-brass-900 border border-brass-400 text-[0.7rem] px-2.5 py-0.5 rounded-full font-data font-bold tracking-wide uppercase">
              V2 Deterministic Model
            </span>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant flex items-center gap-2">
            <Calendar size={14} className="text-ink-500" />
            <span>Simulated on {new Date(simulation.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>12-Month Assumption-Driven Growth Engine</span>
          </p>
        </div>

        {/* Action Controls & Readiness Score Rating */}
        <div className="flex flex-wrap items-center gap-4">
          <div
            onClick={() => setActiveTab("scorer")}
            title="Click to view full Readiness Scorer details"
            className="cursor-pointer rounded border border-brass-500/40 bg-ink-900 px-4 py-2 text-center shadow-soft hover:border-brass-400 transition-all flex flex-col justify-center"
          >
            <span className="flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-brass-400">
              <Award size={13} />
              Readiness Score
            </span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="font-data text-xl font-bold text-surface">{scoreVal}/100</span>
              <Badge tone={scoreTone}>{scoreClassification}</Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!editedAssumptions && assumptions) {
                setEditedAssumptions(JSON.parse(JSON.stringify(assumptions)));
              }
              setShowAssumptions(!showAssumptions);
            }}
            className="flex items-center gap-2 border-outline-variant text-ink-900 hover:bg-surface-container-high"
          >
            <Sliders size={16} className="text-brass-600" />
            <span>{showAssumptions ? "Hide Assumptions" : "Calibrate Assumptions"}</span>
          </Button>

          <Link
            to={`/investor-room?simulationId=${simulation._id}`}
            className="wax-seal inline-flex items-center justify-center px-5 py-2.5 text-xs"
          >
            Enter Investor Pitch Room
          </Link>
        </div>
      </div>

      {/* Interactive Assumption Calibration Drawer */}
      {showAssumptions && (
        <div className="bg-surface-container-low border-2 border-brass-500/40 rounded-lg p-6 shadow-card animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-ink-900 flex items-center gap-2">
                <Sliders className="text-brass-600" size={20} />
                <span>Live Assumption Calibration Engine</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Modify any baseline parameter below. Re-running will instantly execute deterministic financial calculations across all 12 months.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditedAssumptions(JSON.parse(JSON.stringify(assumptions)))}
                disabled={rerunning}
                className="text-xs py-1.5 px-3"
              >
                Reset to Original
              </Button>
              <Button
                type="button"
                onClick={handleApplyAssumptions}
                loading={rerunning}
                className="bg-brass-500 hover:bg-brass-600 text-ink-900 font-bold text-xs py-1.5 px-4 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={rerunning ? "animate-spin" : ""} />
                <span>Re-run Simulation</span>
              </Button>
            </div>
          </div>

          <AssumptionsPanel
            assumptions={editedAssumptions}
            onChange={setEditedAssumptions}
            disabled={rerunning}
          />
        </div>
      )}

      {/* Top 12-Month Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg shadow-soft">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
            Total 12M Revenue
          </span>
          <span className="font-data text-xl font-bold text-ink-900">
            {formatCurrency(summary?.totalRevenue)}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg shadow-soft">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
            Total 12M Expenses
          </span>
          <span className="font-data text-xl font-bold text-ink-900">
            {formatCurrency(summary?.totalExpenses)}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg shadow-soft">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
            Final M12 Cash
          </span>
          <span className={`font-data text-xl font-bold ${isExhausted ? "text-burgundy-600" : "text-ink-900"}`}>
            {formatCurrency(summary?.finalEndingCash)}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg shadow-soft">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
            Break-Even Status
          </span>
          <span className="font-data text-base font-bold text-ink-900">
            {summary?.breakEvenMonth ? `Achieved in Month ${summary.breakEvenMonth}` : "Not in first 12 mos"}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg shadow-soft col-span-2 sm:col-span-1">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
            Survival Outlook
          </span>
          <span className={`font-data text-sm font-bold flex items-center gap-1.5 ${
            isExhausted ? "text-burgundy-600" : "text-ink-700"
          }`}>
            {isExhausted ? (
              <>
                <AlertTriangle size={16} />
                <span>Exhausted M{summary.cashExhaustedMonth}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="text-brass-600" />
                <span>Survived 12 Months</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Warnings & Alerts */}
      <WarningsBanner warnings={warnings} />

      {/* Tab Switcher: Readiness Scorer vs 12-Month Timeline */}
      <div className="flex border-b border-outline-variant gap-6 pt-2">
        <button
          onClick={() => setActiveTab("scorer")}
          className={`flex items-center gap-2 pb-3 font-headline text-base font-bold transition-colors relative ${
            activeTab === "scorer"
              ? "text-brass-600"
              : "text-on-surface-variant hover:text-ink-900"
          }`}
        >
          <Award size={18} />
          <span>Startup Readiness Scorer</span>
          {activeTab === "scorer" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass-600 rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 pb-3 font-headline text-base font-bold transition-colors relative ${
            activeTab === "timeline"
              ? "text-brass-600"
              : "text-on-surface-variant hover:text-ink-900"
          }`}
        >
          <TrendingUp size={18} />
          <span>12-Month Growth Simulation</span>
          {activeTab === "timeline" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass-600 rounded-t" />
          )}
        </button>
      </div>

      {activeTab === "scorer" ? (
        <StartupScorerDashboard scoreData={simulation.score} startupName={simulation.startupName} />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Scenario Switcher */}
          <ScenarioToggle
            activeScenario={activeScenario}
            onChange={(scen) => {
              setActiveScenario(scen);
              setIsPlaying(false);
            }}
            scenarios={simulation.scenarios || {}}
          />

          {/* Interactive Timeline Scrubber */}
          <TimelineScrubber
            selectedMonth={selectedMonth}
            onChange={(m) => {
              setSelectedMonth(m);
              setIsPlaying(false);
            }}
            monthlyData={monthlyList}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />

          {/* Selected Month Snapshot Details */}
          <MonthSnapshot monthData={selectedMonthData} />

          {/* 12-Month Interactive Visualizations */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-brass-600" size={20} />
              <h2 className="font-headline text-xl font-bold text-ink-900">
                12-Month Financial & Operational Trajectories ({activeScenario.toUpperCase()})
              </h2>
            </div>
            <SimulationCharts monthlyData={monthlyList} />
          </div>
        </div>
      )}

      {/* Startup Overview Refresher */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-soft mt-8">
        <h3 className="font-headline text-lg font-bold text-ink-900 mb-4 pb-2 border-b border-outline-variant flex items-center gap-2">
          <Building2 size={18} className="text-ink-600" />
          <span>Original Startup Hypothesis</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 block mb-1">Idea & Solution</span>
            <p className="text-ink-900 leading-relaxed whitespace-pre-line">{simulation.idea}</p>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 block mb-1">Target Audience</span>
              <p className="text-ink-900">{simulation.targetAudience || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 block mb-1">Business & Revenue Model</span>
              <p className="text-ink-900">{simulation.businessModel || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
