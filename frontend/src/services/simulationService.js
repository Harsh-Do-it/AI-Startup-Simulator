import axiosInstance from "./axiosInstance";

// ─── V2 Engine-based Simulation ──────────────────────────────────────────────

const extractAssumptions = async (payload) =>
  (await axiosInstance.post("/simulations/extract", payload)).data;

const createV2Simulation = async (payload) =>
  (await axiosInstance.post("/simulations/v2", payload)).data;

const rerunSimulation = async (id, assumptions) =>
  (await axiosInstance.put(`/simulations/${id}/rerun`, { assumptions })).data;

// ─── V1 Legacy ───────────────────────────────────────────────────────────────

const createSimulation = async (payload) =>
  (await axiosInstance.post("/simulations", payload)).data;

// ─── Common CRUD ─────────────────────────────────────────────────────────────

const getSimulations = async () =>
  (await axiosInstance.get("/simulations")).data;

const getSimulationById = async (id) =>
  (await axiosInstance.get(`/simulations/${id}`)).data;

const deleteSimulation = async (id) =>
  (await axiosInstance.delete(`/simulations/${id}`)).data;

export default {
  extractAssumptions,
  createV2Simulation,
  rerunSimulation,
  createSimulation,
  getSimulations,
  getSimulationById,
  deleteSimulation,
};
