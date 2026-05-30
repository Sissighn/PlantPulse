const { z } = require("zod");

const trimmedString = (maxLength) =>
  z.string().trim().min(1).max(maxLength);

const emptyBodySchema = z.object({}).strict();

const authRegisterSchema = z
  .object({
    displayName: z.string().trim().max(60).optional().nullable(),
    email: z.string().trim().email().max(254),
    password: z.string().min(15).max(128),
  })
  .strict();

const authLoginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

const plantCreateSchema = z
  .object({
    baseInterval: z.coerce.number().int().min(1).max(365).optional(),
    name: trimmedString(80),
    type: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

const uuidParamSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

const tipsQuerySchema = z
  .object({
    name: trimmedString(120),
    season: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
  })
  .strict();

const plantBookSearchQuerySchema = z
  .object({
    lang: z.enum(["de", "en"]).optional(),
    limit: z.coerce.number().int().min(1).max(30).optional(),
    q: trimmedString(120),
  })
  .strict();

const plantBookDetailSchema = z
  .object({
    lang: z.enum(["de", "en"]).optional(),
  })
  .strict();

const plantBookParamSchema = z
  .object({
    pid: z.string().trim().min(1).max(120),
  })
  .strict();

const chatHistorySchema = z
  .array(
    z
      .object({
        parts: z
          .array(
            z
              .object({
                text: z.string().max(2000),
              })
              .strict()
          )
          .min(1)
          .max(4),
        role: z.enum(["user", "model"]),
      })
      .strict()
  )
  .max(20);

const chatBodySchema = z
  .object({
    history: z.string().optional(),
    message: z.string().trim().max(2000).optional().default(""),
  })
  .strict();

function formatValidationError(error) {
  const detail = error.issues?.[0];
  if (!detail) return "Invalid request.";

  const path = detail.path.length ? detail.path.join(".") : "request";
  return `${path}: ${detail.message}`;
}

function parseJsonField(value, schema, fieldName) {
  if (value === undefined || value === null || value === "") return undefined;

  try {
    return schema.parse(JSON.parse(value));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Invalid JSON.",
          path: [fieldName],
        },
      ]);
    }
    throw error;
  }
}

module.exports = {
  authLoginSchema,
  authRegisterSchema,
  chatBodySchema,
  chatHistorySchema,
  emptyBodySchema,
  formatValidationError,
  parseJsonField,
  plantBookDetailSchema,
  plantBookParamSchema,
  plantBookSearchQuerySchema,
  plantCreateSchema,
  tipsQuerySchema,
  uuidParamSchema,
};
