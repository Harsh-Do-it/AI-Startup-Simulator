import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { PlusCircle, Sparkles } from "lucide-react";
import SimulationCard from "../components/simulation/SimulationCard.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Button from "../components/ui/Button.jsx";
import simulationService from "../services/simulationService.js";

export default function MySimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSimulations = async () => {
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
    fetchSimulations();
  }, []);

  const remove = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await simulationService.deleteSimulation(target._id);
      setSimulations((previous) => previous.filter((s) => s._id !== target._id));
      toast.success("Simulation deleted");
      setTarget(null);
    } catch {
      toast.error("Failed to delete simulation");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900">My Simulations</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            All your AI-generated startup evaluations in one place.
          </p>
        </div>
        <Link to="/simulations/new">
          <Button variant="primary" className="gap-2">
            <PlusCircle size={16} />
            New Simulation
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState type={error} onRetry={fetchSimulations} />
      ) : simulations.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {simulations.map((s) => (
            <SimulationCard
              key={s._id}
              simulation={s}
              onDeleteClick={setTarget}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No simulations yet"
          description="Run your first AI startup simulation to get a venture-capital grade analysis."
          action={
            <Link to="/simulations/new">
              <Button variant="primary">New Simulation</Button>
            </Link>
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this simulation?"
        description={`"${target?.startupName}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
