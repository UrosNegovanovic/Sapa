import { expect, test } from "@playwright/test";

for (const path of ["/", "/pretraga"]) {
  test(`${path} has no placeholder links and labels unfinished features`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    await expect(page.getByText("Uskoro").first()).toBeAttached();
  });
}

test("homepage has no inert favorite buttons", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Dodaj u omiljene" }),
  ).toHaveCount(0);
});
