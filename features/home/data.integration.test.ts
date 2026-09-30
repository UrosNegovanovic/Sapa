// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cities,
  countries,
  listingMedia,
  listings,
  municipalities,
  providerMedia,
  serviceProviders,
  species,
  speciesTranslations,
  users,
} from "@/db/schema";
import { queryHomepageData } from "@/features/home/data";
import {
  createTestDatabase,
  type TestDatabase,
} from "@/tests/db/test-database";

const databaseUrl = process.env.TEST_DATABASE_URL;
const locale = "sr-Latn";
let testDb: TestDatabase;

class Rollback extends Error {}

type Transaction = Parameters<
  Parameters<TestDatabase["db"]["transaction"]>[0]
>[0];

// Each scenario runs in a rolled-back transaction so scenarios cannot see each
// other's "latest" providers or listings.
async function withRollback(run: (tx: Transaction) => Promise<void>) {
  await testDb.db
    .transaction(async (tx) => {
      await run(tx);
      throw new Rollback();
    })
    .catch((error: unknown) => {
      if (!(error instanceof Rollback)) throw error;
    });
}

async function insertFixtures(tx: Transaction) {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [country] = await tx
    .insert(countries)
    .values({ code: "ZZ", name: "Test", defaultCurrency: "RSD" })
    .returning();
  const [municipality] = await tx
    .insert(municipalities)
    .values({
      countryId: country.id,
      name: "Test opština",
      slug: "test-opstina-home",
    })
    .returning();
  const [city] = await tx
    .insert(cities)
    .values({
      municipalityId: municipality.id,
      name: "Test grad",
      slug: "test-grad-home",
    })
    .returning();
  const [animal] = await tx
    .insert(species)
    .values({ slug: "test-vrsta-home", sortOrder: -1 })
    .returning();
  await tx
    .insert(speciesTranslations)
    .values({ speciesId: animal.id, locale, name: "Test vrsta" });
  await tx.insert(users).values({
    id: "test-home-owner",
    name: "Test vlasnik",
    email: "test-home-owner@example.invalid",
  });

  return { city, animal, future };
}

describe.skipIf(!databaseUrl)("queryHomepageData (PostgreSQL)", () => {
  beforeAll(async () => {
    testDb = await createTestDatabase(databaseUrl ?? "");
  });
  afterAll(async () => {
    await testDb?.dispose();
  });

  it("uses the first provider_media row per service group and no demo image", async () => {
    await withRollback(async (tx) => {
      const { city, future } = await insertFixtures(tx);
      const [salon, hotel] = await tx
        .insert(serviceProviders)
        .values([
          {
            ownerId: "test-home-owner",
            cityId: city.id,
            type: "grooming",
            name: "Test salon",
            slug: "test-salon-home",
            description: "Test",
            createdAt: future,
          },
          {
            ownerId: "test-home-owner",
            cityId: city.id,
            type: "boarding_hotel",
            name: "Test hotel",
            slug: "test-hotel-home",
            description: "Test",
            createdAt: future,
          },
        ])
        .returning();
      await tx.insert(providerMedia).values([
        {
          providerId: salon.id,
          storageKey: "/media/salon-second.jpg",
          altText: "Drugi",
          sortOrder: 2,
        },
        {
          providerId: salon.id,
          storageKey: "/media/salon-first.jpg",
          altText: "Prvi",
          sortOrder: 1,
        },
      ]);

      const data = await queryHomepageData(tx, locale);

      expect(data.services.grooming).toMatchObject({
        id: salon.id,
        image: { src: "/media/salon-first.jpg", alt: "Prvi" },
      });
      expect(data.services.boarding).toMatchObject({
        id: hotel.id,
        image: null,
      });
    });
  });

  it("returns null for a listing without primary media instead of a demo image", async () => {
    await withRollback(async (tx) => {
      const { city, animal, future } = await insertFixtures(tx);
      const [withMedia, withoutMedia] = await tx
        .insert(listings)
        .values([
          {
            ownerId: "test-home-owner",
            speciesId: animal.id,
            cityId: city.id,
            type: "sale",
            status: "active",
            title: "Sa slikom",
            slug: "test-sa-slikom-home",
            description: "Test",
            publishedAt: future,
          },
          {
            ownerId: "test-home-owner",
            speciesId: animal.id,
            cityId: city.id,
            type: "adoption",
            status: "active",
            title: "Bez slike",
            slug: "test-bez-slike-home",
            description: "Test",
            publishedAt: future,
          },
        ])
        .returning();
      await tx.insert(listingMedia).values({
        listingId: withMedia.id,
        type: "image",
        storageKey: "/media/listing.jpg",
        altText: "Opis slike",
        isPrimary: true,
      });

      const data = await queryHomepageData(tx, locale);
      const byId = new Map(data.listings.map((item) => [item.id, item]));

      expect(byId.get(withMedia.id)?.image).toEqual({
        src: "/media/listing.jpg",
        alt: "Opis slike",
      });
      expect(byId.get(withoutMedia.id)?.image).toBeNull();
    });
  });

  it("ignores inactive providers", async () => {
    await withRollback(async (tx) => {
      const { city, future } = await insertFixtures(tx);
      await tx.insert(serviceProviders).values({
        ownerId: "test-home-owner",
        cityId: city.id,
        type: "grooming",
        name: "Neaktivan salon",
        slug: "test-neaktivan-home",
        description: "Test",
        isActive: false,
        createdAt: future,
      });

      const data = await queryHomepageData(tx, locale);

      expect(data.services.grooming?.slug).not.toBe("test-neaktivan-home");
      const [row] = await tx
        .select({ isActive: serviceProviders.isActive })
        .from(serviceProviders)
        .where(eq(serviceProviders.slug, "test-neaktivan-home"));
      expect(row?.isActive).toBe(false);
    });
  });
});
