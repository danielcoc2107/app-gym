import Link from "next/link";
import { ArrowUpRight, Dumbbell } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="App Gym, inicio">
        <span className="brand-symbol"><Dumbbell size={23} strokeWidth={2.3} aria-hidden="true" /></span>
        <span>App<span className="brand-accent">Gym</span></span>
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="/como-funciona" className="nav-link">
          Cómo funciona <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
