const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const simulationRoutes = require("./simulation.routes");
const investorRoutes = require("./investor.routes");
const apiVersion = require("../middleware/apiVersion");

const router = express.Router();

router.use(apiVersion);

const coreRoutes = express.Router();
coreRoutes.use("/", healthRoutes);
coreRoutes.use("/auth", authRoutes);
coreRoutes.use("/simulations", simulationRoutes);
coreRoutes.use("/investor", investorRoutes);

router.use("/v2", coreRoutes);
router.use("/", coreRoutes);

module.exports = router;