# Future data model

These models were drafted during Phase 0 and removed from the executable schema so the initial migration only contains foundation tables. They are design notes, not commitments: each one gets a new migration, plus a privacy and threat-model review for sensitive data, when its phase starts (see [`ROADMAP.md`](ROADMAP.md)).

All tables below would use the shared `created_at` / `updated_at` audit columns unless noted.

## Authentication (phase: authentication)

Shaped for Better Auth; confirm against the library version in use before generating.

- **session**: `id`, `token` (unique), `expires_at`, `ip_address`, `user_agent`, `user_id → user` (cascade). Index on `user_id`.
- **account**: `id`, `account_id`, `provider_id`, `user_id → user` (cascade), access/refresh/id tokens and their expiry, `scope`, `password`. Unique `(provider_id, account_id)`, index on `user_id`.
- **verification**: `id`, `identifier`, `value`, `expires_at`. Index on `identifier`.

## Profiles and seller verification (phase: authentication, profiles, seller verification)

- **user_profiles**: `user_id` (PK → user, cascade), `display_name`, `bio`, `city_id → cities`, `locale` (default `sr-Latn`).
- **seller_profiles**: `user_id` (PK → user, cascade), `slug` (unique, ASCII), `verification_status`, `verified_at`, `public_description`.
- **breeder_profiles**: `user_id` (PK → seller_profiles, cascade), `registry_name`, `registry_number`, `years_active`.
- **verification_documents**: `id`, `user_id → user` (cascade), `type` (`identity`, `breeder_registration`, `pedigree`, `business_registration`, `other`), `storage_key` (private storage only), `status`, `reviewed_by → user`, `reviewed_at`, `expires_at`. Index on `(user_id, status)`.

Privacy note: documents stay out of public storage and public queries; retention and deletion rules are decided in the threat-model review.

## Favorites, conversations, reports and moderation (phase: conversations, favorites, reports, moderation)

- **favorites**: PK `(user_id, listing_id)`, both cascade, `created_at` only.
- **conversations**: `id`, `context` (`listing`, `booking`, `other`), optional `listing_id`, optional `booking_id`.
- **conversation_participants**: PK `(conversation_id, user_id)`, `last_read_at`, `joined_at`. Index on `user_id`.
- **messages**: `id`, `conversation_id` (cascade), `sender_id → user`, `body`, `created_at`, `edited_at`, `deleted_at`. Index on `(conversation_id, created_at)`.
- **reports**: `id`, `reporter_id`, `reason` (`scam`, `animal_welfare`, `misleading`, `prohibited_content`, `harassment`, `other`), `status` (`open`, `reviewing`, `resolved`, `dismissed`), `details`, exactly one target of listing, user, provider or message (`num_nonnulls(...) = 1` check), `resolved_at`. Index on `(status, created_at)`.
- **moderation_actions**: `id`, optional `report_id`, `moderator_id`, `type` (`warn`, `hide_listing`, `reject_listing`, `suspend_user`, `verify_seller`, `remove_content`), `reason`, `metadata` jsonb, `created_at`. Append-only for auditability. Index on `(report_id, created_at)`.

## Bookings (phase: grooming and boarding booking flows)

- **provider_services**: `id`, `provider_id` (cascade), `name`, `description`, `duration_minutes` (> 0), `price` (≥ 0), `currency`, `price_unit` (`fixed`, `from`, `per_hour`, `per_day`), `is_active`, `sort_order`.
- **bookings**: `id`, `provider_id`, optional `service_id`, `customer_id`, `type` (`grooming`, `boarding`), `status` (`requested`, `confirmed`, `in_progress`, `completed`, `cancelled`, `rejected`, `no_show`), `starts_at`, `ends_at` (check `ends_at > starts_at`), `pet_count` (> 0), `notes`, `completed_at`, `cancelled_at`. Indexes on `(provider_id, starts_at, ends_at)` and `(customer_id, status)`. Capacity enforcement (for example an exclusion constraint) is decided with the booking concurrency policy.

## Reviews (phase: reviews)

- **verified_interactions**: `id`, `listing_id`, `seller_id`, `buyer_id`, `type` (`purchase`, `adoption`, `stud`, `other`), `verified_at`. Unique `(listing_id, buyer_id)`.
- **reviews**: `id`, `author_id`, `target` (`seller`, `provider`), exactly one of `seller_id` / `provider_id`, exactly one piece of evidence (`booking_id` or `verified_interaction_id`), `rating` 1–5, `title`, `body`, `published_at`. Partial unique indexes so one booking or interaction permits at most one review.

## Compliance and legal declarations (phase: before listing creation reaches production)

- **legal_requirements**: `id`, `country_id`, optional `species_id`, optional `listing_type`, `scope` (`listing`, `seller`, `animal`, `service_provider`), `locale`, `title`, `description`, `source_url`, `effective_from`, `effective_to`, `is_active`. Index on `(country_id, species_id, listing_type, is_active)`.
- **listing_declarations**: PK `(listing_id, requirement_id)`, `acknowledged_by → user`, `acknowledged_at`.

Requirements are scoped per country; the content itself needs legal validation and is never invented in seed data.

## Payments and notifications

Not drafted yet. They are designed from scratch when their phase starts.
