import Link from "next/link";
import { ArrowRight, CalendarDays, Dumbbell, MoveUpRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <section className="welcome" aria-labelledby="welcome-heading">
        <div className="welcome-copy">
          <p className="eyebrow"><span className="status-dot" /> TU ESPACIO PARA ENTRENAR</p>
          <h1 id="welcome-heading">Tu entrenamiento <br />empieza <span>contigo.</span></h1>
          <p className="welcome-description">
            Tus días. Tu gimnasio. Tus objetivos. Estamos preparando un espacio
            para que cada entrenamiento tenga sentido para ti.
          </p>
          <Link href="/como-funciona" className="button-primary">
            Conoce cómo funciona <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <p className="release-note">El registro y la creación de planes estarán disponibles más adelante.</p>
        </div>
        <section className="journey-panel" aria-labelledby="journey-heading">
          <div className="panel-heading">
            <span className="eyebrow">EL PUNTO DE PARTIDA</span>
            <MoveUpRight size={22} aria-hidden="true" />
          </div>
          <h2 id="journey-heading">Un plan a tu medida.</h2>
          <ol className="journey-list" role="list">
            <li>
              <span className="step-icon"><CalendarDays size={23} aria-hidden="true" /></span>
              <div><h3>Tu disponibilidad</h3><p>Los días y el tiempo que tienes para entrenar.</p></div>
              <span className="step-number" aria-hidden="true">01</span>
            </li>
            <li>
              <span className="step-icon"><Dumbbell size={23} aria-hidden="true" /></span>
              <div><h3>Tu equipo</h3><p>Las máquinas e implementos que sí tienes a mano.</p></div>
              <span className="step-number" aria-hidden="true">02</span>
            </li>
            <li>
              <span className="step-icon"><Sparkles size={23} aria-hidden="true" /></span>
              <div><h3>Tu entrenamiento</h3><p>Rutinas organizadas alrededor de ti.</p></div>
              <span className="step-number" aria-hidden="true">03</span>
            </li>
          </ol>
          <div className="panel-footer"><span className="status-dot" /> Diseñado para acompañarte, paso a paso.</div>
        </section>
      </section>
      <section className="foundation-note" aria-labelledby="foundation-heading">
        <p className="eyebrow">EMPEZAR CON LO QUE TIENES</p>
        <div>
          <h2 id="foundation-heading">Un gimnasio nuevo también es un comienzo.</h2>
          <p>Si tu sede aún no está verificada, podrás confirmar tu propio equipo y crear
            un plan personal mientras se revisa el inventario compartido.</p>
        </div>
      </section>
    </main>
  );
}
