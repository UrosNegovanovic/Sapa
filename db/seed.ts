import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  breedAliases,
  breeds,
  breedTranslations,
  cities,
  countries,
  listingMedia,
  listings,
  municipalities,
  providerMedia,
  serviceProviders,
  species,
  speciesTranslations,
  userProfiles,
  users,
} from "@/db/schema";

const locale = "sr-Latn";

const speciesSeed = [
  ["pas", "Psi"],
  ["macka", "Mačke"],
  ["ptica", "Ptice"],
  ["glodar", "Glodari"],
  ["riba", "Akvaristika"],
  ["gmizavac", "Teraristika"],
  ["konj", "Konji"],
  ["farmska-zivotinja", "Farmske životinje"],
  ["zec", "Zečevi"],
  ["vodozemac", "Vodozemci"],
] as const;

const breedSeed: Record<string, ReadonlyArray<readonly [string, string, aliases?: readonly string[]]>> = {
  pas: [
    ["zlatni-retriver", "Zlatni retriver", ["golden retriever"]],
    ["labrador-retriver", "Labrador retriver", ["labrador"]],
    ["nemacki-ovcar", "Nemački ovčar"],
    ["francuski-buldog", "Francuski buldog"],
    ["engleski-buldog", "Engleski buldog"],
    ["bigl", "Bigl", ["beagle"]],
    ["pudla", "Pudla", ["poodle"]],
    ["jazavicar", "Jazavičar", ["dachshund"]],
    ["sibirski-haski", "Sibirski haski"],
    ["border-koli", "Border koli"],
    ["kane-korso", "Kane korso"],
    ["doberman", "Doberman"],
    ["rotvajler", "Rotvajler"],
    ["maltezer", "Maltezer"],
    ["pomeranac", "Pomeranac"],
    ["mops", "Mops"],
    ["samojed", "Samojed"],
    ["mesanac", "Mešanac"],
  ],
  macka: [
    ["britanska-kratkodlaka", "Britanska kratkodlaka"],
    ["mejn-kun", "Mejn kun", ["maine coon"]],
    ["sijamska", "Sijamska"],
    ["persijska", "Persijska"],
    ["ruska-plava", "Ruska plava"],
    ["ragdol", "Ragdol", ["ragdoll"]],
    ["bengalska", "Bengalska"],
    ["sfinks", "Sfinks", ["sphynx"]],
    ["skotski-fold", "Škotski fold"],
    ["norveska-sumska", "Norveška šumska"],
    ["evropska-kratkodlaka", "Evropska kratkodlaka"],
    ["domaca-macka", "Domaća mačka"],
  ],
  ptica: [
    ["tigrica", "Tigrica"],
    ["nimfa", "Nimfa"],
    ["kanarinac", "Kanarinac"],
    ["africki-sivi-papagaj", "Afrički sivi papagaj", ["žako", "jako"]],
    ["rozenkolis", "Rozenkolis"],
    ["ara", "Ara"],
  ],
  glodar: [
    ["sirijski-hrcak", "Sirijski hrčak"],
    ["patuljasti-hrcak", "Patuljasti hrčak"],
    ["morsko-prase", "Morsko prase"],
    ["cincila", "Činčila"],
  ],
};

const serbianCities = [
  "Beograd",
  "Novi Sad",
  "Niš",
  "Kragujevac",
  "Subotica",
  "Pančevo",
  "Čačak",
  "Novi Pazar",
  "Zrenjanin",
  "Kraljevo",
  "Smederevo",
  "Leskovac",
  "Užice",
  "Valjevo",
  "Vranje",
  "Šabac",
  "Požarevac",
  "Sombor",
  "Kruševac",
  "Pirot",
  "Zaječar",
  "Kikinda",
  "Sremska Mitrovica",
  "Jagodina",
  "Vršac",
  "Bor",
  "Loznica",
  "Prokuplje",
  "Paraćin",
  "Aranđelovac",
] as const;

