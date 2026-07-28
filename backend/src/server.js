const app = require("./app");
const env = require("./config/env");
const connectDB = require("./database/connectDB");
const { verifyModelAtBoot } = require("./services/gemini.service");

// This file only runs when you start the backend directly with
// `node src/server.js` (local development). On Vercel, the entry
// point is backend/api/index.js instead — Vercel never executes
// this block, so app.listen() being unused there is expected.
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
      await verifyModelAtBoot();

      app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      });
    } catch (err) {
      console.error(`[CRITICAL BOOT ERROR] Server startup aborted: ${err.message}`);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
