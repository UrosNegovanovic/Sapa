-- Diacritic-insensitive search keys. Mirrors lib/text/normalize.ts:
-- đ/Đ -> dj, strip diacritics, lowercase, collapse non [a-z0-9] runs to one space.
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.normalize_search_text(value text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  STRICT
  PARALLEL SAFE
RETURN btrim(
  regexp_replace(
    lower(
      public.unaccent(
        'public.unaccent'::regdictionary,
        replace(replace(normalize(value, NFC), 'đ', 'dj'), 'Đ', 'Dj')
      )
    ),
    '[^a-z0-9]+',
    ' ',
    'g'
  )
);--> statement-breakpoint
DROP INDEX "breed_translation_name_trgm_idx";--> statement-breakpoint
DROP INDEX "species_translation_name_trgm_idx";--> statement-breakpoint
ALTER TABLE "breed_aliases" drop column "normalized_alias";--> statement-breakpoint
ALTER TABLE "breed_aliases" ADD COLUMN "normalized_alias" text GENERATED ALWAYS AS (normalize_search_text("alias")) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "breed_translations" ADD COLUMN "search_name" text GENERATED ALWAYS AS (normalize_search_text("name")) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "cities" ADD COLUMN "search_name" text GENERATED ALWAYS AS (normalize_search_text("name")) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "species_translations" ADD COLUMN "search_name" text GENERATED ALWAYS AS (normalize_search_text("name")) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX "breed_translation_search_name_trgm_idx" ON "breed_translations" USING gin ("search_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "cities_search_name_trgm_idx" ON "cities" USING gin ("search_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "species_translation_search_name_trgm_idx" ON "species_translations" USING gin ("search_name" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_slug_ascii" CHECK ("breeds"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_slug_ascii" CHECK ("cities"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_slug_ascii" CHECK ("listings"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_slug_ascii" CHECK ("municipalities"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_slug_ascii" CHECK ("service_providers"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_slug_ascii" CHECK ("species"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
CREATE UNIQUE INDEX "breed_aliases_breed_locale_alias_unique" ON "breed_aliases" USING btree ("breed_id","locale","normalized_alias");--> statement-breakpoint
CREATE INDEX "breed_aliases_normalized_trgm_idx" ON "breed_aliases" USING gin ("normalized_alias" gin_trgm_ops);
