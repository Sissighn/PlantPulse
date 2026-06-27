const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");
const db = require("../db/database");

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return cookies;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!name) return cookies;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch (error) {
      cookies[name] = value;
    }

    return cookies;
  }, {});
}

function authCookieOptions(maxAge = authConfig.tokenTtlSeconds * 1000) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: authConfig.cookieSecure,
  };
}

function csrfCookieOptions(maxAge = authConfig.tokenTtlSeconds * 1000) {
  return {
    httpOnly: false,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: authConfig.cookieSecure,
  };
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function setCsrfCookie(res, token = createCsrfToken()) {
  res.cookie(authConfig.csrfCookieName, token, csrfCookieOptions());
  return token;
}

function clearAuthCookie(res) {
  res.clearCookie(authConfig.cookieName, authCookieOptions(0));
}

function clearCsrfCookie(res) {
  res.clearCookie(authConfig.csrfCookieName, csrfCookieOptions(0));
}

async function optionalAuth(req, res, next) {
  const token = parseCookies(req.headers.cookie)[authConfig.cookieName];
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, authConfig.jwtSecret, {
      algorithms: ["HS256"],
      audience: authConfig.audience,
      issuer: authConfig.issuer,
    });
    const user = await db.findUserById(payload.sub);

    if (!user || user.accountType !== payload.kind) {
      clearAuthCookie(res);
      next();
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    clearAuthCookie(res);
    next();
  }
}

function requireAuth(req, res, next) {
  if (req.user) {
    next();
    return;
  }

  res.status(401).json({ message: "Authentication required." });
}

function isSafeMethod(method) {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
}

function isSameOrigin(origin, req) {
  return origin === `${req.protocol}://${req.get("host")}`;
}

function requireTrustedOrigin(req, res, next) {
  if (isSafeMethod(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (
    !origin ||
    authConfig.allowedOrigins.includes(origin) ||
    isSameOrigin(origin, req)
  ) {
    next();
    return;
  }

  res.status(403).json({ message: "Origin not allowed." });
}

function isSessionCreationPath(req) {
  return (
    req.path === "/auth/login" ||
    req.path === "/auth/register" ||
    req.path === "/auth/guest"
  );
}

function requireCsrfToken(req, res, next) {
  if (isSafeMethod(req.method) || isSessionCreationPath(req) || !req.user) {
    next();
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const csrfCookie = cookies[authConfig.csrfCookieName];
  const csrfHeader = req.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    res.status(403).json({ message: "Invalid CSRF token." });
    return;
  }

  next();
}

module.exports = {
  authCookieOptions,
  clearCsrfCookie,
  clearAuthCookie,
  createCsrfToken,
  csrfCookieOptions,
  optionalAuth,
  parseCookies,
  requireAuth,
  requireCsrfToken,
  requireTrustedOrigin,
  setCsrfCookie,
};
