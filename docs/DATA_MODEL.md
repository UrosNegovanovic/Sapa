# Data model

## Principles

- Species, breeds, translations, and aliases are rows—not source-code enums.
- Public, private, and moderation data have separate ownership boundaries.
- Listings retain explicit lifecycle timestamps for moderation and SEO.
- Reviews require a completed booking or verified marketplace interaction.
- Legal requirements are scoped by country, species, and listing type.

```mermaid
erDiagram
  COUNTRIES ||--o{ MUNICIPALITIES : contains
  MUNICIPALITIES ||--o{ CITIES : contains
  SPECIES ||--o{ SPECIES_TRANSLATIONS : names
  SPECIES ||--o{ BREEDS : groups
  BREEDS ||--o{ BREED_TRANSLATIONS : names
  BREEDS ||--o{ BREED_ALIASES : searchable_as
  USERS ||--|| USER_PROFILES : has
  USERS ||--o| SELLER_PROFILES : sells_as
  SELLER_PROFILES ||--o| BREEDER_PROFILES : specializes_as
  USERS ||--o{ LISTINGS : owns
  SPECIES ||--o{ LISTINGS : classifies
  BREEDS ||--o{ LISTINGS : classifies
  CITIES ||--o{ LISTINGS : located_in
  LISTINGS ||--o{ LISTING_MEDIA : presents
  USERS ||--o{ SERVICE_PROVIDERS : owns
  SERVICE_PROVIDERS ||--o{ PROVIDER_SERVICES : offers
  SERVICE_PROVIDERS ||--o{ BOOKINGS : receives
  USERS ||--o{ BOOKINGS : requests
  BOOKINGS ||--o| REVIEWS : permits
  VERIFIED_INTERACTIONS ||--o| REVIEWS : permits
  USERS ||--o{ FAVORITES : saves
  LISTINGS ||--o{ FAVORITES : saved_by
  CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : includes
  CONVERSATIONS ||--o{ MESSAGES : contains
  REPORTS ||--o{ MODERATION_ACTIONS : results_in
  LEGAL_REQUIREMENTS ||--o{ LISTING_DECLARATIONS : acknowledged_by
```

## Important indexes and constraints

- Unique slugs for public listings and providers.
- Unique `(species_id, slug)` breeds and `(entity_id, locale)` translations.
- Trigram GIN indexes for translated taxonomy names and aliases.
- Partial listing feed index over active records ordered by publication time.
- Composite filter indexes for status/type/species/breed/city.
- Unique favorites and conversation participants.
- Checks for prices, ratings, date ranges, review evidence, and report targets.
- GIST-friendly booking date fields are present; hard capacity enforcement is deferred until booking implementation.

See `db/schema/` for the executable source of truth.
