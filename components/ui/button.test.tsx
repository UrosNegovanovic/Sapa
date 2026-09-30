import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("uses the primary visual treatment by default", () => {
    render(<Button>Pretraži</Button>);

    expect(screen.getByRole("button", { name: "Pretraži" })).toHaveClass(
      "bg-action",
    );
  });

  it("forwards accessible button behavior", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Sačuvaj</Button>);

    await user.click(screen.getByRole("button", { name: "Sačuvaj" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not invoke disabled actions", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Sačuvaj
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Sačuvaj" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
