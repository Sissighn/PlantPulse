import { describe, expect, it } from "vitest";
import {
  buildWateringEventsForDateRange,
  buildWateringEventsForMonth,
  getMonthGridDates,
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

  it("supports Monday or Sunday as the first weekday", () => {
    const month = new Date("2026-06-01T00:00:00.000Z");

    expect(toDateKey(getMonthGridDates(month, 1)[0])).toBe("2026-06-01");
    expect(toDateKey(getMonthGridDates(month, 0)[0])).toBe("2026-05-31");
  });

  it("builds events for spillover days visible in the calendar grid", () => {
    const month = new Date("2026-06-01T00:00:00.000Z");
    const gridDates = getMonthGridDates(month, 1);
    const events = buildWateringEventsForDateRange(
      [
        {
          baseInterval: 5,
          id: "plant-1",
          lastWatered: "2026-06-27T10:00:00.000Z",
          name: "Monstera",
          type: "monstra",
        },
      ],
      "summer",
      gridDates[0],
      gridDates[gridDates.length - 1],
      new Date("2026-06-27T00:00:00.000Z"),
    );

    expect(events.map((event) => event.dateKey)).toContain("2026-07-01");
  });
});
