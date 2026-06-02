import { expect, test } from "@playwright/test";

type E2EPlant = {
  baseInterval: number;
  id: string;
  imageUrl: string | null;
  lastWatered: string;
  name: string;
  type: string;
};

type CreatePlantPayload = {
  baseInterval?: number | null;
  name: string;
  type: string;
};

test("adds a plant and waters it", async ({ page }) => {
  let plants: E2EPlant[] = [];

  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
  });

  await page.route("http://localhost:3000/icons/**", async (route) => {
    await route.fulfill({
      body: "",
      contentType: "image/png",
      status: 200,
    });
  });

  await page.route("http://localhost:3000/images/**", async (route) => {
    await route.fulfill({
      body: "",
      contentType: "image/png",
      status: 200,
    });
  });

  await page.route("http://localhost:3000/api/auth/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        user: {
          displayName: "E2E Gardener",
          email: null,
          id: "test-user",
          isGuest: true,
        },
      },
      status: 200,
    });
  });

  await page.route("http://localhost:3000/api/plants", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        json: { plants },
        status: 200,
      });
      return;
    }

    if (request.method() === "POST") {
      const payload = request.postDataJSON() as CreatePlantPayload;
      expect(payload).not.toHaveProperty("baseInterval");
      plants = [
        {
          baseInterval: payload.baseInterval || 7,
          id: "plant-1",
          imageUrl: null,
          lastWatered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          name: payload.name,
          type: payload.type,
        },
      ];

      await route.fulfill({
        contentType: "application/json",
        json: plants[0],
        status: 201,
      });
      return;
    }

    await route.fallback();
  });

  await page.route("http://localhost:3000/api/water/plant-1", async (route) => {
    plants = plants.map((plant) =>
      plant.id === "plant-1"
        ? { ...plant, lastWatered: new Date().toISOString() }
        : plant,
    );

    await route.fulfill({
      contentType: "application/json",
      json: plants[0],
      status: 200,
    });
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "PlantPulse" })).toBeVisible();
  await page.getByRole("button", { name: /add new plant/i }).click();
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("heading", { name: "Monstera" })).toBeVisible();
  await expect(page.getByText(/overdue/i)).toBeVisible();

  const wateringRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url() === "http://localhost:3000/api/water/plant-1",
  );
  await page
    .locator('button[title="Water"]')
    .evaluate((button) => (button as HTMLButtonElement).click());
  await wateringRequest;

  await expect(page.getByText(/in \d+ days/i)).toBeVisible();

  await page.getByRole("button", { name: /calendar/i }).click();
  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
  await expect(page.getByText("Monstera").first()).toBeVisible();

  const wateringDay = page.locator('[aria-label*="watering task"]').first();
  await wateringDay.hover();
  await expect(wateringDay.getByText(/1 watering task/i)).toBeVisible();
  await expect(wateringDay.getByText(/interval:/i)).toBeVisible();
});
