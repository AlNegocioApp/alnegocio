import { useEffect } from "react";
import { isActive, daysLeft, usePlatform } from "./platformStore";
import { PLANS, getPlan, whatsappLink, type PlanId } from "./config";
import { Card, Badge, Stat, SectionTitle, EmptyState } from "../components/ui";
import { fmtDate } from "../lib/format";
import { cn } from "../utils/cn";
import type { Tenant } from "./types";

export function Suscripcion({ tenant }: { tenant: Tenant }) {
  const { refresh } = usePlatform();
  const active = isActive(tenant);
  const dl = daysLeft(tenant);
  const currentPlan = getPlan(tenant.plan_id);

  // ============================================================
  // 📍 LOG PARA VERIFICAR QUE EL COMPONENTE SE CARGA
  // ============================================================
  console.log("✅ Suscripcion cargado, refresh existe?", !!refresh);

  // ============================================================
  // 🔄 ACTUALIZACIÓN AUTOMÁTICA CADA 30 SEGUNDOS
  // ============================================================
  useEffect(() => {
    console.log("🟢 useEffect ejecutado - iniciando intervalo");

    const interval = setInterval(() => {
      console.log("🔄 Actualizando estado de suscripción...");
      refresh();
    }, 30000); // 👈 Cambia este número para ajustar el tiempo (milisegundos)

    return () => {
      console.log("🔴 Limpiando intervalo");
      clearInterval(interval);
    };
  }, [refresh]);

  return (
    <div className="space-y-6">
      {/* Estado de la suscripción actual */}
      <Card className={cn("anim-fade-up overflow-hidden", active ? "border-emerald-200" : "border-red-200")}>
        <div className={cn("px-6 py-5", active ? "bg-emerald-50/60" : "bg-red-50/60")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tu plan actual</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{currentPlan.name}</h2>
              <p className="text-sm text-slate-500">{currentPlan.tagline}</p>
            </div>
            {active ? <Badge color="green">Activa</Badge> : <Badge color="red">Vencida</Badge>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          <Stat label="Estado" value={active ? "Activa" : "Vencida"} tone={active ? "green" : "red"} />
          <Stat label="Días restantes" value={dl >= 0 ? `${dl} días` : `Vencida hace ${Math.abs(dl)} d.`} tone={dl > 5 ? "green" : dl >= 0 ? "amber" : "red"} />
          <Stat label="Vence el" value={fmtDate(tenant.paid_until)} />
        </div>
      </Card>

      {/* Los 3 planes */}
      <div>
        <SectionTitle title="Elige tu plan" subtitle="Toca 'Solicitar' y escríbenos por WhatsApp para activarlo." />
        <div className="stagger grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} current={tenant.plan_id} businessName={tenant.business_name} />
          ))}
        </div>
      </div>

      {/* Historial de pagos */}
      <Card className="overflow-hidden">
        <div className="border-b border-black/5 px-5 py-4"><h2 className="font-bold text-slate-900">Historial de pagos</h2></div>
        {tenant.invoices.length === 0 ? (
          <div className="p-6"><EmptyState title="Sin pagos registrados" hint="Tus pagos aparecerán aquí." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Meses</th>
                  <th className="px-5 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {tenant.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3 text-slate-600">{fmtDate(inv.date)}</td>
                    <td className="px-5 py-3 text-slate-600">{inv.months}</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">{inv.amount > 0 ? `$${inv.amount}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function PlanCard({ plan, current, businessName }: { plan: { id: PlanId; name: string; tagline: string; priceLabel: string; highlight?: boolean; features: string[] }; current: PlanId; businessName: string }) {
  const isCurrent = plan.id === current;
  const msg = `Hola, soy de "${businessName}" y quiero solicitar el plan ${plan.name} de AlNegocio.`;

  return (
    <div
      className={cn(
        "card-hover relative flex flex-col rounded-[2rem] border bg-white p-6 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.12)]",
        plan.highlight ? "border-emerald-400 ring-2 ring-emerald-400/30" : "border-black/5",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
          Más popular
        </span>
      )}
      <div className="text-center">
        <p className="text-lg font-black tracking-tight text-slate-900">{plan.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{plan.tagline}</p>
        <p className="mt-3 text-2xl font-black tracking-tight text-emerald-600">{plan.priceLabel}</p>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-black text-emerald-600">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="mt-6 rounded-2xl bg-emerald-500/10 py-3 text-center text-sm font-bold text-emerald-700">Tu plan actual</div>
      ) : (
        <a
          href={whatsappLink(msg)}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "press mt-6 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-apple",
            plan.highlight
              ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "bg-black/5 text-slate-800 hover:bg-black/10",
          )}
        >
          <WhatsAppIcon className="h-4 w-4" /> Solicitar suscripción
        </a>
      )}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.7 8.23-8.31 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}