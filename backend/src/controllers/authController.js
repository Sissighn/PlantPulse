const authService = require("../services/authService");
const {
  authCookieOptions,
  clearAuthCookie,
} = require("../middleware/auth");
const {
  authLoginSchema,
  authRegisterSchema,
  emptyBodySchema,
  sendValidationError,
} = require("../validation/requestSchemas");

function sendSession(res, user, status = 200) {
  res.cookie(
    require("../config/auth").cookieName,
    authService.createToken(user),
    authCookieOptions()
  );
  res.status(status).json({ user: authService.publicUser(user) });
}

function sendAuthError(res, error) {
  if (!error.status) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Authentication failed." });
    return;
  }

  res.status(error.status).json({ message: error.message });
}

exports.getSession = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "No active session." });
    return;
  }

  res.json({ user: authService.publicUser(req.user) });
};

exports.register = async (req, res) => {
  try {
    const body = authRegisterSchema.parse(req.body || {});
    const user = await authService.register(body, req.user);
    sendSession(res, user, 201);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    sendAuthError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const body = authLoginSchema.parse(req.body || {});
    const user = await authService.login(body);
    sendSession(res, user);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    sendAuthError(res, error);
  }
};

exports.createGuest = async (req, res) => {
  try {
    emptyBodySchema.parse(req.body || {});

    if (req.user) {
      sendSession(res, req.user);
      return;
    }

    const user = await authService.createGuest();
    sendSession(res, user, 201);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    sendAuthError(res, error);
  }
};

exports.logout = (req, res) => {
  try {
    emptyBodySchema.parse(req.body || {});
    clearAuthCookie(res);
    res.status(204).send();
  } catch (error) {
    if (sendValidationError(res, error)) return;
    sendAuthError(res, error);
  }
};
