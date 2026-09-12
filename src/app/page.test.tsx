import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("presenta el propósito del producto y enlaza al recorrido informativo", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /tu entrenamiento empieza contigo/i,
      }),
    ).toBeInTheDocument();

    const guideLink = screen.getByRole("link", { name: /conoce cómo funciona/i });
    expect(guideLink).toHaveAttribute("href", "/como-funciona");
  });

  it("señala lo que aún no está disponible sin ofrecer un registro falso", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/el registro y la creación de planes estarán disponibles más adelante/i),
    ).toBeInTheDocument();

    const main = screen.getByRole("main");
    expect(
      within(main).queryByRole("link", { name: /registr|crear cuenta|comenzar/i }),
    ).not.toBeInTheDocument();
    expect(
      within(main).queryByRole("button", { name: /registr|crear cuenta|comenzar/i }),
    ).not.toBeInTheDocument();
  });

  it("explica que una sede sin verificar admite un inventario personal", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /un gimnasio nuevo también es un comienzo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/podrás confirmar tu propio equipo y crear un plan personal/i)).toBeInTheDocument();
  });
});
