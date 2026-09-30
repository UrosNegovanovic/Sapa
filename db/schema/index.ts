import { sql } from "drizzle-orm";
import {
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
export const documentTypeEnum = pgEnum("document_type", [
  "identity",
  "breeder_registration",
  "pedigree",
  "business_registration",
  "other",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const providerTypeEnum = pgEnum("provider_type", [
  "grooming",
  "boarding_hotel",
  "home_sitter",
]);
export const priceUnitEnum = pgEnum("price_unit", [
  "fixed",
  "from",
  "per_hour",
  "per_day",
]);
export const bookingTypeEnum = pgEnum("booking_type", ["grooming", "boarding"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
]);
export const interactionTypeEnum = pgEnum("interaction_type", [
  "purchase",
  "adoption",
  "stud",
  "other",
]);
export const reviewTargetEnum = pgEnum("review_target", ["seller", "provider"]);
export const conversationContextEnum = pgEnum("conversation_context", [
  "listing",
  "booking",
  "other",
]);
export const reportReasonEnum = pgEnum("report_reason", [
  "scam",
  "animal_welfare",
  "misleading",
  "prohibited_content",
  "harassment",
  "other",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
]);
export const moderationActionTypeEnum = pgEnum("moderation_action_type", [
  "warn",
  "hide_listing",
  "reject_listing",
  "suspend_user",
  "verify_seller",
  "remove_content",
]);
export const legalRequirementScopeEnum = pgEnum("legal_requirement_scope", [
  "listing",
  "seller",
  "animal",
  "service_provider",
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

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...auditColumns,
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...auditColumns,
  },
  (table) => [
    index("accounts_user_idx").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...auditColumns,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

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
    description: text("description"),
  },
  (table) => [
    primaryKey({ columns: [table.speciesId, table.locale] }),
    index("species_translation_name_trgm_idx").using(
      "gin",
      sql`${table.name} gin_trgm_ops`,
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
    description: text("description"),
  },
  (table) => [
    primaryKey({ columns: [table.breedId, table.locale] }),
    index("breed_translation_name_trgm_idx").using(
      "gin",
      sql`${table.name} gin_trgm_ops`,
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
    normalizedAlias: text("normalized_alias").notNull(),
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

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  cityId: uuid("city_id").references(() => cities.id),
  locale: text("locale").default("sr-Latn").notNull(),
  ...auditColumns,
});

export const sellerProfiles = pgTable("seller_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  verificationStatus: verificationStatusEnum("verification_status")
    .default("unverified")
    .notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  publicDescription: text("public_description"),
  ...auditColumns,
});

export const breederProfiles = pgTable("breeder_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => sellerProfiles.userId, { onDelete: "cascade" }),
  registryName: text("registry_name"),
  registryNumber: text("registry_number"),
  yearsActive: integer("years_active"),
  ...auditColumns,
});

export const verificationDocuments = pgTable(
  "verification_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    storageKey: text("storage_key").notNull(),
    status: verificationStatusEnum("status").default("pending").notNull(),
    reviewedBy: text("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    expiresAt: date("expires_at"),
    ...auditColumns,
  },
  (table) => [
    index("verification_documents_user_status_idx").on(
      table.userId,
      table.status,
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

export const providerServices = pgTable(
  "provider_services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    durationMinutes: integer("duration_minutes"),
    price: numeric("price", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("RSD").notNull(),
    priceUnit: priceUnitEnum("price_unit").default("fixed").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...auditColumns,
  },
  (table) => [
    check(
      "provider_services_price_non_negative",
      sql`${table.price} is null or ${table.price} >= 0`,
    ),
    check(
      "provider_services_duration_positive",
      sql`${table.durationMinutes} is null or ${table.durationMinutes} > 0`,
    ),
    index("provider_services_provider_active_idx").on(
      table.providerId,
      table.isActive,
      table.sortOrder,
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

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id),
    serviceId: uuid("service_id").references(() => providerServices.id),
    customerId: text("customer_id")
      .notNull()
      .references(() => users.id),
    type: bookingTypeEnum("type").notNull(),
    status: bookingStatusEnum("status").default("requested").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    petCount: integer("pet_count").default(1).notNull(),
    notes: text("notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    check("bookings_valid_range", sql`${table.endsAt} > ${table.startsAt}`),
    check("bookings_pet_count_positive", sql`${table.petCount} > 0`),
    index("bookings_provider_range_idx").on(
      table.providerId,
      table.startsAt,
      table.endsAt,
    ),
    index("bookings_customer_status_idx").on(table.customerId, table.status),
  ],
);

export const verifiedInteractions = pgTable(
  "verified_interactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    type: interactionTypeEnum("type").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("verified_interactions_listing_buyer_unique").on(
      table.listingId,
      table.buyerId,
    ),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    target: reviewTargetEnum("target").notNull(),
    sellerId: text("seller_id").references(() => users.id),
    providerId: uuid("provider_id").references(() => serviceProviders.id),
    bookingId: uuid("booking_id").references(() => bookings.id),
    verifiedInteractionId: uuid("verified_interaction_id").references(
      () => verifiedInteractions.id,
    ),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
    check(
      "reviews_one_target",
      sql`num_nonnulls(${table.sellerId}, ${table.providerId}) = 1`,
    ),
    check(
      "reviews_one_evidence",
      sql`num_nonnulls(${table.bookingId}, ${table.verifiedInteractionId}) = 1`,
    ),
    uniqueIndex("reviews_booking_unique")
      .on(table.bookingId)
      .where(sql`${table.bookingId} is not null`),
    uniqueIndex("reviews_interaction_unique")
      .on(table.verifiedInteractionId)
      .where(sql`${table.verifiedInteractionId} is not null`),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listingId] })],
);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  context: conversationContextEnum("context").default("other").notNull(),
  listingId: uuid("listing_id").references(() => listings.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  ...auditColumns,
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
    index("conversation_participants_user_idx").on(table.userId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id),
    reason: reportReasonEnum("reason").notNull(),
    status: reportStatusEnum("status").default("open").notNull(),
    details: text("details").notNull(),
    listingId: uuid("listing_id").references(() => listings.id),
    reportedUserId: text("reported_user_id").references(() => users.id),
    providerId: uuid("provider_id").references(() => serviceProviders.id),
    messageId: uuid("message_id").references(() => messages.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    check(
      "reports_one_target",
      sql`num_nonnulls(${table.listingId}, ${table.reportedUserId}, ${table.providerId}, ${table.messageId}) = 1`,
    ),
    index("reports_status_created_idx").on(table.status, table.createdAt),
  ],
);

export const moderationActions = pgTable(
  "moderation_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id").references(() => reports.id),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => users.id),
    type: moderationActionTypeEnum("type").notNull(),
    reason: text("reason").notNull(),
    metadata:
      jsonb("metadata").$type<
        Record<string, string | number | boolean | null>
      >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("moderation_actions_report_created_idx").on(
      table.reportId,
      table.createdAt,
    ),
  ],
);

export const legalRequirements = pgTable(
  "legal_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id),
    speciesId: uuid("species_id").references(() => species.id),
    listingType: listingTypeEnum("listing_type"),
    scope: legalRequirementScopeEnum("scope").notNull(),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sourceUrl: text("source_url"),
    effectiveFrom: date("effective_from"),
    effectiveTo: date("effective_to"),
    isActive: boolean("is_active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [
    index("legal_requirements_scope_idx").on(
      table.countryId,
      table.speciesId,
      table.listingType,
      table.isActive,
    ),
  ],
);

export const listingDeclarations = pgTable(
  "listing_declarations",
  {
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    requirementId: uuid("requirement_id")
      .notNull()
      .references(() => legalRequirements.id),
    acknowledgedBy: text("acknowledged_by")
      .notNull()
      .references(() => users.id),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.listingId, table.requirementId] })],
);
