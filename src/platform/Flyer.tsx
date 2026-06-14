import { BrandName } from "./Brand";
import { PLANS, whatsappLink } from "./config";
import { cn } from "../utils/cn";

/**
 * Página de presentación de AlNegocio.
 * Diseño verde elegante, a juego con la pantalla de registro.
 */
export function Flyer({ onEnter }: { onEnter?: () => void }) {
  const features = [
    "Punto de venta y control de ventas",
    "Inventario, productos e insumos",
    "Empleados, salarios y contabilidad",
    "Cuadre de caja y reportes",
    "Funciona sin internet",
    "Para cafeterías, tiendas, dulcerías y más",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-emerald-950 text-white">
      {/* Brillos decorativos */}
      <div className="float-glow pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="float-glow pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-3xl" style={{ animationDelay: "2s" }} />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="anim-fade-up flex flex-col items-center text-center">
          <img src="./icon-512.png" alt="AlNegocio" className="h-24 w-24 rounded-[1.6rem] shadow-2xl shadow-emerald-900/40" />
          <h1 className="mt-8 text-5xl font-semibold tracking-tight sm:text-7xl">
            <BrandName accent="text-emerald-400" />
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium text-emerald-100/80 sm:text-2xl">
            Gestiona tu negocio.<br className="sm:hidden" /> Simple. Elegante. Poderoso.
          </p>
          {onEnter && (
            <button
              onClick={onEnter}
              className="press mt-9 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 shadow-xl transition-apple hover:bg-emerald-50"
            >
              Empezar ahora
            </button>
          )}
          <p className="mt-3 text-sm text-emerald-200/60">15 días gratis · sin compromiso</p>
        </div>

        {/* Features */}
        <div className="stagger mt-24 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] px-6 py-7 backdrop-blur-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <span className="text-[15px] font-medium text-emerald-50/90">{f}</span>
            </div>
          ))}
        </div>

        {/* Planes */}
        <div className="mt-28 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Elige tu plan</h2>
          <p className="mt-3 text-emerald-100/70">Empieza gratis. Crece cuando lo necesites.</p>
        </div>

        <div className="stagger mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "card-hover flex flex-col rounded-[2rem] border p-7 backdrop-blur-xl",
                plan.highlight ? "border-emerald-400 bg-white/10 ring-2 ring-emerald-400/30" : "border-white/10 bg-white/5",
              )}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200/70">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{plan.priceLabel}</p>
              <p className="mt-1 text-sm text-emerald-100/60">{plan.tagline}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-50/85">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(`Hola, quiero solicitar el plan ${plan.name} de AlNegocio.`)}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "press mt-7 inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition-apple",
                  plan.highlight ? "bg-white text-emerald-700 hover:bg-emerald-50" : "bg-white/10 text-white hover:bg-white/20",
                )}
              >
                {plan.id === "gratis" ? "Empezar gratis" : "Solicitar suscripción"}
              </a>
            </div>
          ))}
        </div>

        {/* Cierre */}
        <div className="mt-28 text-center">
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Deja la libreta. Toma el control.</p>
          {onEnter && (
            <button onClick={onEnter} className="press mt-7 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-apple hover:bg-emerald-400">
              Probar AlNegocio
            </button>
          )}
          <p className="mt-10 text-xs text-emerald-200/50">AlNegocio · Hecho para negocios en Cuba</p>
        </div>
      </div>
    </div>
  );
}
