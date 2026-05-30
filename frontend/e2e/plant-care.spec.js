import { expect, test } from "@playwright/test";

test("adds a plant and waters it", async ({ page }) => {
  let plants = [];

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
      const payload = request.postDataJSON();
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
  await page.getByPlaceholder(/ai estimation/i).fill("7");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("heading", { name: "Monstera" })).toBeVisible();
  await expect(page.getByText(/overdue/i)).toBeVisible();

  const wateringRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url() === "http://localhost:3000/api/water/plant-1",
  );
  await page.locator('button[title="Water"]').evaluate((button) => button.click());
  await wateringRequest;

  await expect(page.getByText(/in \d+ days/i)).toBeVisible();
});
