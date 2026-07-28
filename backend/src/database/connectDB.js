const mongoose = require("mongoose");
const env = require("../config/env");

// Reuse the connection across serverless invocations (Vercel keeps
// the module scope alive between warm invocations of the same instance)
let cached = global.mongooseConn;
if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false, // fail fast instead of buffering for 10s
      })
      .then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // allow the next request to retry
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
