import { describe, expect, it } from "vitest";
import {
  buildWateringEventsForMonth,
  getNextWateringDate,
  toDateKey,
} from "./wateringCalendar";

describe("wateringCalendar", () => {
  it("builds recurring watering events for the selected month", () => {
    const events = buildWateringEventsForMonth(
      [
        {
          baseInterval: 7,
          id: "plant-1",
          lastWatered: "2026-06-01T10:00:00.000Z",
          name: "Monstera",
          type: "monstra",
        },
      ],
      "spring",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2026-06-01T00:00:00.000Z"),
    );

    expect(events.map((event) => event.dateKey)).toEqual([
      "2026-06-08",
      "2026-06-15",
      "2026-06-22",
      "2026-06-29",
    ]);
  });

  it("updates event spacing when the season changes", () => {
    const plant = {
      baseInterval: 18,
      id: "aloe",
      lastWatered: "2026-06-01T10:00:00.000Z",
      name: "Aloe Vera",
      type: "aloevera",
    };

    const summerEvents = buildWateringEventsForMonth(
      [plant],
      "summer",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2026-06-01T00:00:00.000Z"),
    );
    const winterEvents = buildWateringEventsForMonth(
      [plant],
      "winter",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2026-06-01T00:00:00.000Z"),
    );

    expect(summerEvents[0].interval).toBe(16);
    expect(winterEvents).toHaveLength(0);
    expect(toDateKey(getNextWateringDate(plant, "winter", new Date("2026-06-01")))).toBe(
      "2026-07-14",
    );
  });
});
