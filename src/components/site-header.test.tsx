import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("expone la marca como enlace accesible al inicio", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /app gym, inicio/i })).toHaveAttribute("href", "/");
  });

  it("ofrece navegación principal accesible hacia cómo funciona", () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole("navigation", { name: /navegación principal/i });
    expect(within(navigation).getByRole("link", { name: /cómo funciona/i })).toHaveAttribute(
      "href",
      "/como-funciona",
    );
  });
});
