/**
 * DEMO CONTENT — remove before public launch.
 *
 * Every piece of homepage content that is not backed by the database lives in
 * this module, so removing demo content means deleting this file, its imports,
 * and the `images.unsplash.com` entry in `next.config.ts`.
 *
 * - `demoHomepageData` is served only when `USE_DEMO_DATA=true` (Playwright and
 *   UI-only builds). There is no automatic fallback when the database is empty
 *   or unreachable.
 * - `temporaryHeroImage` is a placeholder photo until a licensed, locally
 *   hosted hero asset is added under `public/`.
 * - Database demo rows are created by `db/seed.ts` and are titled "Primer …".
 */
import type { HomepageData } from "@/features/home/data";
import type { ImageAsset } from "@/lib/images/source";

const unsplash = (photo: string, width: number) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=80`;

export function isDemoModeEnabled() {
  return process.env.USE_DEMO_DATA === "true";
}

export const temporaryHeroImage = {
  src: unsplash("photo-1583337130417-3346a1be7dee", 1400),
  width: 1400,
  height: 1050,
} as const;

const demoImage = (photo: string, alt: string, width = 900): ImageAsset => ({
  src: unsplash(photo, width),
  alt,
});

export const demoHomepageData: HomepageData = {
  categories: [
    { id: "demo-dog", slug: "pas", name: "Psi" },
    { id: "demo-cat", slug: "macka", name: "Mačke" },
    { id: "demo-bird", slug: "ptica", name: "Ptice" },
    { id: "demo-rodent", slug: "glodar", name: "Glodari" },
    { id: "demo-fish", slug: "riba", name: "Akvaristika" },
    { id: "demo-reptile", slug: "gmizavac", name: "Teraristika" },
    { id: "demo-horse", slug: "konj", name: "Konji" },
    { id: "demo-farm", slug: "farmska-zivotinja", name: "Farmske životinje" },
  ],
  cities: [
    { id: "demo-belgrade", name: "Beograd", slug: "beograd" },
    { id: "demo-novi-sad", name: "Novi Sad", slug: "novi-sad" },
    { id: "demo-nis", name: "Niš", slug: "nis" },
  ],
  listings: [
    {
      id: "demo-listing-1",
      slug: "primer-oglasa-zlatni-retriver",
      title: "Primer oglasa — zlatni retriver",
      speciesName: "Pas",
      breedName: "Zlatni retriver",
      cityName: "Beograd",
      type: "sale",
      sex: "male",
      approximateAgeMonths: 3,
      image: demoImage(
        "photo-1552053831-71594a27632d",
        "Zlatni retriver u prirodi",
      ),
    },
    {
      id: "demo-listing-2",
      slug: "primer-oglasa-domaca-macka",
      title: "Primer oglasa — domaća mačka",
      speciesName: "Mačka",
      breedName: "Domaća mačka",
      cityName: "Novi Sad",
      type: "adoption",
      sex: "female",
      approximateAgeMonths: 5,
      image: demoImage(
        "photo-1574158622682-e40e69881006",
        "Crno-bela domaća mačka",
      ),
    },
    {
      id: "demo-listing-3",
      slug: "primer-oglasa-francuski-buldog",
      title: "Primer oglasa — francuski buldog",
      speciesName: "Pas",
      breedName: "Francuski buldog",
      cityName: "Niš",
      type: "wanted",
      sex: "unknown",
      approximateAgeMonths: 12,
      image: demoImage("photo-1583337130417-3346a1be7dee", "Francuski buldog"),
    },
    {
      id: "demo-listing-4",
      slug: "primer-oglasa-mesanac",
      title: "Primer oglasa — mešanac",
      speciesName: "Pas",
      breedName: "Mešanac",
      cityName: "Subotica",
      type: "adoption",
      sex: "male",
      approximateAgeMonths: 7,
      image: demoImage("photo-1543466835-00a7907e9de1", "Mladi pas mešanac"),
    },
  ],
  services: {
    grooming: {
      id: "demo-provider-1",
      slug: "primer-salona",
      type: "grooming",
      name: "Primer salona",
      cityName: "Novi Sad",
      image: demoImage("photo-1516734212186-a967f81ad0d7", "", 1200),
    },
    boarding: {
      id: "demo-provider-2",
      slug: "primer-smestaja",
      type: "boarding_hotel",
      name: "Primer smeštaja",
      cityName: "Beograd",
      image: demoImage("photo-1601758228041-f3b2795255f1", "", 1200),
    },
  },
};
