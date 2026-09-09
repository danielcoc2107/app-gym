import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Dumbbell, RefreshCw, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Cómo funciona" };

const steps = [
  { icon: CalendarDays, title: "Cuéntanos cómo quieres entrenar", description: "Tu objetivo, experiencia y tiempo disponible serán el punto de partida. Elegirás de uno a seis días por semana." },
  { icon: Dumbbell, title: "Elige tu gimnasio y confirma tu equipo", description: "Usarás el inventario compartido de tu sede. Si aún se está verificando, podrás confirmar una lista personal de los recursos que tienes disponibles." },
  { icon: RefreshCw, title: "Entrena con opciones", description: "Tu plan distribuirá el trabajo durante la semana. Si una máquina está ocupada, podrás elegir un ejercicio equivalente y conservar las series que ya completaste." },
  { icon: MessageCircle, title: "Resuelve tus dudas en el momento", description: "El asistente conocerá el ejercicio de tu sesión para ayudarte a entender sus instrucciones, sin perder el contexto cuando cambies a una alternativa." },
];

export default function HowItWorksPage() {
  return (
    <main id="contenido" className="guide-page" tabIndex={-1}>
      <Link href="/" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Volver al inicio</Link>
      <div className="guide-intro">
        <p className="eyebrow">ASÍ ESTAMOS CONSTRUYENDO APP GYM</p>
        <h1>Un plan que parte de <span>tu realidad.</span></h1>
        <p>Estas son las funciones que iremos incorporando. Por ahora puedes conocer
          el recorrido; todavía no se crean cuentas ni se guardan entrenamientos.</p>
      </div>
      <ol className="guide-steps" role="list">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <li key={title}>
            <span className="guide-number" aria-hidden="true">0{index + 1}</span>
            <div><Icon size={24} aria-hidden="true" /><h2>{title}</h2><p>{description}</p></div>
          </li>
        ))}
      </ol>
      <aside className="personal-note" aria-labelledby="personal-heading">
        <p className="eyebrow">TU INVENTARIO PERSONAL</p>
        <h2 id="personal-heading">Puedes empezar sin esperar a un gestor.</h2>
        <p>Confirmarás las máquinas y accesorios que ves en el gimnasio. Esa lista será
          privada y servirá para tus rutinas. Si decides compartirla, enviarás una copia
          para revisión. La aplicación no dará por hecho que existe equipo que no confirmaste.</p>
      </aside>
    </main>
  );
}
