import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Rocket, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import simulationService from "../services/simulationService";
import AssumptionsPanel from "../components/simulation/AssumptionsPanel";

export default function NewSimulationPage() {
  const [step, setStep] = useState(1); // 1 = Idea Input, 2 = Review Assumptions
  const [startupName, setStartupName] = useState("");
  const [idea, setIdea] = useState("");
  const [assumptions, setAssumptions] = useState(null);
  
  const [extracting, setExtracting] = useState(false);
  const [running, setRunning] = useState(false);
  
  const navigate = useNavigate();

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!startupName.trim()) {
      toast.error("Please enter a startup name");
      return;
    }
    if (!idea.trim() || idea.trim().length < 20) {
      toast.error("Please describe your startup idea in more detail (at least 20 characters)");
      return;
    }

    setExtracting(true);
    try {
      const res = await simulationService.extractAssumptions({
        startupName: startupName.trim(),
        idea: idea.trim(),
      });
      const extractedData = res.data || res;
      setAssumptions(extractedData);
      setStep(2);
      toast.success("Assumptions extracted successfully! Review and tweak them below.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to extract assumptions. Please try again."
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!assumptions) return;

    setRunning(true);
    try {
      const res = await simulationService.createV2Simulation({
        startupName: startupName.trim(),
        idea: idea.trim(),
        assumptions,
      });
      const simulation = res.data || res;
      toast.success("12-Month simulation completed successfully!");
      navigate(`/simulations/${simulation._id}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to run simulation. Please verify your assumptions."
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brass-700 mb-2">
          <span>Step {step} of 2</span>
          <span>•</span>
          <span>{step === 1 ? "Idea Definition" : "Assumption Calibration"}</span>
        </div>
        <h1 className="font-headline text-3xl font-bold text-ink-900">
          {step === 1 ? "Define Your Startup Idea" : "Review & Calibrate Assumptions"}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {step === 1
            ? "Describe your concept, problem, solution, and pricing. Our AI will extract initial baseline financial assumptions."
            : "Review the assumptions extracted by AI. Every number in your 12-month projection will be calculated deterministically from these values."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleExtract}
            className="dossier-card space-y-6 p-6 sm:p-8 paper-grain"
          >
            <div>
              <label htmlFor="startupName" className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1">
                Startup Name
              </label>
              <input
                id="startupName"
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g. FitAI Studio, NextGen SaaS, Acme Health"
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-medium text-ink-900 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
                required
              />
            </div>

            <div>
              <label htmlFor="idea" className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1">
                Detailed Startup Description & Pitch
              </label>
              <textarea
                id="idea"
                rows={8}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your problem, solution, target customer, pricing model, initial capital, and competitive landscape... e.g. We are building an AI-powered fitness coach app for busy professionals. We plan to charge $15/month subscription. We are starting with $50,000 in savings and aim to launch our MVP in month 2..."
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-3 text-sm font-medium text-ink-900 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
                required
              />
              <p className="mt-1.5 text-xs text-ink-500 italic">
                Tip: The more details you provide about your pricing, starting capital, and target market, the more accurate the extracted baseline assumptions will be.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={extracting}
              className="mt-4 bg-ink-900 hover:bg-ink-800 text-surface py-3 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} className="text-brass-300" />
              <span>Extract Business Assumptions</span>
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Info Box */}
            <div className="bg-brass-50 border border-brass-300 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="text-brass-700 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-brass-900 leading-relaxed">
                <span className="font-bold">Transparent Deterministic Engine:</span> We have categorized each assumption below as either{" "}
                <span className="badge-extracted">Extracted</span> from your text or supplied as a conservative{" "}
                <span className="badge-default">Default</span>. You can modify any value. Your 12-month simulation will be calculated using pure financial math without arbitrary AI hallucination.
              </div>
            </div>

            <AssumptionsPanel
              assumptions={assumptions}
              onChange={setAssumptions}
              disabled={running}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={running}
                className="flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900 transition py-2 px-4 rounded hover:bg-surface-container-high"
              >
                <ArrowLeft size={16} />
                <span>Back to Idea Description</span>
              </button>

              <Button
                type="button"
                onClick={handleRunSimulation}
                loading={running}
                className="bg-brass-500 hover:bg-brass-600 text-ink-900 font-bold px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 shadow-card"
              >
                <Rocket size={18} />
                <span>Run 12-Month Simulation</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
