import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("associates its label and description with the control", () => {
    render(
      <Input id="city" label="Grad" description="Izaberite najbliži grad" />,
    );

    const input = screen.getByRole("textbox", { name: "Grad" });
    expect(input).toHaveAccessibleDescription("Izaberite najbliži grad");
  });

  it("announces validation errors", () => {
    render(<Input id="city" label="Grad" error="Izaberite grad" />);

    expect(screen.getByRole("textbox", { name: "Grad" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Izaberite grad");
  });
});
