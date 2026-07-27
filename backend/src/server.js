const app = require("./app");
const env = require("./config/env");
const connectDB = require("./database/connectDB");
const { verifyModelAtBoot } = require("./services/gemini.service");

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