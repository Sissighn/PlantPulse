const authService = require("../services/authService");
const {
  authCookieOptions,
  clearAuthCookie,
  clearCsrfCookie,
  setCsrfCookie,
} = require("../middleware/auth");
const { createHttpError } = require("../middleware/errorHandler");

function sendSession(res, user, status = 200) {
  res.cookie(
    require("../config/auth").cookieName,
    authService.createToken(user),
    authCookieOptions()
  );
  setCsrfCookie(res);
  res.status(status).json({ user: authService.publicUser(user) });
}

exports.getSession = (req, res) => {
  if (!req.user) {
    throw createHttpError(401, "No active session.");
  }

  setCsrfCookie(res);
  res.json({ user: authService.publicUser(req.user) });
};

exports.register = async (req, res) => {
  const user = await authService.register(req.body, req.user);
  sendSession(res, user, 201);
};

exports.login = async (req, res) => {
  const user = await authService.login(req.body);
  sendSession(res, user);
};

exports.createGuest = async (req, res) => {
  if (req.user) {
    sendSession(res, req.user);
    return;
  }

  const user = await authService.createGuest();
  sendSession(res, user, 201);
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.status(204).send();
};
