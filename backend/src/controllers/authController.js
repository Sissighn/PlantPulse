const authService = require("../services/authService");
const {
  authCookieOptions,
  clearAuthCookie,
} = require("../middleware/auth");

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
    const user = await authService.register(req.body, req.user);
    sendSession(res, user, 201);
  } catch (error) {
    sendAuthError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    sendSession(res, user);
  } catch (error) {
    sendAuthError(res, error);
  }
};

exports.createGuest = async (req, res) => {
  try {
    if (req.user) {
      sendSession(res, req.user);
      return;
    }

    const user = await authService.createGuest();
    sendSession(res, user, 201);
  } catch (error) {
    sendAuthError(res, error);
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
};
