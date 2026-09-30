import {
  Bird,
  Cat,
  CheckCircle2,
  Dog,
  Fish,
  HeartHandshake,
  PawPrint,
  Rat,
  Scissors,
  Search,
  ShieldCheck,
  Turtle,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { CategoryTile } from "@/components/ui/category-tile";
import { ListingCard } from "@/components/ui/listing-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getHomepageData } from "@/features/home/data";
import { temporaryHeroImage } from "@/features/home/demo-content";
import { SearchTabs } from "@/features/search/search-tabs";
import messages from "@/i18n/messages/sr-Latn.json";
import { Link } from "@/i18n/navigation";

// Homepage content is public and identical for every visitor, so the page is
// statically rendered and regenerated at most every five minutes.
export const revalidate = 300;

const categoryIcons = {
  pas: Dog,
  macka: Cat,
  ptica: Bird,
  glodar: Rat,
  riba: Fish,
  gmizavac: Turtle,
  konj: PawPrint,
} as const;

const categoryColors = ["bg-peach", "bg-mint", "bg-sky", "bg-butter"] as const;

function listingMeta(sex: string, age: string) {
  return [sex, age].filter(Boolean).join(" · ");
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    data,
    hero,
    search,
    categoriesT,
    listingsT,
    services,
    how,
    trust,
    seller,
  ] = await Promise.all([
    getHomepageData(locale),
    getTranslations("Hero"),
    getTranslations("Search"),
    getTranslations("Categories"),
    getTranslations("Listings"),
    getTranslations("Services"),
    getTranslations("HowItWorks"),
    getTranslations("Trust"),
    getTranslations("SellerCta"),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: messages.Header.brand,
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pretraga?vrsta={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-cream overflow-hidden py-8 sm:py-20 lg:py-24">
        <div className="page-shell grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="bg-butter text-action-strong inline-flex min-h-8 items-center gap-2 rounded-full px-4 text-sm font-bold">
              <HeartHandshake aria-hidden="true" className="size-4" />
              {hero("eyebrow")}
            </p>
            <h1 className="font-heading text-ink mt-4 max-w-3xl text-[2.5rem] leading-[1.04] font-bold tracking-tight sm:mt-6 sm:text-6xl lg:text-7xl">
              {hero.rich("title", {
                highlight: (chunks) => (
                  <span className="text-action">{chunks}</span>
                ),
              })}
            </h1>
            <p className="text-coffee mt-4 max-w-2xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8">
              {hero("description")}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:row-span-2">
            <div className="bg-butter absolute -inset-3 rotate-3 rounded-[2.5rem] sm:-inset-5" />
            <div className="shadow-warm relative aspect-[16/10] overflow-hidden rounded-[2rem] sm:aspect-[4/3]">
              <Image
                src={temporaryHeroImage.src}
                alt={hero("imageAlt")}
                fill
                loading="eager"
                sizes="(min-width: 640px) 576px, calc(100vw - 2rem)"
                className="object-cover"
              />
            </div>
          </div>
          <div className="rounded-card border-border shadow-warm border bg-white p-4 sm:p-6">
            <SearchTabs categories={data.categories} cities={data.cities} />
          </div>
        </div>
        <div className="page-shell mt-6 flex items-center gap-2 overflow-x-auto pb-1 text-sm sm:mt-8 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <span className="text-ink mr-2 shrink-0 font-bold">
            {search("popular")}:
          </span>
          {[
            [search("popularDogs"), "/pretraga?vrsta=pas&rasa=&grad="],
            [search("popularCats"), "/pretraga?vrsta=macka&rasa=&grad="],
            [
              search("popularGrooming"),
              "/pretraga?vrsta=salon&rasa=&grad=beograd",
            ],
            [
              search("popularBoarding"),
              "/pretraga?vrsta=smestaj&rasa=&grad=novi-sad",
            ],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="border-border text-coffee hover:border-brand/30 hover:text-brand inline-flex min-h-11 shrink-0 items-center rounded-full border bg-white px-4 font-semibold"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="page-shell">
          <SectionHeader
            title={categoriesT("title")}
            description={categoriesT("description")}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
            {data.categories.map((category, index) => {
              const Icon =
                categoryIcons[category.slug as keyof typeof categoryIcons] ??
                PawPrint;
              return (
                <CategoryTile
                  key={category.id}
                  href={`/pretraga?vrsta=${category.slug}&rasa=&grad=`}
                  icon={<Icon className="size-6" />}
                  label={category.name}
                  className={categoryColors[index % categoryColors.length]}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="page-shell">
          <SectionHeader
            title={listingsT("title")}
            description={listingsT("description")}
            action={{ href: "/pretraga", label: listingsT("viewAll") }}
          />
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-7">
            {["all", "sale", "adoption", "wanted", "stud"].map(
              (filter, index) => (
                <Link
                  key={filter}
                  href={
                    filter === "all"
                      ? "/pretraga"
                      : `/pretraga?vrsta=&rasa=&grad=&tip=${filter}`
                  }
                  className={
                    index === 0
                      ? "bg-brand inline-flex min-h-11 min-w-max items-center rounded-full px-4 text-sm font-bold text-white"
                      : "border-border text-coffee hover:text-brand inline-flex min-h-11 min-w-max items-center rounded-full border bg-white px-4 text-sm font-bold"
                  }
                >
                  {listingsT(filter)}
                </Link>
              ),
            )}
          </div>
          {data.listings.length ? (
            <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {data.listings.map((listing) => {
                const age = listing.approximateAgeMonths
                  ? listingsT("ageMonths", {
                      count: listing.approximateAgeMonths,
                    })
                  : listing.speciesName;
                return (
                  <ListingCard
                    key={listing.id}
                    href="#"
                    image={listing.image}
                    title={listing.title}
                    breed={listing.breedName ?? listing.speciesName}
                    meta={listingMeta(listingsT(listing.sex), age)}
                    location={listing.cityName}
                    priceLabel={
                      listing.type === "adoption"
                        ? listingsT("adoptionPrice")
                        : listingsT("priceOnRequest")
                    }
                    favoriteLabel={listingsT("favorite")}
                    className="w-[80%] shrink-0 snap-start sm:w-auto"
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-card border-border border border-dashed bg-white p-10 text-center">
              <PawPrint
                aria-hidden="true"
                className="text-brand mx-auto size-9"
              />
              <h3 className="font-heading mt-4 text-2xl font-bold">
                {listingsT("emptyTitle")}
              </h3>
              <p className="text-coffee mt-2">
                {listingsT("emptyDescription")}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-footer text-white">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-highlight font-bold tracking-wide uppercase">
              {services("eyebrow")}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-bold sm:text-5xl">
              {services("title")}
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              {services("description")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-2">
            {[
              {
                type: "grooming",
                title: services("groomingTitle"),
                description: services("groomingDescription"),
                action: services("groomingAction"),
                href: "/pretraga?vrsta=salon&rasa=&grad=",
                icon: Scissors,
                image: data.services.grooming?.image ?? null,
                accent: "text-mint",
              },
              {
                type: "boarding",
                title: services("boardingTitle"),
                description: services("boardingDescription"),
                action: services("boardingAction"),
                href: "/pretraga?vrsta=smestaj&rasa=&grad=",
                icon: PawPrint,
                image: data.services.boarding?.image ?? null,
                accent: "text-highlight",
              },
            ].map((service) => (
              <article
                key={service.type}
                className="rounded-card grid overflow-hidden border border-white/15 bg-white/5 sm:min-h-80 sm:grid-cols-[0.92fr_1.08fr]"
              >
                <div className="flex flex-col justify-center p-6 sm:p-9">
                  <service.icon
                    aria-hidden="true"
                    className={`size-8 ${service.accent}`}
                  />
                  <h3 className="font-heading mt-4 text-2xl font-bold sm:mt-5 sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 leading-7 text-white/70">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className={`mt-5 inline-flex min-h-11 items-center font-bold ${service.accent}`}
                  >
                    {service.action}
                  </Link>
                </div>
                <div className="bg-brand/30 relative min-h-40 sm:min-h-64">
                  {service.image ? (
                    <Image
                      src={service.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, calc(100vw - 2rem)"
                      className="object-cover opacity-80"
                    />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kako-funkcionise" className="section-padding bg-white">
        <div className="page-shell">
          <SectionHeader
            title={how("title")}
            description={how("description")}
          />
          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {[
              [Search, how("stepOneTitle"), how("stepOneDescription")],
              [UserCheck, how("stepTwoTitle"), how("stepTwoDescription")],
              [
                HeartHandshake,
                how("stepThreeTitle"),
                how("stepThreeDescription"),
              ],
            ].map(([Icon, title, description], index) => {
              const StepIcon = Icon as typeof Search;
              return (
                <article
                  key={String(title)}
                  className="rounded-card border-border bg-cream border p-6 sm:p-7"
                >
                  <span className="bg-mint text-brand flex size-12 items-center justify-center rounded-2xl">
                    <StepIcon aria-hidden="true" className="size-6" />
                  </span>
                  <p className="text-action mt-4 text-sm font-extrabold sm:mt-6">
                    0{index + 1}
                  </p>
                  <h3 className="font-heading mt-2 text-2xl font-bold">
                    {String(title)}
                  </h3>
                  <p className="text-coffee mt-3 leading-7">
                    {String(description)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="poverenje" className="section-padding bg-mint/65">
        <div className="page-shell grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-action-strong font-bold tracking-wide uppercase">
              {trust("eyebrow")}
            </p>
            <h2 className="font-heading text-ink mt-3 text-3xl font-bold sm:text-5xl">
              {trust("title")}
            </h2>
            <p className="text-coffee mt-4 max-w-xl text-base leading-7 sm:mt-5 sm:text-lg sm:leading-8">
              {trust("description")}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {[
              [CheckCircle2, trust("health")],
              [ShieldCheck, trust("verification")],
              [HeartHandshake, trust("reporting")],
            ].map(([Icon, label]) => {
              const TrustIcon = Icon as typeof CheckCircle2;
              return (
                <div
                  key={String(label)}
                  className="rounded-card shadow-soft flex min-h-16 items-center gap-4 bg-white p-4 sm:min-h-20 sm:p-5"
                >
                  <TrustIcon
                    aria-hidden="true"
                    className="text-brand size-6 shrink-0"
                  />
                  <p className="text-ink font-bold">{String(label)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="prodavci" className="section-padding bg-peach">
        <div className="page-shell shadow-warm rounded-[2rem] bg-white p-6 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-action font-bold tracking-wide uppercase">
              {seller("eyebrow")}
            </p>
            <h2 className="font-heading text-ink mt-3 text-3xl font-bold sm:text-4xl">
              {seller("title")}
            </h2>
            <p className="text-coffee mt-4 text-base leading-7 sm:text-lg sm:leading-8">
              {seller("description")}
            </p>
          </div>
          <Link
            href="#kako-funkcionise"
            className={buttonVariants({
              variant: "secondary",
              className: "mt-7 shrink-0 lg:mt-0",
            })}
          >
            {seller("action")}
          </Link>
        </div>
      </section>
    </main>
  );
}
