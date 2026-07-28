const app = require("../src/app");
const connectDB = require("../src/database/connectDB");

module.exports = async (req, res) => {
  try {
    await connectDB(); // cached — near-instant after the first cold start
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }

  return app(req, res);
};
