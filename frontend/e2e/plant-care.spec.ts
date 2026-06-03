import { expect, type Page, test } from "@playwright/test";

type E2EUser = {
  displayName: string | null;
  email: string | null;
  id: string;
  isGuest: boolean;
};

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

const guestUser: E2EUser = {
  displayName: "E2E Gardener",
  email: null,
  id: "test-user",
  isGuest: true,
};

async function setLanguage(page: Page, language = "en") {
  await page.addInitScript((lang) => {
    localStorage.setItem("lang", lang);
  }, language);
}

async function mockStaticAssets(page: Page) {
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
}

async function mockAuthenticatedSession(
  page: Page,
  {
    plants,
    user = guestUser,
  }: {
    plants: E2EPlant[];
    user?: E2EUser;
  },
) {
  await mockStaticAssets(page);

  await page.route("http://localhost:3000/api/auth/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { user },
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
      const plant = {
        baseInterval: payload.baseInterval || 7,
        id: `plant-${plants.length + 1}`,
        imageUrl: null,
        lastWatered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        name: payload.name,
        type: payload.type,
      };
      plants.splice(0, plants.length, plant);

      await route.fulfill({
        contentType: "application/json",
        json: plant,
        status: 201,
      });
      return;
    }

    await route.fallback();
  });

  await page.route("http://localhost:3000/api/plants/*", async (route) => {
    if (route.request().method() !== "DELETE") {
      await route.fallback();
      return;
    }

    const id = route.request().url().split("/").pop();
    plants.splice(
      0,
      plants.length,
      ...plants.filter((plant) => plant.id !== id),
    );

    await route.fulfill({
      contentType: "application/json",
      json: { message: "Deleted successfully" },
      status: 200,
    });
  });
}

async function mockUnauthenticatedSession(page: Page) {
  let currentUser: E2EUser | null = null;
  const plants: E2EPlant[] = [];

  await mockStaticAssets(page);

  await page.route("http://localhost:3000/api/auth/session", async (route) => {
    if (!currentUser) {
      await route.fulfill({ status: 401 });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      json: { user: currentUser },
      status: 200,
    });
  });

  await page.route("http://localhost:3000/api/auth/guest", async (route) => {
    currentUser = guestUser;
    await route.fulfill({
      contentType: "application/json",
      json: { user: currentUser },
      status: 200,
    });
  });

  await page.route("http://localhost:3000/api/auth/login", async (route) => {
    currentUser = {
      displayName: "Mina",
      email: "mina@example.com",
      id: "registered-user",
      isGuest: false,
    };
    await route.fulfill({
      contentType: "application/json",
      json: { user: currentUser },
      status: 200,
    });
  });

  await page.route("http://localhost:3000/api/plants", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { plants },
      status: 200,
    });
  });
}

test.beforeEach(async ({ page }) => {
  await setLanguage(page);
});

test("starts guest mode from the auth screen", async ({ page }) => {
  await mockUnauthenticatedSession(page);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "PlantPulse account" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue as guest" }).click();

  await expect(page.getByRole("button", { name: "My plants" })).toBeVisible();
  await expect(page.getByText("E2E Gardener")).toBeVisible();
});

test("logs in from the auth screen", async ({ page }) => {
  await mockUnauthenticatedSession(page);
  await page.goto("/");

  await page.getByLabel("Email").fill("mina@example.com");
  await page.locator('input[type="password"]').fill("very-secure-passphrase");
  await page.locator("form").getByRole("button", { name: /^Log in$/ }).click();

  await expect(page.getByRole("button", { name: "My plants" })).toBeVisible();
  await expect(page.getByText("Mina")).toBeVisible();
});

test("adds a plant, waters it, and shows it in the calendar", async ({ page }) => {
  const plants: E2EPlant[] = [];
  await mockAuthenticatedSession(page, { plants });

  await page.route("http://localhost:3000/api/water/plant-1", async (route) => {
    plants.splice(
      0,
      plants.length,
      ...plants.map((plant) =>
        plant.id === "plant-1"
          ? { ...plant, lastWatered: new Date().toISOString() }
          : plant,
      ),
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

test("searches Plant Book details and adds a result to the garden", async ({
  page,
}) => {
  const plants: E2EPlant[] = [];
  await mockAuthenticatedSession(page, { plants });

  await page.route(
    "http://localhost:3000/api/plant-book/search**",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          plants: [
            {
              alias: "Aloe Vera",
              displayPid: "aloe-vera",
              imageUrl: null,
              pid: "aloe-vera",
              scientificName: "Aloe barbadensis",
            },
          ],
        },
        status: 200,
      });
    },
  );

  await page.route(
    "http://localhost:3000/api/plant-book/aloe-vera**",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          plant: {
            alias: "Aloe Vera",
            care: {
              sunlight: "Bright indirect light",
              watering: "Let soil dry between watering",
            },
            displayPid: "aloe-vera",
            imageUrl: null,
            origin: "Arabian Peninsula",
            pid: "aloe-vera",
            raw: {
              max_env_humid: 45,
              max_light_lux: 12000,
              max_soil_moist: 35,
              max_temp: 26,
              min_env_humid: 25,
              min_light_lux: 5000,
              min_soil_moist: 10,
              min_temp: 18,
            },
            scientificName: "Aloe barbadensis",
          },
        },
        status: 200,
      });
    },
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Plant Book" }).click();
  await page.getByLabel("Search plants").fill("aloe");

  await page.getByRole("button", { name: /Aloe barbadensis/ }).click();
  await expect(page.getByRole("heading", { name: "Aloe Vera" })).toBeVisible();
  await expect(page.getByText("Arabian Peninsula")).toBeVisible();

  await page.getByRole("button", { name: "Add to my plants" }).click();
  await expect(page.getByRole("heading", { name: "Aloe Vera" })).toBeVisible();
});

test("shows an AI assistant error when chat fails", async ({ page }) => {
  const plants: E2EPlant[] = [];
  await mockAuthenticatedSession(page, { plants });

  await page.route("http://localhost:3000/api/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { message: "AI unavailable" },
      status: 500,
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "AI Assistant" }).click();
  await page.getByLabel("Message to the plant assistant").fill("Why is it yellow?");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(
    page.getByText("The message could not be sent. Please try again."),
  ).toBeVisible();
});

test("switches the app language from English to German", async ({ page }) => {
  const plants: E2EPlant[] = [];
  await mockAuthenticatedSession(page, { plants });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "My plants" })).toBeVisible();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: /Language: EN/i }).click();
  await page.getByRole("menuitem", { name: /Switch language to DE/i }).click();

  await expect(page.getByRole("button", { name: "Meine Pflanzen" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Neue Pflanze hinzufügen/i })).toBeVisible();
});

test("keeps the garden usable on a mobile viewport", async ({ page }) => {
  const plants: E2EPlant[] = [
    {
      baseInterval: 7,
      id: "plant-mobile",
      imageUrl: null,
      lastWatered: new Date().toISOString(),
      name: "Mobile Monstera",
      type: "monstra",
    },
  ];
  await page.setViewportSize({ height: 844, width: 390 });
  await mockAuthenticatedSession(page, { plants });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "PlantPulse" })).toBeVisible();
  await expect(page.getByRole("button", { name: "My plants" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mobile Monstera" })).toBeVisible();

  await page.getByRole("button", { name: "Calendar" }).click();
  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
});
