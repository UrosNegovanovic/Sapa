import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

/** Public URL slugs must be lowercase ASCII kebab-case. */
const publicSlugCheck = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`);

/**
 * Diacritic-insensitive search key (`Aranđelovac` -> `arandjelovac`).
 * `normalize_search_text` is defined in the migrations and mirrored by
 * `lib/text/normalize.ts`.
 */
const normalizedColumn = (name: string, sourceColumn: string) =>
  text(name)
    .notNull()
    .generatedAlwaysAs(sql.raw(`normalize_search_text("${sourceColumn}")`));

export const listingTypeEnum = pgEnum("listing_type", [
  "sale",
  "adoption",
  "stud",
  "wanted",
]);
export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "pending",
  "active",
  "sold",
  "expired",
  "rejected",
]);
export const animalSexEnum = pgEnum("animal_sex", [
  "male",
  "female",
  "unknown",
]);
export const animalSizeEnum = pgEnum("animal_size", [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "unknown",
]);
export const currencyEnum = pgEnum("currency", ["RSD", "EUR"]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "suspended",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const providerTypeEnum = pgEnum("provider_type", [
  "grooming",
  "boarding_hotel",
  "home_sitter",
]);
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...auditColumns,
});

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  defaultCurrency: currencyEnum("default_currency").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const municipalities = pgTable(
  "municipalities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [
    publicSlugCheck("municipalities_slug_ascii", table.slug),
    uniqueIndex("municipalities_country_slug_unique").on(
      table.countryId,
      table.slug,
    ),
  ],
);

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    municipalityId: uuid("municipality_id")
      .notNull()
      .references(() => municipalities.id),
    name: text("name").notNull(),
    searchName: normalizedColumn("search_name", "name"),
    slug: text("slug").notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("cities_municipality_slug_unique").on(
      table.municipalityId,
      table.slug,
    ),
    index("cities_active_sort_idx").on(table.isActive, table.sortOrder),
    index("cities_search_name_trgm_idx").using(
      "gin",
      sql`${table.searchName} gin_trgm_ops`,
    ),
    publicSlugCheck("cities_slug_ascii", table.slug),
  ],
);

export const species = pgTable(
  "species",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...auditColumns,
  },
  (table) => [
    index("species_active_sort_idx").on(table.isActive, table.sortOrder),
    publicSlugCheck("species_slug_ascii", table.slug),
  ],
);

export const speciesTranslations = pgTable(
  "species_translations",
  {
    speciesId: uuid("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    searchName: normalizedColumn("search_name", "name"),
    description: text("description"),
  },
  (table) => [
    primaryKey({ columns: [table.speciesId, table.locale] }),
    index("species_translation_search_name_trgm_idx").using(
      "gin",
      sql`${table.searchName} gin_trgm_ops`,
    ),
  ],
);

export const breeds = pgTable(
  "breeds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    speciesId: uuid("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex("breeds_species_slug_unique").on(table.speciesId, table.slug),
    publicSlugCheck("breeds_slug_ascii", table.slug),
    index("breeds_species_active_sort_idx").on(
      table.speciesId,
      table.isActive,
      table.sortOrder,
    ),
  ],
);

export const breedTranslations = pgTable(
  "breed_translations",
  {
    breedId: uuid("breed_id")
      .notNull()
      .references(() => breeds.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    searchName: normalizedColumn("search_name", "name"),
    description: text("description"),
  },
  (table) => [
    primaryKey({ columns: [table.breedId, table.locale] }),
    index("breed_translation_search_name_trgm_idx").using(
      "gin",
      sql`${table.searchName} gin_trgm_ops`,
    ),
  ],
);

export const breedAliases = pgTable(
  "breed_aliases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    breedId: uuid("breed_id")
      .notNull()
      .references(() => breeds.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    alias: text("alias").notNull(),
    normalizedAlias: normalizedColumn("normalized_alias", "alias"),
  },
  (table) => [
    uniqueIndex("breed_aliases_breed_locale_alias_unique").on(
      table.breedId,
      table.locale,
      table.normalizedAlias,
    ),
    index("breed_aliases_normalized_trgm_idx").using(
      "gin",
      sql`${table.normalizedAlias} gin_trgm_ops`,
    ),
  ],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    speciesId: uuid("species_id")
      .notNull()
      .references(() => species.id),
    breedId: uuid("breed_id").references(() => breeds.id),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    type: listingTypeEnum("type").notNull(),
    status: listingStatusEnum("status").default("draft").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    sex: animalSexEnum("sex").default("unknown").notNull(),
    birthDate: date("birth_date"),
    approximateAgeMonths: integer("approximate_age_months"),
    size: animalSizeEnum("size").default("unknown").notNull(),
    color: text("color"),
    pedigree: boolean("pedigree"),
    microchipped: boolean("microchipped"),
    vaccinated: boolean("vaccinated"),
    dewormed: boolean("dewormed"),
    healthNotes: text("health_notes"),
    passport: boolean("passport"),
    price: numeric("price", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("RSD").notNull(),
    negotiable: boolean("negotiable").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    searchDocument: text("search_document"),
    ...auditColumns,
  },
  (table) => [
    publicSlugCheck("listings_slug_ascii", table.slug),
    check(
      "listings_price_non_negative",
      sql`${table.price} is null or ${table.price} >= 0`,
    ),
    check(
      "listings_age_non_negative",
      sql`${table.approximateAgeMonths} is null or ${table.approximateAgeMonths} >= 0`,
    ),
    index("listings_active_feed_idx")
      .on(table.publishedAt.desc())
      .where(sql`${table.status} = 'active'`),
    index("listings_filter_idx").on(
      table.status,
      table.type,
      table.speciesId,
      table.breedId,
      table.cityId,
    ),
    index("listings_search_gin_idx").using(
      "gin",
      sql`to_tsvector('simple', coalesce(${table.searchDocument}, ''))`,
    ),
  ],
);

export const listingMedia = pgTable(
  "listing_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    storageKey: text("storage_key").notNull(),
    altText: text("alt_text").notNull(),
    width: integer("width"),
    height: integer("height"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("listing_media_listing_sort_idx").on(
      table.listingId,
      table.sortOrder,
    ),
    uniqueIndex("listing_media_one_primary_idx")
      .on(table.listingId)
      .where(sql`${table.isPrimary} = true`),
  ],
);

export const serviceProviders = pgTable(
  "service_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    type: providerTypeEnum("type").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    verificationStatus: verificationStatusEnum("verification_status")
      .default("unverified")
      .notNull(),
    addressLine: text("address_line"),
    postalCode: text("postal_code"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    publicEmail: text("public_email"),
    publicPhone: text("public_phone"),
    openingHours:
      jsonb("opening_hours").$type<
        Record<string, Array<{ from: string; to: string }>>
      >(),
    capacity: integer("capacity"),
    isActive: boolean("is_active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [
    publicSlugCheck("service_providers_slug_ascii", table.slug),
    check(
      "service_providers_capacity_positive",
      sql`${table.capacity} is null or ${table.capacity} > 0`,
    ),
    index("service_providers_type_city_active_idx").on(
      table.type,
      table.cityId,
      table.isActive,
    ),
  ],
);

export const providerMedia = pgTable(
  "provider_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    altText: text("alt_text").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("provider_media_provider_sort_idx").on(
      table.providerId,
      table.sortOrder,
    ),
  ],
);
