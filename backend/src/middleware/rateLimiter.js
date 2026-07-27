const ApiError = require("../utils/ApiError");

const windowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100;
const requests = new Map();

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(key);
    }
  }
}, windowMs).unref();

/**
 * AI Rate Limiter Middleware
 *
 * Enforces a sliding window limit of 100 requests per 15 minutes per user or IP.
 */
const aiRateLimiter = (req, res, next) => {
  const key = req.user ? req.user._id.toString() : (req.ip || "unknown");
  const now = Date.now();

  if (!requests.has(key)) {
    requests.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = requests.get(key);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  if (record.count >= maxRequests) {
    res.setHeader("Retry-After", Math.ceil((record.resetTime - now) / 1000));
    return next(
      new ApiError(429, "Too many AI simulation requests. Limit is 100 requests per 15 minutes.")
    );
  }

  record.count += 1;
  next();
};

module.exports = { aiRateLimiter };
