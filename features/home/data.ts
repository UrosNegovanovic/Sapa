import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";

import { getDatabase } from "@/db/client";
import {
  breeds,
  breedTranslations,
  cities,
  listingMedia,
  listings,
  serviceProviders,
  species,
  speciesTranslations,
} from "@/db/schema";

export type HomeCategory = { id: string; slug: string; name: string };
export type HomeListing = {
  id: string;
  slug: string;
  title: string;
  speciesName: string;
  breedName: string | null;
  cityName: string;
  type: "sale" | "adoption" | "stud" | "wanted";
  sex: "male" | "female" | "unknown";
  approximateAgeMonths: number | null;
  image: string;
  imageAlt: string;
};
export type HomeProvider = {
  id: string;
  slug: string;
  type: "grooming" | "boarding_hotel" | "home_sitter";
  name: string;
  description: string;
  cityName: string;
  image: string;
};
export type HomepageData = {
  categories: HomeCategory[];
  listings: HomeListing[];
  providers: HomeProvider[];
  cities: Array<{ id: string; name: string; slug: string }>;
};

const demoData: HomepageData = {
  categories: [
    { id: "demo-dog", slug: "pas", name: "Psi" },
    { id: "demo-cat", slug: "macka", name: "Mačke" },
    { id: "demo-bird", slug: "ptica", name: "Ptice" },
    { id: "demo-rodent", slug: "glodar", name: "Glodari" },
    { id: "demo-fish", slug: "riba", name: "Akvaristika" },
    { id: "demo-reptile", slug: "gmizavac", name: "Teraristika" },
    { id: "demo-horse", slug: "konj", name: "Konji" },
    { id: "demo-farm", slug: "farmska-zivotinja", name: "Farmske životinje" },
  ],
  cities: [
    { id: "demo-belgrade", name: "Beograd", slug: "beograd" },
    { id: "demo-novi-sad", name: "Novi Sad", slug: "novi-sad" },
    { id: "demo-nis", name: "Niš", slug: "nis" },
  ],
  listings: [
    {
      id: "demo-listing-1",
      slug: "primer-oglasa-zlatni-retriver",
      title: "Primer oglasa — zlatni retriver",
      speciesName: "Pas",
      breedName: "Zlatni retriver",
      cityName: "Beograd",
      type: "sale",
      sex: "male",
      approximateAgeMonths: 3,
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Zlatni retriver u prirodi",
    },
    {
      id: "demo-listing-2",
      slug: "primer-oglasa-domaca-macka",
      title: "Primer oglasa — domaća mačka",
      speciesName: "Mačka",
      breedName: "Domaća mačka",
      cityName: "Novi Sad",
      type: "adoption",
      sex: "female",
      approximateAgeMonths: 5,
      image:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Crno-bela domaća mačka",
    },
    {
      id: "demo-listing-3",
      slug: "primer-oglasa-francuski-buldog",
      title: "Primer oglasa — francuski buldog",
      speciesName: "Pas",
      breedName: "Francuski buldog",
      cityName: "Niš",
      type: "wanted",
      sex: "unknown",
      approximateAgeMonths: 12,
      image:
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Francuski buldog",
    },
    {
      id: "demo-listing-4",
      slug: "primer-oglasa-mesanac",
      title: "Primer oglasa — mešanac",
      speciesName: "Pas",
      breedName: "Mešanac",
      cityName: "Subotica",
      type: "adoption",
      sex: "male",
      approximateAgeMonths: 7,
      image:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Mladi pas mešanac",
    },
  ],
  providers: [
    {
      id: "demo-provider-1",
      slug: "primer-salona",
      type: "grooming",
      name: "Primer salona",
      description:
        "Demonstracioni profil salona bez stvarnih poslovnih podataka.",
      cityName: "Novi Sad",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "demo-provider-2",
      slug: "primer-smestaja",
      type: "boarding_hotel",
      name: "Primer smeštaja",
      description:
        "Demonstracioni profil smeštaja bez stvarnih poslovnih podataka.",
      cityName: "Beograd",
      image:
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};

async function queryHomepageData(locale: string): Promise<HomepageData> {
  const db = getDatabase();
  const [categoryRows, cityRows, listingRows, providerRows] = await Promise.all(
    [
      db
        .select({
          id: species.id,
          slug: species.slug,
          name: speciesTranslations.name,
        })
        .from(species)
        .innerJoin(
          speciesTranslations,
          and(
            eq(speciesTranslations.speciesId, species.id),
            eq(speciesTranslations.locale, locale),
          ),
        )
        .where(eq(species.isActive, true))
        .orderBy(asc(species.sortOrder))
        .limit(8),
      db
        .select({ id: cities.id, name: cities.name, slug: cities.slug })
        .from(cities)
        .where(eq(cities.isActive, true))
        .orderBy(asc(cities.sortOrder))
        .limit(40),
      db
        .select({
          id: listings.id,
          slug: listings.slug,
          title: listings.title,
          speciesName: speciesTranslations.name,
          breedName: breedTranslations.name,
          cityName: cities.name,
          type: listings.type,
          sex: listings.sex,
          approximateAgeMonths: listings.approximateAgeMonths,
          image: listingMedia.storageKey,
          imageAlt: listingMedia.altText,
        })
        .from(listings)
        .innerJoin(cities, eq(cities.id, listings.cityId))
        .innerJoin(
          speciesTranslations,
          and(
            eq(speciesTranslations.speciesId, listings.speciesId),
            eq(speciesTranslations.locale, locale),
          ),
        )
        .leftJoin(breeds, eq(breeds.id, listings.breedId))
        .leftJoin(
          breedTranslations,
          and(
            eq(breedTranslations.breedId, breeds.id),
            eq(breedTranslations.locale, locale),
          ),
        )
        .leftJoin(
          listingMedia,
          and(
            eq(listingMedia.listingId, listings.id),
            eq(listingMedia.isPrimary, true),
          ),
        )
        .where(eq(listings.status, "active"))
        .orderBy(desc(listings.publishedAt))
        .limit(8),
      db
        .select({
          id: serviceProviders.id,
          slug: serviceProviders.slug,
          type: serviceProviders.type,
          name: serviceProviders.name,
          description: serviceProviders.description,
          cityName: cities.name,
        })
        .from(serviceProviders)
        .innerJoin(cities, eq(cities.id, serviceProviders.cityId))
        .where(eq(serviceProviders.isActive, true))
        .orderBy(desc(serviceProviders.createdAt))
        .limit(2),
    ],
  );

  return {
    categories: categoryRows,
    cities: cityRows,
    listings: listingRows.map((listing) => ({
      ...listing,
      image: listing.image ?? demoData.listings[0].image,
      imageAlt: listing.imageAlt ?? listing.title,
    })),
    providers: providerRows.map((provider, index) => ({
      ...provider,
      image: demoData.providers[index % demoData.providers.length].image,
    })),
  };
}

export const getHomepageData = cache(
  async (locale: string): Promise<HomepageData> => {
    if (!process.env.DATABASE_URL || process.env.USE_DEMO_DATA === "true")
      return demoData;
    return queryHomepageData(locale);
  },
);
