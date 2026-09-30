import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ComingSoon } from "@/components/ui/coming-soon";

describe("ComingSoon", () => {
  it("shows the feature name with a coming-soon label and is not interactive", () => {
    render(<ComingSoon badge="Uskoro">Prijava</ComingSoon>);

    expect(screen.getByText("Prijava")).toBeInTheDocument();
    expect(screen.getByText("Uskoro")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
