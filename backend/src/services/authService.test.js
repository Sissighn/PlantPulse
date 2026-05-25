import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sqlite3", () => ({
  default: {
    verbose: () => ({
      Database: vi.fn().mockImplementation((path, callback) => {
        if (callback) callback(null);

        return {
          all: vi.fn(),
          get: vi.fn(),
          run: vi.fn(),
          serialize: vi.fn((serializeCallback) => serializeCallback?.()),
        };
      }),
    }),
  },
}));

import * as authService from "./authService.js";
const db = require("../db/database");

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(db, "createRegisteredUser").mockReset();
    vi.spyOn(db, "findUserByEmail").mockReset();
    vi.spyOn(db, "upgradeGuestUser").mockReset();
  });

  it("stores password hashes that verify without keeping the password", async () => {
    const hash = await authService.hashPassword("long-passphrase-123");

    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("long-passphrase-123");
    await expect(
      authService.verifyPassword("long-passphrase-123", hash),
    ).resolves.toBe(true);
    await expect(
      authService.verifyPassword("wrong-passphrase-123", hash),
    ).resolves.toBe(false);
  });

  it("upgrades a guest account during registration", async () => {
    db.findUserByEmail.mockResolvedValue(null);
    db.upgradeGuestUser.mockResolvedValue({
      accountType: "registered",
      displayName: "Mina",
      email: "mina@example.com",
      id: "guest-1",
    });

    const user = await authService.register(
      {
        displayName: "Mina",
        email: "Mina@Example.com",
        password: "long-passphrase-123",
      },
      { accountType: "guest", id: "guest-1" },
    );

    expect(db.upgradeGuestUser).toHaveBeenCalledWith(
      "guest-1",
      expect.objectContaining({
        displayName: "Mina",
        email: "mina@example.com",
        passwordHash: expect.stringMatching(/^scrypt\$/),
      }),
    );
    expect(db.createRegisteredUser).not.toHaveBeenCalled();
    expect(user.id).toBe("guest-1");
  });
});
