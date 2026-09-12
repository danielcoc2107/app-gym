import { expect, test } from "@playwright/test";

const pagesWithSkipLink = [
  { path: "/", name: "inicio" },
  { path: "/como-funciona", name: "cómo funciona" },
  { path: "/ruta-inexistente-accesibilidad", name: "página 404" },
];

for (const { path, name } of pagesWithSkipLink) {
  test(`el enlace de salto lleva el foco al contenido en ${name}`, async ({ page }) => {
    await page.goto(path);

    const skipLink = page.getByRole("link", { name: "Saltar al contenido", exact: true });
    const main = page.getByRole("main");

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(main).toBeFocused();
  });
}

test("expone como lista los pasos de la página de inicio", async ({ page }) => {
  await page.goto("/");

  const steps = page.getByRole("list");
  await expect(steps).toBeVisible();
  await expect(steps).toHaveAttribute("role", "list");
  await expect(steps.getByRole("listitem")).toHaveCount(3);
});

test("expone como lista los pasos de cómo funciona", async ({ page }) => {
  await page.goto("/como-funciona");

  const steps = page.getByRole("list");
  await expect(steps).toBeVisible();
  await expect(steps).toHaveAttribute("role", "list");
  await expect(steps.getByRole("listitem")).toHaveCount(4);
});
