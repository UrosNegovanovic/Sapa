import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/db/schema";
import {
  breedAliases,
  breeds,
  breedTranslations,
  cities,
  species,
  speciesTranslations,
} from "@/db/schema";
import { normalizeSearchText } from "@/lib/text/normalize";

type Database = PostgresJsDatabase<typeof schema>;

export type TaxonomyMatch = { id: string; slug: string; name: string };

const DEFAULT_LIMIT = 10;

/**
 * Substring match (`LIKE`) plus trigram similarity (`%`) on a normalized
 * column. Both operators are served by the column's `gin_trgm_ops` index.
 * `query` is already normalized, so it only contains `[a-z0-9 ]` and needs no
 * LIKE escaping.
 */
function matchesNormalized(column: PgColumn, query: string): SQL {
  return sql`(${column} like ${`%${query}%`} or ${column} % ${query})`;
}

/** Exact, then prefix, then most similar. */
function rankNormalized(column: PgColumn | SQL, query: string): SQL[] {
  return [
    desc(sql`${column} = ${query}`),
    desc(sql`${column} like ${`${query}%`}`),
    desc(sql`similarity(${column}, ${query})`),
  ];
}

export async function searchSpecies(
  db: Database,
  input: { locale: string; query: string; limit?: number },
): Promise<TaxonomyMatch[]> {
  const query = normalizeSearchText(input.query);
  if (!query) return [];

  return db
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
        eq(speciesTranslations.locale, input.locale),
      ),
    )
    .where(
      and(
        eq(species.isActive, true),
        matchesNormalized(speciesTranslations.searchName, query),
      ),
    )
    .orderBy(
      ...rankNormalized(speciesTranslations.searchName, query),
      asc(species.sortOrder),
    )
    .limit(input.limit ?? DEFAULT_LIMIT);
}

export async function searchBreeds(
  db: Database,
  input: {
    locale: string;
    query: string;
    speciesId?: string;
    limit?: number;
  },
): Promise<TaxonomyMatch[]> {
  const query = normalizeSearchText(input.query);
  if (!query) return [];

  const aliasFilter = and(
    eq(breedAliases.breedId, breeds.id),
    eq(breedAliases.locale, input.locale),
  );
  const aliasMatches = sql`exists (
    select 1 from ${breedAliases}
    where ${aliasFilter} and ${matchesNormalized(breedAliases.normalizedAlias, query)}
  )`;
  // Best key among the translated name and its aliases, used for ranking.
  const bestKey = sql`coalesce((
    select ${breedAliases.normalizedAlias} from ${breedAliases}
    where ${aliasFilter}
    order by similarity(${breedAliases.normalizedAlias}, ${query}) desc
    limit 1
  ), '')`;
  const rankKey = sql`case
    when similarity(${breedTranslations.searchName}, ${query})
      >= similarity(${bestKey}, ${query})
    then ${breedTranslations.searchName}
    else ${bestKey}
  end`;

  return db
    .select({
      id: breeds.id,
      slug: breeds.slug,
      name: breedTranslations.name,
    })
    .from(breeds)
    .innerJoin(
      breedTranslations,
      and(
        eq(breedTranslations.breedId, breeds.id),
        eq(breedTranslations.locale, input.locale),
      ),
    )
    .where(
      and(
        eq(breeds.isActive, true),
        input.speciesId ? eq(breeds.speciesId, input.speciesId) : undefined,
        sql`(${matchesNormalized(breedTranslations.searchName, query)} or ${aliasMatches})`,
      ),
    )
    .orderBy(...rankNormalized(rankKey, query), asc(breeds.sortOrder))
    .limit(input.limit ?? DEFAULT_LIMIT);
}

export async function searchCities(
  db: Database,
  input: { query: string; limit?: number },
): Promise<TaxonomyMatch[]> {
  const query = normalizeSearchText(input.query);
  if (!query) return [];

  return db
    .select({ id: cities.id, slug: cities.slug, name: cities.name })
    .from(cities)
    .where(
      and(
        eq(cities.isActive, true),
        matchesNormalized(cities.searchName, query),
      ),
    )
    .orderBy(...rankNormalized(cities.searchName, query), asc(cities.sortOrder))
    .limit(input.limit ?? DEFAULT_LIMIT);
}
