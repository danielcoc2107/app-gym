import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("mantiene la marca y señala que el producto sigue en desarrollo", () => {
    render(<SiteFooter />);

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(/app gym.*a tu ritmo\. con tu equipo/i)).toBeInTheDocument();
    expect(within(footer).getByText(/primera versión en desarrollo/i)).toBeInTheDocument();
  });
});
