const mongoose = require("mongoose");
const crypto = require("crypto");

const simulationJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    inputPayload: {
      startupName: String,
      idea: String,
      assumptions: mongoose.Schema.Types.Mixed,
    },
    result: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Simulation",
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SimulationJob", simulationJobSchema);
