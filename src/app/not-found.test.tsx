import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound", () => {
  it("identifica el error y ofrece una ruta de vuelta válida", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: /esta página no está en tu rutina/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/404 · página no encontrada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });
});
