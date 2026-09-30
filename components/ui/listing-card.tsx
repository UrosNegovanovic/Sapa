import { Heart, MapPin } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export type ListingCardProps = {
  href?: string;
  image: string;
  imageAlt: string;
  title: string;
  breed: string;
  meta: string;
  location: string;
  priceLabel: string;
  favoriteLabel: string;
  comingSoonLabel: string;
};

export function ListingCard(props: ListingCardProps) {
  return (
    <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="bg-butter relative aspect-[4/3] overflow-hidden">
        <Image
          src={props.image}
          alt={props.imageAlt}
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-3 right-3 bg-white/95">
          {props.priceLabel}
        </Badge>
        <span className="text-coffee absolute top-3 left-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-3 text-xs font-bold shadow-sm">
          <Heart aria-hidden="true" className="text-brand size-4" />
          <span className="sr-only">{props.favoriteLabel}:</span>
          {props.comingSoonLabel}
        </span>
      </div>
      {props.href ? (
        <Link
          href={props.href}
          className="focus-visible:ring-highlight block p-5 outline-none focus-visible:ring-3 focus-visible:ring-inset"
        >
          <ListingDetails {...props} />
        </Link>
      ) : (
        <div className="p-5">
          <ListingDetails {...props} />
        </div>
      )}
    </Card>
  );
}

function ListingDetails(
  props: Pick<ListingCardProps, "title" | "breed" | "meta" | "location">,
) {
  return (
    <>
      <h3 className="font-heading text-ink text-xl font-bold">{props.title}</h3>
      <p className="text-action mt-1 text-sm font-semibold">{props.breed}</p>
      <p className="text-coffee mt-4 text-sm">{props.meta}</p>
      <p className="text-coffee mt-2 flex items-center gap-1.5 text-sm">
        <MapPin aria-hidden="true" className="size-4" />
        {props.location}
      </p>
    </>
  );
}
