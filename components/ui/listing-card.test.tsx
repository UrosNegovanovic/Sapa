import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ListingCard } from "@/components/ui/listing-card";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
}));

const props = {
  image: "/demo.jpg",
  imageAlt: "Pas",
  title: "Primer oglasa",
  breed: "Mešanac",
  meta: "muški pol · 4 meseca",
  location: "Beograd",
  priceLabel: "Za udomljavanje",
  favoriteLabel: "Dodaj u omiljene",
  comingSoonLabel: "Uskoro",
};

describe("ListingCard", () => {
  it("does not render a link until the listing has a detail page", () => {
    render(<ListingCard {...props} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Primer oglasa" }),
    ).toBeInTheDocument();
  });

  it("links to the detail page when one exists", () => {
    render(<ListingCard {...props} href="/oglasi/primer" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/oglasi/primer");
  });

  it("marks favorites as coming soon instead of rendering a dead button", () => {
    render(<ListingCard {...props} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Uskoro")).toBeInTheDocument();
    expect(screen.getByText(/Dodaj u omiljene/)).toBeInTheDocument();
  });
});
