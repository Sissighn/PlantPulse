import { describe, expect, it } from "vitest";
import { getAdjustedInterval } from "./wateringSchedule";

describe("wateringSchedule", () => {
  it("adjusts intervals by plant profile and season", () => {
    const aloe = { name: "Aloe Vera", type: "aloevera" };
    const calathea = { name: "Calathea Orbifolia", type: "calatheaorbifolia" };

    expect(getAdjustedInterval(18, "winter", aloe)).toBe(43);
    expect(getAdjustedInterval(5, "winter", calathea)).toBe(7);
  });

  it("uses the stored base interval but plant-specific seasonal multiplier", () => {
    const cactus = { name: "Opuntia Microdasys", type: "opuntiamicrodasys" };

    expect(getAdjustedInterval(20, "summer", cactus)).toBe(17);
    expect(getAdjustedInterval(20, "winter", cactus)).toBe(60);
  });

  it("falls back safely for unknown plants", () => {
    expect(getAdjustedInterval(undefined, "spring", { name: "Unknown" })).toBe(7);
  });
});
