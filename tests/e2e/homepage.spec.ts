import { expect, test } from "@playwright/test";

test("homepage renders and submits pet search parameters", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "najboljeg prijatelja",
  );
  await expect(
    page.getByRole("heading", { name: "Najnoviji oglasi" }),
  ).toBeVisible();

  await page.getByLabel("Vrsta").first().selectOption("pas");
  await page.getByLabel("Grad").first().selectOption("beograd");
  await page.getByRole("button", { name: "Pretraži" }).click();

  await expect(page).toHaveURL(/\/pretraga\?vrsta=pas&rasa=&grad=beograd$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Rezultati stižu u sledećoj fazi",
  );

  if (testInfo.project.name === "mobile-chrome") {
    await expect(
      page.getByRole("navigation", { name: "Početna" }),
    ).toBeVisible();
  }
});
