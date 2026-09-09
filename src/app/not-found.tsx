import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="contenido" className="not-found" tabIndex={-1}>
      <p className="eyebrow">404 · PÁGINA NO ENCONTRADA</p>
      <h1>Esta página no está en tu rutina.</h1>
      <p>Puede que el enlace haya cambiado. Vuelve al inicio para encontrar tu camino.</p>
      <Link href="/" className="button-primary"><ArrowLeft size={19} aria-hidden="true" /> Volver al inicio</Link>
    </main>
  );
}
