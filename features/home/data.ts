import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";

import { getDatabase } from "@/db/client";
import {
  breeds,
  breedTranslations,
  cities,
  listingMedia,
  listings,
  providerMedia,
  serviceProviders,
  species,
  speciesTranslations,
} from "@/db/schema";
import {
  demoHomepageData,
  isDemoModeEnabled,
} from "@/features/home/demo-content";
import { type ImageAsset, publicImageSource } from "@/lib/images/source";

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
  image: ImageAsset | null;
};
export type HomeProvider = {
  id: string;
  slug: string;
  type: "grooming" | "boarding_hotel" | "home_sitter";
  name: string;
  cityName: string;
  image: ImageAsset | null;
};
export type HomeServiceGroup = "grooming" | "boarding";
export type HomepageData = {
  categories: HomeCategory[];
  listings: HomeListing[];
  services: Record<HomeServiceGroup, HomeProvider | null>;
  cities: Array<{ id: string; name: string; slug: string }>;
};

type Queryable = Pick<ReturnType<typeof getDatabase>, "select">;

const serviceGroupTypes = {
  grooming: ["grooming"],
  boarding: ["boarding_hotel", "home_sitter"],
} as const satisfies Record<HomeServiceGroup, readonly HomeProvider["type"][]>;

function toImage(storageKey: string | null, alt: string | null) {
  return storageKey ? publicImageSource.resolve(storageKey, alt ?? "") : null;
}

async function queryLatestProvider(
  db: Queryable,
  group: HomeServiceGroup,
): Promise<HomeProvider | null> {
  const firstMedia = db
    .select({
      storageKey: providerMedia.storageKey,
      altText: providerMedia.altText,
    })
    .from(providerMedia)
    .where(eq(providerMedia.providerId, serviceProviders.id))
    .orderBy(asc(providerMedia.sortOrder), asc(providerMedia.createdAt))
    .limit(1)
    .as("first_media");

  const [row] = await db
    .select({
      id: serviceProviders.id,
      slug: serviceProviders.slug,
      type: serviceProviders.type,
      name: serviceProviders.name,
      cityName: cities.name,
      storageKey: firstMedia.storageKey,
      altText: firstMedia.altText,
    })
    .from(serviceProviders)
    .innerJoin(cities, eq(cities.id, serviceProviders.cityId))
    .leftJoinLateral(firstMedia, sql`true`)
    .where(
      and(
        eq(serviceProviders.isActive, true),
        inArray(serviceProviders.type, [...serviceGroupTypes[group]]),
      ),
    )
    .orderBy(desc(serviceProviders.createdAt))
    .limit(1);

  if (!row) return null;
  const { storageKey, altText, ...provider } = row;
  return { ...provider, image: toImage(storageKey, altText) };
}

export async function queryHomepageData(
  db: Queryable,
  locale: string,
): Promise<HomepageData> {
  const [categoryRows, cityRows, listingRows, grooming, boarding] =
    await Promise.all([
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
        .limit(4),
      queryLatestProvider(db, "grooming"),
      queryLatestProvider(db, "boarding"),
    ]);

  return {
    categories: categoryRows,
    cities: cityRows,
    listings: listingRows.map(({ image, imageAlt, ...listing }) => ({
      ...listing,
      image: toImage(image, imageAlt),
    })),
    services: { grooming, boarding },
  };
}

export const getHomepageData = cache(
  async (locale: string): Promise<HomepageData> => {
    if (isDemoModeEnabled()) return demoHomepageData;
    return queryHomepageData(getDatabase(), locale);
  },
);
