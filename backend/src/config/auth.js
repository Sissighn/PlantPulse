const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";
const configuredSecret = process.env.JWT_SECRET || "";

if (isProduction && Buffer.byteLength(configuredSecret) < 32) {
  throw new Error("JWT_SECRET must contain at least 32 bytes in production.");
}

const generatedDevelopmentSecret = crypto.randomBytes(32).toString("hex");

if (!configuredSecret && !isProduction) {
  console.warn(
    "JWT_SECRET is missing. Using a temporary development secret; sessions reset when the backend restarts."
  );
}

const configuredOrigins =
  process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "";

const defaultOrigins = [
  "http://localhost",
  "http://127.0.0.1",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

module.exports = {
  audience: "plantpulse-web",
  cookieName: isProduction ? "__Host-plantpulse_auth" : "plantpulse_auth",
  cookieSecure: isProduction,
  issuer: "plantpulse-api",
  jwtSecret: configuredSecret || generatedDevelopmentSecret,
  tokenTtlSeconds: 60 * 60 * 12,
  allowedOrigins: configuredOrigins
    ? configuredOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : defaultOrigins,
};