const slugify = (value: string) =>
  value
    .toLocaleLowerCase("sr-Latn")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function seed() {
  const db = getDatabase();

  await db
    .insert(countries)
    .values([
      { code: "RS", name: "Srbija", defaultCurrency: "RSD", sortOrder: 1 },
      { code: "BA", name: "Bosna i Hercegovina", defaultCurrency: "EUR", sortOrder: 2 },
      { code: "HR", name: "Hrvatska", defaultCurrency: "EUR", sortOrder: 3 },
      { code: "ME", name: "Crna Gora", defaultCurrency: "EUR", sortOrder: 4 },
      { code: "MK", name: "Severna Makedonija", defaultCurrency: "EUR", sortOrder: 5 },
      { code: "SI", name: "Slovenija", defaultCurrency: "EUR", sortOrder: 6 },
    ])
    .onConflictDoNothing();

  const [serbia] = await db.select().from(countries).where(eq(countries.code, "RS")).limit(1);
  if (!serbia) throw new Error("Serbia seed country was not created");

  for (const [sortOrder, name] of serbianCities.entries()) {
    const slug = slugify(name);
    await db.insert(municipalities).values({ countryId: serbia.id, name, slug }).onConflictDoNothing();
    const [municipality] = await db
      .select()
      .from(municipalities)
      .where(and(eq(municipalities.countryId, serbia.id), eq(municipalities.slug, slug)))
      .limit(1);
    if (!municipality) continue;
    await db
      .insert(cities)
      .values({ municipalityId: municipality.id, name, slug, sortOrder })
      .onConflictDoNothing();
  }

  for (const [sortOrder, [slug, name]] of speciesSeed.entries()) {
    await db.insert(species).values({ slug, sortOrder }).onConflictDoNothing();
    const [speciesRow] = await db.select().from(species).where(eq(species.slug, slug)).limit(1);
    if (!speciesRow) continue;
    await db
      .insert(speciesTranslations)
      .values({ speciesId: speciesRow.id, locale, name })
      .onConflictDoNothing();

    for (const [breedSort, [breedSlug, breedName, aliases = []]] of (breedSeed[slug] ?? []).entries()) {
      await db
        .insert(breeds)
        .values({ speciesId: speciesRow.id, slug: breedSlug, sortOrder: breedSort })
        .onConflictDoNothing();
      const [breedRow] = await db
        .select()
        .from(breeds)
        .where(and(eq(breeds.speciesId, speciesRow.id), eq(breeds.slug, breedSlug)))
        .limit(1);
      if (!breedRow) continue;
      await db.insert(breedTranslations).values({ breedId: breedRow.id, locale, name: breedName }).onConflictDoNothing();
      for (const alias of aliases) {
        await db
          .insert(breedAliases)
          .values({ breedId: breedRow.id, locale, alias, normalizedAlias: slugify(alias).replaceAll("-", " ") })
          .onConflictDoNothing();
      }
    }
  }

  await db
    .insert(users)
    .values([
      { id: "seed-seller-01", name: "Demo prodavac 01", email: "prodavac-01@example.invalid", emailVerified: true },
      { id: "seed-provider-01", name: "Demo pružalac 01", email: "pruzalac-01@example.invalid", emailVerified: true },
    ])
    .onConflictDoNothing();

  const [belgrade] = await db.select().from(cities).where(eq(cities.slug, "beograd")).limit(1);
  const [noviSad] = await db.select().from(cities).where(eq(cities.slug, "novi-sad")).limit(1);
  const [dog] = await db.select().from(species).where(eq(species.slug, "pas")).limit(1);
  const [cat] = await db.select().from(species).where(eq(species.slug, "macka")).limit(1);
  if (!belgrade || !noviSad || !dog || !cat) throw new Error("Required demo references were not created");

  await db
    .insert(userProfiles)
    .values([
      { userId: "seed-seller-01", displayName: "Demo prodavac", cityId: belgrade.id },
      { userId: "seed-provider-01", displayName: "Demo pružalac usluge", cityId: noviSad.id },
    ])
    .onConflictDoNothing();

  const demoListings = [
    {
      slug: "primer-oglasa-zlatni-retriver",
      title: "Primer oglasa — zlatni retriver",
      description: "Jasno označen demonstracioni sadržaj za razvoj početne stranice.",
      speciesId: dog.id,
      cityId: belgrade.id,
      type: "sale" as const,
      sex: "male" as const,
      approximateAgeMonths: 3,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    },
    {
      slug: "primer-oglasa-domaca-macka",
      title: "Primer oglasa — domaća mačka",
      description: "Jasno označen demonstracioni sadržaj za razvoj početne stranice.",
      speciesId: cat.id,
      cityId: noviSad.id,
      type: "adoption" as const,
      sex: "female" as const,
      approximateAgeMonths: 5,
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
    },
    {
      slug: "primer-oglasa-francuski-buldog",
      title: "Primer oglasa — francuski buldog",
      description: "Jasno označen demonstracioni sadržaj za razvoj početne stranice.",
      speciesId: dog.id,
      cityId: belgrade.id,
      type: "wanted" as const,
      sex: "unknown" as const,
      approximateAgeMonths: 12,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80",
    },
    {
      slug: "primer-oglasa-mesanac",
      title: "Primer oglasa — mešanac",
      description: "Jasno označen demonstracioni sadržaj za razvoj početne stranice.",
      speciesId: dog.id,
      cityId: noviSad.id,
      type: "adoption" as const,
      sex: "male" as const,
      approximateAgeMonths: 7,
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
    },
  ];

  for (const item of demoListings) {
    await db
      .insert(listings)
      .values({
        ownerId: "seed-seller-01",
        speciesId: item.speciesId,
        cityId: item.cityId,
        type: item.type,
        status: "active",
        title: item.title,
        slug: item.slug,
        description: item.description,
        sex: item.sex,
        approximateAgeMonths: item.approximateAgeMonths,
        publishedAt: new Date(),
        searchDocument: `${item.title} ${item.description}`,
      })
      .onConflictDoNothing();
    const [listing] = await db.select().from(listings).where(eq(listings.slug, item.slug)).limit(1);
    if (!listing) continue;
    await db
      .insert(listingMedia)
      .values({ listingId: listing.id, type: "image", storageKey: item.image, altText: item.title, isPrimary: true })
      .onConflictDoNothing();
  }

  const demoProviders = [
    {
      slug: "primer-salona",
      type: "grooming" as const,
      name: "Primer salona",
      description: "Demonstracioni profil salona bez stvarnih poslovnih podataka.",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      slug: "primer-smestaja",
      type: "boarding_hotel" as const,
      name: "Primer smeštaja",
      description: "Demonstracioni profil smeštaja bez stvarnih poslovnih podataka.",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  for (const item of demoProviders) {
    await db
      .insert(serviceProviders)
      .values({
        ownerId: "seed-provider-01",
        cityId: noviSad.id,
        type: item.type,
        name: item.name,
        slug: item.slug,
        description: item.description,
        verificationStatus: "unverified",
      })
      .onConflictDoNothing();
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.slug, item.slug)).limit(1);
    if (!provider) continue;
    await db
      .insert(providerMedia)
      .values({ providerId: provider.id, storageKey: item.image, altText: item.name })
      .onConflictDoNothing();
  }

  console.info("Seed completed: 10 species, 40 breeds, 30 Serbian cities, and explicit demo content.");
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
