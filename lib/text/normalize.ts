/**
 * Search and slug normalization shared by the app, the seed, and tests.
 *
 * Must stay equivalent to the `normalize_search_text(text)` SQL function in
 * `db/migrations`, which backs the indexed search columns. The PostgreSQL
 * integration tests assert both produce identical output.
 */

const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSearchText(value: string): string {
  return value
    .replace(/đ/g, "dj")
    .replace(/Đ/g, "Dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  return normalizeSearchText(value).replaceAll(" ", "-");
}

export function isPublicSlug(value: string): boolean {
  return PUBLIC_SLUG_PATTERN.test(value);
}
