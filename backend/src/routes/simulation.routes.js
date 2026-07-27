const express = require("express");
const {
  extractStartupAssumptions,
  createV2Simulation,
  rerunExistingSimulation,
  runAsyncSimulation,
  getSimulationJobStatus,
  createSimulation,
  listSimulations,
  getSimulation,
  deleteSimulation,
} = require("../controllers/simulation.controller");
const { protect } = require("../middleware/auth.middleware");
const { aiRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(protect);

// V2 Engine-based simulation routes
router.post("/extract", aiRateLimiter, extractStartupAssumptions);
router.post("/v2", aiRateLimiter, createV2Simulation);
router.post("/run-async", aiRateLimiter, runAsyncSimulation);
router.get("/jobs/:jobId", getSimulationJobStatus);
router.put("/:id/rerun", aiRateLimiter, rerunExistingSimulation);

// V1 Legacy + shared CRUD
router.post("/", aiRateLimiter, createSimulation);
router.get("/", listSimulations);
router.get("/:id", getSimulation);
router.delete("/:id", deleteSimulation);

module.exports = router;