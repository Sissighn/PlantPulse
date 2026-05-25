const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");
const db = require("../db/database");

const scrypt = promisify(crypto.scrypt);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_MIN_LENGTH = 15;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, p: 1, r: 8, maxmem: 64 * 1024 * 1024 };
const DUMMY_SALT = "plantpulse-invalid-user";

function authError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeDisplayName(displayName) {
  const value = String(displayName || "").trim();
  return value ? value.slice(0, 60) : null;
}

function validateCredentials(email, password) {
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    throw authError("Enter a valid email address.");
  }

  if (
    typeof password !== "string" ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    throw authError(
      `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long.`
    );
  }
}

async function derivePassword(password, salt) {
  return scrypt(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS);
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = await derivePassword(password, salt);

  return [
    "scrypt",
    SCRYPT_OPTIONS.N,
    SCRYPT_OPTIONS.r,
    SCRYPT_OPTIONS.p,
    salt,
    Buffer.from(derived).toString("base64url"),
  ].join("$");
}

function readHash(passwordHash) {
  const [algorithm, n, r, p, salt, encodedHash] = String(
    passwordHash || ""
  ).split("$");

  if (
    algorithm !== "scrypt" ||
    Number(n) !== SCRYPT_OPTIONS.N ||
    Number(r) !== SCRYPT_OPTIONS.r ||
    Number(p) !== SCRYPT_OPTIONS.p ||
    !salt ||
    !encodedHash
  ) {
    return null;
  }

  return { salt, hash: Buffer.from(encodedHash, "base64url") };
}

async function verifyPassword(password, passwordHash) {
  const parsed = readHash(passwordHash);
  const salt = parsed?.salt || DUMMY_SALT;
  const expected = parsed?.hash || Buffer.alloc(SCRYPT_KEY_LENGTH);
  const derived = Buffer.from(await derivePassword(String(password || ""), salt));

  return (
    expected.length === derived.length &&
    crypto.timingSafeEqual(expected, derived) &&
    Boolean(parsed)
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isGuest: user.accountType === "guest",
  };
}

function createToken(user) {
  return jwt.sign(
    {
      kind: user.accountType,
    },
    authConfig.jwtSecret,
    {
      algorithm: "HS256",
      audience: authConfig.audience,
      expiresIn: authConfig.tokenTtlSeconds,
      issuer: authConfig.issuer,
      subject: user.id,
    }
  );
}

async function register(details, currentUser) {
  const email = normalizeEmail(details.email);
  validateCredentials(email, details.password);

  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    throw authError("An account already exists for this email.", 409);
  }

  const passwordHash = await hashPassword(details.password);
  const userDetails = {
    email,
    passwordHash,
    displayName: normalizeDisplayName(details.displayName),
  };

  if (currentUser?.accountType === "guest") {
    const upgradedUser = await db.upgradeGuestUser(currentUser.id, userDetails);
    if (upgradedUser) return upgradedUser;
  }

  return db.createRegisteredUser({
    id: crypto.randomUUID(),
    ...userDetails,
  });
}

async function login(details) {
  const email = normalizeEmail(details.email);
  const password = details.password;
  const user = await db.findUserByEmail(email);
  const validPassword = await verifyPassword(password, user?.passwordHash);

  if (!user || user.accountType !== "registered" || !validPassword) {
    throw authError("Invalid email or password.", 401);
  }

  return user;
}

async function createGuest() {
  return db.createGuestUser(crypto.randomUUID());
}

module.exports = {
  createGuest,
  createToken,
  hashPassword,
  login,
  publicUser,
  register,
  verifyPassword,
};
