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
import { SearchTabs } from "@/features/search/search-tabs";
import messages from "@/i18n/messages/sr-Latn.json";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

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

      <section className="bg-cream overflow-hidden py-12 sm:py-20 lg:py-24">
        <div className="page-shell grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="bg-butter text-action inline-flex min-h-8 items-center gap-2 rounded-full px-4 text-sm font-bold">
              <HeartHandshake aria-hidden="true" className="size-4" />
              {hero("eyebrow")}
            </p>
            <h1 className="font-heading text-ink mt-6 max-w-3xl text-5xl leading-[1.04] font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {hero.rich("title", {
                highlight: (chunks) => (
                  <span className="text-action">{chunks}</span>
                ),
              })}
            </h1>
            <p className="text-coffee mt-6 max-w-2xl text-lg leading-8">
              {hero("description")}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:row-span-2">
            <div className="bg-butter absolute -inset-5 rotate-3 rounded-[2.5rem]" />
            <div className="shadow-warm relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1400&q=85"
                alt={hero("imageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 560px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="rounded-card border-border shadow-warm border bg-white p-4 sm:p-6">
            <SearchTabs categories={data.categories} cities={data.cities} />
          </div>
        </div>
        <div className="page-shell mt-8 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink mr-2 font-bold">{search("popular")}:</span>
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
              className="border-border text-coffee hover:border-brand/30 hover:text-brand inline-flex min-h-11 items-center rounded-full border bg-white px-4 font-semibold"
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
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
          <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.listings.slice(0, 4).map((listing) => {
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
                    imageAlt={listing.imageAlt}
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
            <h2 className="font-heading mt-3 text-4xl font-bold sm:text-5xl">
              {services("title")}
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              {services("description")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              {
                type: "grooming",
                title: services("groomingTitle"),
                description: services("groomingDescription"),
                action: services("groomingAction"),
                href: "/pretraga?vrsta=salon&rasa=&grad=",
                icon: Scissors,
                image:
                  data.providers.find(
                    (provider) => provider.type === "grooming",
                  )?.image ?? data.providers[0]?.image,
                accent: "text-mint",
              },
              {
                type: "boarding",
                title: services("boardingTitle"),
                description: services("boardingDescription"),
                action: services("boardingAction"),
                href: "/pretraga?vrsta=smestaj&rasa=&grad=",
                icon: PawPrint,
                image:
                  data.providers.find(
                    (provider) => provider.type !== "grooming",
                  )?.image ?? data.providers[1]?.image,
                accent: "text-highlight",
              },
            ].map((service) => (
              <article
                key={service.type}
                className="rounded-card grid min-h-80 overflow-hidden border border-white/15 bg-white/5 sm:grid-cols-[0.92fr_1.08fr]"
              >
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <service.icon
                    aria-hidden="true"
                    className={`size-8 ${service.accent}`}
                  />
                  <h3 className="font-heading mt-5 text-3xl font-bold">
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
                <div className="bg-brand/30 relative min-h-64">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
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
          <div className="grid gap-5 md:grid-cols-3">
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
                  className="rounded-card border-border bg-cream border p-7"
                >
                  <span className="bg-mint text-brand flex size-12 items-center justify-center rounded-2xl">
                    <StepIcon aria-hidden="true" className="size-6" />
                  </span>
                  <p className="text-action mt-6 text-sm font-extrabold">
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
        <div className="page-shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-action font-bold tracking-wide uppercase">
              {trust("eyebrow")}
            </p>
            <h2 className="font-heading text-ink mt-3 text-4xl font-bold sm:text-5xl">
              {trust("title")}
            </h2>
            <p className="text-coffee mt-5 max-w-xl text-lg leading-8">
              {trust("description")}
            </p>
          </div>
          <div className="grid gap-4">
            {[
              [CheckCircle2, trust("health")],
              [ShieldCheck, trust("verification")],
              [HeartHandshake, trust("reporting")],
            ].map(([Icon, label]) => {
              const TrustIcon = Icon as typeof CheckCircle2;
              return (
                <div
                  key={String(label)}
                  className="rounded-card shadow-soft flex min-h-20 items-center gap-4 bg-white p-5"
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
        <div className="page-shell shadow-warm rounded-[2rem] bg-white p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-action font-bold tracking-wide uppercase">
              {seller("eyebrow")}
            </p>
            <h2 className="font-heading text-ink mt-3 text-4xl font-bold">
              {seller("title")}
            </h2>
            <p className="text-coffee mt-4 text-lg leading-8">
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
