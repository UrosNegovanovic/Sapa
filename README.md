# Šapa

Specialized marketplace for pets, adoption, grooming, and boarding in Serbia and the Balkans.

## Local development

1. Install Node.js 24 and enable the pnpm version declared in `package.json`.
2. Copy `.env.example` to `.env.local`.
3. Run `docker compose up -d db`.
4. Run `pnpm db:migrate && pnpm db:seed`.
5. Run `pnpm dev` and open `http://localhost:3000`.

PostgreSQL integration tests run when `TEST_DATABASE_URL` is set (for example `postgresql://sapa:sapa@localhost:5432/sapa`); each run creates and drops its own temporary database.

The homepage is statically generated and revalidated every five minutes, so `pnpm build` reads the database: set `DATABASE_URL` to a migrated database, or set `USE_DEMO_DATA=true` for a UI-only build.

### Demo content

Demo content is centralized for easy removal: `features/home/demo-content.ts` holds the homepage fallback data (used only when `USE_DEMO_DATA=true`) and the temporary Unsplash hero photo, and `db/seed.ts` inserts demo rows titled "Primer …". There is no automatic fallback to demo content when the database is empty or unavailable.

Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` before shipping.

Architecture and data-model decisions are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).
