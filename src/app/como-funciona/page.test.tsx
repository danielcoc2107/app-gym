import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HowItWorksPage from "./page";

describe("HowItWorksPage", () => {
  it("describe el recorrido futuro y permite volver al inicio", () => {
    render(<HowItWorksPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /un plan que parte de tu realidad/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
    expect(
      screen.getByText(/todavía no se crean cuentas ni se guardan entrenamientos/i),
    ).toBeInTheDocument();
  });

  it("deja claro que el inventario personal es privado y compartir una copia es opcional", () => {
    render(<HowItWorksPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: /puedes empezar sin esperar a un gestor/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/esa lista será privada y servirá para tus rutinas/i)).toBeInTheDocument();
    expect(screen.getByText(/si decides compartirla, enviarás una copia para revisión/i)).toBeInTheDocument();
  });
});
