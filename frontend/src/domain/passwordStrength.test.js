import { describe, expect, it } from "vitest";
import {
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
} from "./passwordStrength";

describe("getPasswordStrength", () => {
  it("caps short complex passwords below a good rating", () => {
    const strength = getPasswordStrength("Short1!");

    expect(strength.level).toBe("tooShort");
    expect(strength.score).toBeLessThanOrEqual(2);
    expect(strength.rules.minLength).toBe(false);
  });

  it("rates a long varied password as strong", () => {
    const strength = getPasswordStrength("PlantPulse Garden 2026!");

    expect(strength.level).toBe("strong");
    expect(strength.rules).toMatchObject({
      lower: true,
      minLength: true,
      number: true,
      symbol: true,
      upper: true,
    });
  });

  it("uses the configured minimum length as a strength rule", () => {
    const strength = getPasswordStrength("a".repeat(PASSWORD_MIN_LENGTH));

    expect(strength.rules.minLength).toBe(true);
    expect(strength.level).toBe("fair");
  });
});
