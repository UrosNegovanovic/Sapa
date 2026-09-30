// @vitest-environment node
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  searchBreeds,
  searchCities,
  searchSpecies,
} from "@/db/repositories/taxonomy-search";
import {
  breedAliases,
  breeds,
  breedTranslations,
  cities,
  countries,
  municipalities,
  species,
  speciesTranslations,
} from "@/db/schema";
import { normalizeSearchText } from "@/lib/text/normalize";
import {
  createTestDatabase,
  type TestDatabase,
} from "@/tests/db/test-database";

const databaseUrl = process.env.TEST_DATABASE_URL;
const locale = "sr-Latn";

describe.skipIf(!databaseUrl)("taxonomy search (PostgreSQL)", () => {
  let testDb: TestDatabase;
  let municipalityId: string;

  beforeAll(async () => {
    testDb = await createTestDatabase(databaseUrl ?? "");
    const { db } = testDb;

    const [country] = await db
      .insert(countries)
      .values({ code: "RS", name: "Srbija", defaultCurrency: "RSD" })
      .returning();
    if (!country) throw new Error("country fixture missing");
    const [municipality] = await db
      .insert(municipalities)
      .values({ countryId: country.id, name: "Fixture", slug: "fixture" })
      .returning();
    if (!municipality) throw new Error("municipality fixture missing");
    municipalityId = municipality.id;

    await db.insert(cities).values(
      [
        ["Beograd", "beograd"],
        ["Niš", "nis"],
        ["Čačak", "cacak"],
        ["Aranđelovac", "arandjelovac"],
        ["Đurđevo", "djurdjevo"],
        ["Kraljevo", "kraljevo"],
      ].map(([name, slug], sortOrder) => ({
        municipalityId,
        name: name ?? "",
        slug: slug ?? "",
        sortOrder,
      })),
    );

    const [cat, dog] = await db
      .insert(species)
      .values([
        { slug: "macka", sortOrder: 1 },
        { slug: "pas", sortOrder: 0 },
      ])
      .returning();
    if (!cat || !dog) throw new Error("species fixtures missing");
    await db.insert(speciesTranslations).values([
      { speciesId: cat.id, locale, name: "Mačka" },
      { speciesId: dog.id, locale, name: "Pas" },
    ]);

    const [domestic, german, grey] = await db
      .insert(breeds)
      .values([
        { speciesId: cat.id, slug: "domaca-macka" },
        { speciesId: dog.id, slug: "nemacki-ovcar" },
        { speciesId: dog.id, slug: "africki-sivi-papagaj" },
      ])
      .returning();
    if (!domestic || !german || !grey) throw new Error("breeds missing");
    await db.insert(breedTranslations).values([
      { breedId: domestic.id, locale, name: "Domaća mačka" },
      { breedId: german.id, locale, name: "Nemački ovčar" },
      { breedId: grey.id, locale, name: "Afrički sivi papagaj" },
    ]);
    await db
      .insert(breedAliases)
      .values([{ breedId: grey.id, locale, alias: "Žako" }]);
  });

  afterAll(async () => {
    await testDb?.dispose();
  });

  it("matches the SQL normalizer to the TypeScript normalizer", async () => {
    const samples = [
      "Mačka",
      "Niš",
      "Čačak",
      "Ćuprija",
      "Žabalj",
      "Aranđelovac",
      "ĐURĐEVO",
      "  Novi   Sad ",
      "Sremska-Mitrovica",
      "žako!",
      "",
    ];
    for (const sample of samples) {
      const [row] = await testDb.client<[{ value: string }]>`
        select normalize_search_text(${sample}) as value`;
      expect(row?.value, sample).toBe(normalizeSearchText(sample));
    }
  });

  it("finds Mačka for macka", async () => {
    const result = await searchSpecies(testDb.db, { locale, query: "macka" });
    expect(result[0]?.name).toBe("Mačka");
  });

  it("finds Niš for nis", async () => {
    const result = await searchCities(testDb.db, { query: "nis" });
    expect(result[0]?.name).toBe("Niš");
  });

  it("finds Čačak for cacak and for its diacritic spelling", async () => {
    for (const query of ["cacak", "ČAČAK", "Čač"]) {
      const result = await searchCities(testDb.db, { query });
      expect(result[0]?.name, query).toBe("Čačak");
    }
  });

  it("maps dj to đ and đ to dj", async () => {
    for (const query of ["arandjelovac", "Arandj", "Aranđelovac", "aranđ"]) {
      const result = await searchCities(testDb.db, { query });
      expect(result[0]?.name, query).toBe("Aranđelovac");
    }
    const djurdjevo = await searchCities(testDb.db, { query: "djurdj" });
    expect(djurdjevo[0]?.name).toBe("Đurđevo");
  });

  it("tolerates the common d-for-đ spelling through trigram similarity", async () => {
    const result = await searchCities(testDb.db, { query: "arandelovac" });
    expect(result[0]?.name).toBe("Aranđelovac");
  });

  it("finds breeds by diacritic-free name and by alias", async () => {
    const ovcar = await searchBreeds(testDb.db, {
      locale,
      query: "nemacki ovcar",
    });
    expect(ovcar[0]?.name).toBe("Nemački ovčar");

    const zako = await searchBreeds(testDb.db, { locale, query: "zako" });
    expect(zako[0]?.name).toBe("Afrički sivi papagaj");
  });

  it("scopes breed search to a species", async () => {
    const [cat] = await searchSpecies(testDb.db, { locale, query: "macka" });
    const result = await searchBreeds(testDb.db, {
      locale,
      query: "a",
      speciesId: cat?.id,
    });
    expect(result.map((breed) => breed.name)).toEqual(["Domaća mačka"]);
  });

  it("returns nothing for blank or punctuation-only queries", async () => {
    expect(await searchCities(testDb.db, { query: "   " })).toEqual([]);
    expect(await searchCities(testDb.db, { query: "!!" })).toEqual([]);
  });

  it("uses the trigram indexes for normalized lookups", async () => {
    const plans = await testDb.db.transaction(async (tx) => {
      await tx.execute(sql`set local enable_seqscan = off`);
      const plan = await tx.execute<{ "QUERY PLAN": string }>(
        sql`explain select id from cities where search_name like '%nis%'`,
      );
      return plan.map((row) => row["QUERY PLAN"]).join("\n");
    });
    expect(plans).toContain("cities_search_name_trgm_idx");
  });

  describe("public slug guard", () => {
    const invalidSlugs = ["mačka", "Macka", "novi sad", "-pas", "đurđevo", ""];

    it.each(invalidSlugs)("rejects species slug %j", async (slug) => {
      await expect(
        testDb.db.insert(species).values({ slug }),
      ).rejects.toThrow();
    });

    it.each(invalidSlugs)("rejects city slug %j", async (slug) => {
      await expect(
        testDb.db.insert(cities).values({ municipalityId, name: "Test", slug }),
      ).rejects.toThrow();
    });

    it("has an ASCII slug check on every public slug table", async () => {
      const rows = await testDb.client<{ table_name: string }[]>`
        select rel.relname as table_name
        from pg_constraint con
        join pg_class rel on rel.oid = con.conrelid
        where con.contype = 'c' and con.conname like '%_slug_ascii'
        order by rel.relname`;
      expect(rows.map((row) => row.table_name)).toEqual([
        "breeds",
        "cities",
        "listings",
        "municipalities",
        "service_providers",
        "species",
      ]);
    });

    it("accepts a valid ASCII slug", async () => {
      await expect(
        testDb.db.insert(species).values({ slug: "zec-2" }),
      ).resolves.toBeDefined();
    });
  });
});
