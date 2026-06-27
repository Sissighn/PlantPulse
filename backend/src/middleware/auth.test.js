import { describe, expect, it, vi } from "vitest";

const authConfig = require("../config/auth");
const { requireCsrfToken } = require("./auth");

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

function createRequest({
  cookieToken,
  headerToken,
  method = "POST",
  path = "/plants",
  user = { id: "user-1" },
} = {}) {
  return {
    get: vi.fn((name) =>
      name.toLowerCase() === "x-csrf-token" ? headerToken : undefined
    ),
    headers: {
      cookie: cookieToken
        ? `${authConfig.csrfCookieName}=${encodeURIComponent(cookieToken)}`
        : "",
    },
    method,
    path,
    user,
  };
}

describe("requireCsrfToken", () => {
  it("allows safe requests without a CSRF token", () => {
    const req = createRequest({ method: "GET", user: null });
    const res = createResponse();
    const next = vi.fn();

    requireCsrfToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows session creation requests without a CSRF token", () => {
    const req = createRequest({ path: "/auth/login", user: null });
    const res = createResponse();
    const next = vi.fn();

    requireCsrfToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows authenticated unsafe requests with a matching CSRF token", () => {
    const req = createRequest({
      cookieToken: "token-1",
      headerToken: "token-1",
    });
    const res = createResponse();
    const next = vi.fn();

    requireCsrfToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects authenticated unsafe requests with a missing CSRF token", () => {
    const req = createRequest({ cookieToken: "token-1" });
    const res = createResponse();
    const next = vi.fn();

    requireCsrfToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid CSRF token." });
  });
});
