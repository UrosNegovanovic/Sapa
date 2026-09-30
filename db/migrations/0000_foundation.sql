CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE TYPE "public"."animal_sex" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."animal_size" AS ENUM('xs', 's', 'm', 'l', 'xl', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('RSD', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending', 'active', 'sold', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'adoption', 'stud', 'wanted');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('grooming', 'boarding_hotel', 'home_sitter');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended');--> statement-breakpoint
CREATE TABLE "breed_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"breed_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"alias" text NOT NULL,
	"normalized_alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breed_translations" (
	"breed_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "breed_translations_breed_id_locale_pk" PRIMARY KEY("breed_id","locale")
);
--> statement-breakpoint
CREATE TABLE "breeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"municipality_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"default_currency" "currency" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"storage_key" text NOT NULL,
	"alt_text" text NOT NULL,
	"width" integer,
	"height" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"species_id" uuid NOT NULL,
	"breed_id" uuid,
	"city_id" uuid NOT NULL,
	"type" "listing_type" NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"sex" "animal_sex" DEFAULT 'unknown' NOT NULL,
	"birth_date" date,
	"approximate_age_months" integer,
	"size" "animal_size" DEFAULT 'unknown' NOT NULL,
	"color" text,
	"pedigree" boolean,
	"microchipped" boolean,
	"vaccinated" boolean,
	"dewormed" boolean,
	"health_notes" text,
	"passport" boolean,
	"price" numeric(12, 2),
	"currency" "currency" DEFAULT 'RSD' NOT NULL,
	"negotiable" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"sold_at" timestamp with time zone,
	"search_document" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug"),
	CONSTRAINT "listings_price_non_negative" CHECK ("listings"."price" is null or "listings"."price" >= 0),
	CONSTRAINT "listings_age_non_negative" CHECK ("listings"."approximate_age_months" is null or "listings"."approximate_age_months" >= 0)
);
--> statement-breakpoint
CREATE TABLE "municipalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"alt_text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"city_id" uuid NOT NULL,
	"type" "provider_type" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"address_line" text,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"public_email" text,
	"public_phone" text,
	"opening_hours" jsonb,
	"capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_providers_slug_unique" UNIQUE("slug"),
	CONSTRAINT "service_providers_capacity_positive" CHECK ("service_providers"."capacity" is null or "service_providers"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "species_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "species_translations" (
	"species_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "species_translations_species_id_locale_pk" PRIMARY KEY("species_id","locale")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "breed_aliases" ADD CONSTRAINT "breed_aliases_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breed_translations" ADD CONSTRAINT "breed_translations_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_media" ADD CONSTRAINT "provider_media_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species_translations" ADD CONSTRAINT "species_translations_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "breed_aliases_breed_locale_alias_unique" ON "breed_aliases" USING btree ("breed_id","locale","normalized_alias");--> statement-breakpoint
CREATE INDEX "breed_aliases_normalized_trgm_idx" ON "breed_aliases" USING gin ("normalized_alias" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "breed_translation_name_trgm_idx" ON "breed_translations" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "breeds_species_slug_unique" ON "breeds" USING btree ("species_id","slug");--> statement-breakpoint
CREATE INDEX "breeds_species_active_sort_idx" ON "breeds" USING btree ("species_id","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "cities_municipality_slug_unique" ON "cities" USING btree ("municipality_id","slug");--> statement-breakpoint
CREATE INDEX "cities_active_sort_idx" ON "cities" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "listing_media_listing_sort_idx" ON "listing_media" USING btree ("listing_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_media_one_primary_idx" ON "listing_media" USING btree ("listing_id") WHERE "listing_media"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "listings_active_feed_idx" ON "listings" USING btree ("published_at" DESC NULLS LAST) WHERE "listings"."status" = 'active';--> statement-breakpoint
CREATE INDEX "listings_filter_idx" ON "listings" USING btree ("status","type","species_id","breed_id","city_id");--> statement-breakpoint
CREATE INDEX "listings_search_gin_idx" ON "listings" USING gin (to_tsvector('simple', coalesce("search_document", '')));--> statement-breakpoint
CREATE UNIQUE INDEX "municipalities_country_slug_unique" ON "municipalities" USING btree ("country_id","slug");--> statement-breakpoint
CREATE INDEX "provider_media_provider_sort_idx" ON "provider_media" USING btree ("provider_id","sort_order");--> statement-breakpoint
CREATE INDEX "service_providers_type_city_active_idx" ON "service_providers" USING btree ("type","city_id","is_active");--> statement-breakpoint
CREATE INDEX "species_active_sort_idx" ON "species" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "species_translation_name_trgm_idx" ON "species_translations" USING gin ("name" gin_trgm_ops);