import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

const missingPagePath = "/una-ruta-que-no-existe";

function isExpectedMissingPageError(
  message: ConsoleMessage,
  expectedPath?: string,
) {
  if (
    !expectedPath ||
    !message.text().startsWith("Failed to load resource:") ||
    !message.text().includes("status of 404")
  ) {
    return false;
  }

  try {
    return new URL(message.location().url).pathname === expectedPath;
  } catch {
    return false;
  }
}

function captureBrowserErrors(page: Page, expectedMissingPath?: string) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !isExpectedMissingPageError(message, expectedMissingPath)
    ) {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  return errors;
}

test("permite navegar a la explicación y volver al inicio", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tu entrenamiento empieza contigo.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "App Gym, inicio", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Cómo funciona", exact: true }),
  ).toHaveAttribute("href", "/como-funciona");

  await page
    .getByRole("link", { name: "Conoce cómo funciona", exact: true })
    .click();
  await expect(page).toHaveURL(/\/como-funciona$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Un plan que parte de tu realidad.",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(browserErrors).toEqual([]);
});

test("muestra una página 404 que permite volver", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page, missingPagePath);
  const response = await page.goto(missingPagePath);

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Esta página no está en tu rutina.",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(browserErrors).toEqual([]);
});

test("no provoca desplazamiento horizontal a 360 px", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.setViewportSize({ width: 360, height: 800 });

  for (const path of ["/", "/como-funciona"]) {
    await page.goto(path);
    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
  }

  await expect(browserErrors).toEqual([]);
});

test("permite activar el CTA principal con el teclado", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/");

  const callToAction = page.getByRole("link", {
    name: "Conoce cómo funciona",
    exact: true,
  });

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await page.keyboard.press("Tab");
    if (await callToAction.evaluate((element) => element === document.activeElement)) {
      break;
    }
  }

  await expect(callToAction).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/como-funciona$/);
  await expect(browserErrors).toEqual([]);
});
