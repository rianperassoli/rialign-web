import { expect, test } from "@playwright/test";

test("unauthenticated visit redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("login page links to registration", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: /create one/i }).click();
  await expect(page).toHaveURL(/\/register$/);
});
