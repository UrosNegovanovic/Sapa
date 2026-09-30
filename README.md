# Šapa

Specialized marketplace for pets, adoption, grooming, and boarding in Serbia and the Balkans.

## Local development

1. Install Node.js 24 and enable the pnpm version declared in `package.json`.
2. Copy `.env.example` to `.env.local`.
3. Run `docker compose up -d db`.
4. Run `pnpm db:migrate && pnpm db:seed`.
5. Run `pnpm dev` and open `http://localhost:3000`.

Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` before shipping.

Architecture and data-model decisions are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).
