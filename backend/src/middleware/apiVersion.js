const ApiError = require("../utils/ApiError");

/**
 * API Version Middleware
 *
 * Attaches canonical X-API-Version header to all responses and enforces
 * version compatibility if client sends an incompatible version request header.
 */
const apiVersion = (req, res, next) => {
  res.setHeader("X-API-Version", "2.2.0");

  const clientVersion = req.headers["x-api-version"] || req.headers["x-api-ver"];
  if (clientVersion && !clientVersion.toString().startsWith("2.")) {
    return next(
      new ApiError(
        400,
        `Incompatible X-API-Version header: ${clientVersion}. Server currently supports API v2.x (2.2.0).`
      )
    );
  }

  next();
};

module.exports = apiVersion;
