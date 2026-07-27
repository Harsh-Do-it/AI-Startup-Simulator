import { useState, useEffect, useCallback, useMemo } from "react";
import simulationService from "../services/simulationService";

export const useSimulationDashboard = (simulationId) => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rerunning, setRerunning] = useState(false);

  // Dashboard interactive state
  const [activeScenario, setActiveScenario] = useState("realistic"); // 'pessimistic' | 'realistic' | 'optimistic'
  const [selectedMonth, setSelectedMonth] = useState(1); // 1 to 12

  const fetchSimulation = useCallback(async () => {
    if (!simulationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await simulationService.getSimulationById(simulationId);
      const data = res.data || res;
      setSimulation(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load simulation details");
    } finally {
      setLoading(false);
    }
  }, [simulationId]);

  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  const handleRerun = async (updatedAssumptions) => {
    setRerunning(true);
    setError(null);
    try {
      const res = await simulationService.rerunSimulation(simulationId, updatedAssumptions);
      const updatedData = res.data || res;
      setSimulation(updatedData);
      return updatedData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to re-run simulation";
      setError(msg);
      throw new Error(msg);
    } finally {
      setRerunning(false);
    }
  };

  const isLegacy = useMemo(() => {
    if (!simulation) return false;
    return simulation.version !== 2;
  }, [simulation]);

  const currentScenarioData = useMemo(() => {
    if (!simulation || isLegacy) return null;
    // Fallback to top-level fields if scenario isn't found for some reason
    return simulation.scenarios?.[activeScenario] || {
      monthlySimulation: simulation.monthlySimulation || [],
      summary: simulation.summary || {},
      warnings: simulation.warnings || [],
    };
  }, [simulation, isLegacy, activeScenario]);

  const selectedMonthData = useMemo(() => {
    if (!currentScenarioData?.monthlySimulation) return null;
    return (
      currentScenarioData.monthlySimulation.find((m) => m.month === selectedMonth) ||
      currentScenarioData.monthlySimulation[0] ||
      null
    );
  }, [currentScenarioData, selectedMonth]);

  return {
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
    summary: currentScenarioData?.summary || simulation?.summary || null,
    warnings: currentScenarioData?.warnings || simulation?.warnings || [],
    qualitative: simulation?.qualitative || null,
    assumptions: simulation?.assumptions || null,
    handleRerun,
    refetch: fetchSimulation,
  };
};

export default useSimulationDashboard;
