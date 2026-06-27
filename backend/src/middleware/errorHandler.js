const multer = require("multer");
const { z } = require("zod");
const { formatValidationError } = require("../validation/requestSchemas");

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createHttpError(status, message, options = {}) {
  const error = new Error(message);
  error.status = status;
  error.expose = options.expose ?? status < 500;
  return error;
}

function notFoundHandler(req, res, next) {
  next(createHttpError(404, "Route not found."));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({ message: formatValidationError(error) });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "Uploaded image must be 5 MB or smaller." });
      return;
    }

    res.status(400).json({ message: error.message || "Invalid upload." });
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message =
    error.expose || status < 500
      ? error.message
      : "An unexpected error occurred.";

  if (status >= 500) {
    console.error("Unhandled request error:", error);
  }

  res.status(status).json({ message });
}

module.exports = {
  asyncHandler,
  createHttpError,
  errorHandler,
  notFoundHandler,
};
