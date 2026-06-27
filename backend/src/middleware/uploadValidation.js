const { createHttpError } = require("./errorHandler");

const MAX_CHAT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CHAT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isJpeg(buffer) {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

function isWebp(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function detectImageMimeType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (isJpeg(buffer)) return "image/jpeg";
  if (isPng(buffer)) return "image/png";
  if (isWebp(buffer)) return "image/webp";
  return null;
}

function chatImageFileFilter(req, file, callback) {
  if (!ALLOWED_CHAT_IMAGE_TYPES.has(file.mimetype)) {
    callback(
      createHttpError(
        400,
        "Only JPEG, PNG, or WebP images can be uploaded."
      )
    );
    return;
  }

  callback(null, true);
}

function validateChatImage(req, res, next) {
  if (!req.file) {
    next();
    return;
  }

  const detectedMimeType = detectImageMimeType(req.file.buffer);
  if (!detectedMimeType) {
    next(createHttpError(400, "The uploaded file is not a valid image."));
    return;
  }

  if (detectedMimeType !== req.file.mimetype) {
    next(
      createHttpError(
        400,
        "The uploaded image type does not match the file contents."
      )
    );
    return;
  }

  next();
}

module.exports = {
  ALLOWED_CHAT_IMAGE_TYPES,
  MAX_CHAT_IMAGE_SIZE_BYTES,
  chatImageFileFilter,
  detectImageMimeType,
  validateChatImage,
};
