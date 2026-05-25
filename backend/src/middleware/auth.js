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

function clearAuthCookie(res) {
  res.clearCookie(authConfig.cookieName, authCookieOptions(0));
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

function isSameOrigin(origin, req) {
  return origin === `${req.protocol}://${req.get("host")}`;
}

function requireTrustedOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
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

module.exports = {
  authCookieOptions,
  clearAuthCookie,
  optionalAuth,
  requireAuth,
  requireTrustedOrigin,
};
