// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { demoHomepageData } from "@/features/home/demo-content";

const queryMock = vi.hoisted(() => vi.fn());

vi.mock("@/db/client", () => ({
  getDatabase: () => {
    if (!process.env.DATABASE_URL)
      throw new Error("DATABASE_URL is required for database access");
    return queryMock;
  },
}));

async function loadHomepageData(locale = "sr-Latn") {
  vi.resetModules();
  const { getHomepageData } = await import("@/features/home/data");
  return getHomepageData(locale);
}

describe("getHomepageData", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the centralized demo content only when demo mode is explicitly enabled", async () => {
    vi.stubEnv("USE_DEMO_DATA", "true");
    vi.stubEnv("DATABASE_URL", "");

    await expect(loadHomepageData()).resolves.toEqual(demoHomepageData);
  });

  it("does not silently fall back to demo content when the database is not configured", async () => {
    vi.stubEnv("USE_DEMO_DATA", "");
    vi.stubEnv("DATABASE_URL", "");

    await expect(loadHomepageData()).rejects.toThrow(/DATABASE_URL/);
  });
});

describe("demoHomepageData", () => {
  it("is visibly labelled as demo content", () => {
    for (const listing of demoHomepageData.listings)
      expect(listing.title).toMatch(/^Primer oglasa/);
    for (const provider of Object.values(demoHomepageData.services))
      expect(provider?.name).toMatch(/^Primer/);
  });

  it("uses ASCII-only slugs", () => {
    const slugs = [
      ...demoHomepageData.categories.map((item) => item.slug),
      ...demoHomepageData.cities.map((item) => item.slug),
      ...demoHomepageData.listings.map((item) => item.slug),
    ];
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});
