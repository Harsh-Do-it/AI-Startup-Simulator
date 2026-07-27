const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const SimulationJob = require("../models/simulationJob.model");
const {
  validateSimulationInput,
  validateAssumptions,
  validateExtractInput,
} = require("../validators/simulation.validator");
const {
  runLegacySimulation,
  extractAssumptions,
  runFullSimulation,
  rerunSimulation,
  getUserSimulations,
  getSimulationById,
  deleteSimulationById,
} = require("../services/simulation.service");

// ─── V2: Extract Assumptions from Idea ───────────────────────────────────────

const extractStartupAssumptions = asyncHandler(async (req, res) => {
  const { startupName, idea } = req.body;
  validateExtractInput(req.body);

  const assumptions = await extractAssumptions({ startupName, idea });

  res
    .status(200)
    .json(new ApiResponse(200, assumptions, "Assumptions extracted successfully"));
});

// ─── V2: Run Full Simulation ─────────────────────────────────────────────────

const createV2Simulation = asyncHandler(async (req, res) => {
  const { startupName, idea, assumptions } = req.body;

  if (!startupName || !String(startupName).trim()) {
    throw new ApiError(400, "startupName is required");
  }
  if (!idea || !String(idea).trim()) {
    throw new ApiError(400, "idea is required");
  }

  validateAssumptions(assumptions);

  const simulation = await runFullSimulation(req.user._id, startupName, idea, assumptions);

  res
    .status(201)
    .json(new ApiResponse(201, simulation, "Simulation completed successfully"));
});

// ─── V2: Re-run with Updated Assumptions ─────────────────────────────────────

const rerunExistingSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid simulation id");
  }

  const { assumptions } = req.body;
  validateAssumptions(assumptions);

  const simulation = await rerunSimulation(req.user._id, id, assumptions);

  res
    .status(200)
    .json(new ApiResponse(200, simulation, "Simulation re-run completed successfully"));
});

// ─── V2: Async Simulation & Polling ──────────────────────────────────────────

const runAsyncSimulation = asyncHandler(async (req, res) => {
  const { startupName, idea, assumptions } = req.body;
  const idempotencyKey = req.headers["idempotency-key"] || null;

  if (!startupName || !String(startupName).trim()) {
    throw new ApiError(400, "startupName is required");
  }
  if (!idea || !String(idea).trim()) {
    throw new ApiError(400, "idea is required");
  }
  validateAssumptions(assumptions);

  if (idempotencyKey) {
    const existingJob = await SimulationJob.findOne({ idempotencyKey, user: req.user._id });
    if (existingJob) {
      if (existingJob.status === "completed") {
        return res
          .status(200)
          .json(new ApiResponse(200, existingJob, "Job already completed (idempotent)"));
      }
      if (existingJob.status === "pending" || existingJob.status === "processing") {
        return res
          .status(202)
          .json(new ApiResponse(202, existingJob, "Job is currently processing (idempotent)"));
      }
    }
  }

  const job = await SimulationJob.create({
    user: req.user._id,
    idempotencyKey,
    status: "pending",
    progress: 10,
    inputPayload: { startupName, idea, assumptions },
  });

  // Execute background job without blocking response
  (async () => {
    try {
      await SimulationJob.findOneAndUpdate({ jobId: job.jobId }, { status: "processing", progress: 30 });
      const simulation = await runFullSimulation(req.user._id, startupName, idea, assumptions);
      await SimulationJob.findOneAndUpdate({
        jobId: job.jobId,
      }, {
        status: "completed",
        progress: 100,
        result: simulation._id,
      });
    } catch (err) {
      console.error(`[AsyncSimulation] Job ${job.jobId} failed:`, err.message);
      await SimulationJob.findOneAndUpdate({
        jobId: job.jobId,
      }, {
        status: "failed",
        progress: 100,
        error: err.message || "Simulation failed during execution",
      });
    }
  })();

  res
    .status(202)
    .json(new ApiResponse(202, job, "Simulation job accepted for asynchronous execution"));
});

const getSimulationJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await SimulationJob.findOne({ jobId, user: req.user._id }).populate("result");
  if (!job) {
    throw new ApiError(404, "Simulation job not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, job, "Job status fetched successfully"));
});

// ─── V1 Legacy: Create Simulation ────────────────────────────────────────────

const createSimulation = asyncHandler(async (req, res) => {
  const {
    startupName,
    idea,
    industry,
    targetAudience,
    businessModel,
    pricing,
    problemStatement,
    uniqueSellingProposition,
  } = req.body;

  validateSimulationInput(req.body);

  const simulation = await runLegacySimulation(req.user._id, {
    startupName,
    idea,
    industry,
    targetAudience,
    businessModel,
    pricing,
    problemStatement,
    uniqueSellingProposition,
  });

  res
    .status(201)
    .json(new ApiResponse(201, simulation, "Simulation completed successfully"));
});

// ─── Common CRUD ─────────────────────────────────────────────────────────────

const listSimulations = asyncHandler(async (req, res) => {
  const simulations = await getUserSimulations(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, simulations, "Simulations fetched successfully"));
});

const getSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid simulation id");
  }

  const simulation = await getSimulationById(req.user._id, id);

  res
    .status(200)
    .json(new ApiResponse(200, simulation, "Simulation fetched successfully"));
});

const deleteSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid simulation id");
  }

  await deleteSimulationById(req.user._id, id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Simulation deleted successfully"));
});

module.exports = {
  extractStartupAssumptions,
  createV2Simulation,
  rerunExistingSimulation,
  runAsyncSimulation,
  getSimulationJobStatus,
  createSimulation,
  listSimulations,
  getSimulation,
  deleteSimulation,
};