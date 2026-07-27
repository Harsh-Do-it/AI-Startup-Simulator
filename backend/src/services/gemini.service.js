const { GoogleGenAI } = require("@google/genai");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const requestTimeoutMs = 30000;

const fallbackModels = [
  env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
].filter((model, index, models) => model && models.indexOf(model) === index);

const getErrorMessage = (error) => {
  if (!error?.message) {
    return "Unknown Gemini error";
  }

  try {
    return JSON.parse(error.message)?.error?.message || error.message;
  } catch {
    return error.message;
  }
};

const logGeminiError = (model, error) => {
  console.error("[Gemini] generateContent failed", {
    model,
    status: error.status,
    message: getErrorMessage(error),
  });
};

const shouldTryNextModel = (error) => {
  return [404, 429, 500, 502, 503, 504].includes(error.status);
};

const verifyModelAtBoot = async () => {
  if (!env.GEMINI_API_KEY || env.NODE_ENV === "test") {
    console.log("[Gemini] Skipping live boot verification in test/unconfigured environment.");
    return true;
  }
  try {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: { timeout: 10000 },
    });
    await genAI.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: "test",
    });
    console.log(`[Gemini] Boot verification successful for model: ${env.GEMINI_MODEL}`);
    return true;
  } catch (error) {
    const msg = getErrorMessage(error) || "";
    if (error?.status === 404 || error?.status === 400 || msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("deprecated") || msg.toLowerCase().includes("unsupported")) {
      console.error(`[CRITICAL BOOT ERROR] Configured Gemini model '${env.GEMINI_MODEL}' returned 404/deprecated response from Google API. Server cannot boot with invalid AI model.`);
      throw new Error(`[CRITICAL BOOT ERROR] Model ${env.GEMINI_MODEL} is invalid or deprecated: ${msg}`);
    }
    console.warn(`[Gemini] Boot check encountered non-fatal error (${error?.status || 'network'}): ${msg}`);
    return true;
  }
};

const generateContent = async (prompt) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(500, "GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: { timeout: requestTimeoutMs },
  });
  let lastError;

  for (const model of fallbackModels) {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      const responseText = response?.text;

      if (!responseText) {
        throw new ApiError(502, "AI service returned an empty response");
      }

      return responseText;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      lastError = error;
      logGeminiError(model, error);

      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }

  const statusCode = lastError?.status === 429 ? 429 : 502;
  const message =
    lastError?.status === 429
      ? "AI service quota exceeded"
      : "Failed to communicate with AI service";

  throw new ApiError(statusCode, message, [
    {
      service: "gemini",
      status: lastError?.status,
      message: getErrorMessage(lastError),
    },
  ]);
};

module.exports = { generateContent, verifyModelAtBoot, fallbackModels };
