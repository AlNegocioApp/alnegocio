import { useMemo, useState } from "react";
import { adminList, adminApprove, type AdminTenant, type AdminData } from "./adminApi";
import { HAS_BACKEND } from "./config";
import { cn } from "../utils/cn";

const STORAGE_LIMIT_MB = 500; // límite del plan gratis de Supabase
// estimación de KB por registro (aprox.) para calcular consumo
const KB_PER_ROW = 1.2;

// Datos de ejemplo para ver el panel en MODO DEMO
const DEMO: AdminData = {
  tenants: [
    { id: "1", business_name: "Cafetería La Esquina", owner_name: "Marta Espinosa", email: "cafe@correo.cu", phone: "+53 5 234 5678", plan_id: "estandar", paid_until: addDaysStr(12), created_at: new Date().toISOString() },
    { id: "2", business_name: "Dulcería Sweet", owner_name: "Yanet Pérez", email: "sweet@correo.cu", phone: "+53 5 111 2233", plan_id: "pro", paid_until: addDaysStr(40), created_at: new Date().toISOString() },
    { id: "3", business_name: "Bodega El Rápido", owner_name: "Reinaldo Soto", email: "bodega@correo.cu", phone: "+53 5 444 5566", plan_id: "gratis", paid_until: addDaysStr(-3), created_at: new Date().toISOString() },
  ],
  counts: { tenants: 3, sales: 1240, products: 320, members: 7, purchases: 80, contacts: 45, employees: 9, expenses: 60, invoices: 14, subscription_requests: 5 },
};

function addDaysStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysLeft(date: string) {
  return Math.ceil((new Date(date + "T23:59:59").getTime() - Date.now()) / 86_400_000);
}

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(!HAS_BACKEND); // en demo entra directo
  const [keyInput, setKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [data, setData] = useState<AdminData | null>(HAS_BACKEND ? null : DEMO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function login() {
    setLoading(true);
    setError("");
    const res = await adminList(keyInput);
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? "Clave incorrecta");
      return;
    }
    setAdminKey(keyInput);
    setData(res.data);
    setAuthed(true);
  }

  async function reload() {
    if (!HAS_BACKEND) return;
    const res = await adminList(adminKey);
    if (res.ok && res.data) setData(res.data);
  }

  async function approve(t: AdminTenant, months: number, plan?: string) {
    if (!HAS_BACKEND) {
      // demo: solo simula
      setToast(`(Demo) Renovado ${months} mes(es) a ${t.business_name}`);
      setTimeout(() => setToast(""), 2500);
      return;
    }
    const res = await adminApprove(adminKey, t.id, months, plan);
    if (res.ok) {
      setToast(`✓ ${t.business_name}: renovado hasta ${res.paid_until}`);
      setTimeout(() => setToast(""), 3000);
      reload();
    } else {
      setToast(`Error: ${res.error}`);
      setTimeout(() => setToast(""), 3000);
    }
  }

  // Pantalla de login del admin
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="anim-scale-in w-full max-w-sm rounded-[2rem] bg-white/5 p-7 ring-1 ring-white/10 backdrop-blur-xl">
          <h1 className="text-2xl font-black tracking-tight">Panel de administración</h1>
          <p className="mt-1 text-sm text-slate-400">Acceso solo para el administrador de AlNegocio.</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Clave de administrador"
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          {error && <p className="mt-2 text-sm font-medium text-red-400">{error}</p>}
          <button onClick={login} disabled={loading} className="press mt-4 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white transition-apple hover:bg-emerald-400 disabled:opacity-60">
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <button onClick={onExit} className="mt-3 w-full text-sm text-slate-400 hover:text-white">Volver a la app</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Dashboard data={data ?? DEMO} onApprove={approve} onExit={onExit} onReload={reload} />
      {toast && (
        <div className="anim-fade-up fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, onApprove, onExit, onReload }: { data: AdminData; onApprove: (t: AdminTenant, m: number, p?: string) => void; onExit: () => void; onReload: () => void }) {
  const [filter, setFilter] = useState<"todos" | "activos" | "vencidos">("todos");
  const [approveFor, setApproveFor] = useState<AdminTenant | null>(null);

  const totalRows = useMemo(() => Object.values(data.counts).reduce((a, b) => a + b, 0), [data.counts]);
  const usedMB = (totalRows * KB_PER_ROW) / 1024;
  const usedPct = Math.min(100, (usedMB / STORAGE_LIMIT_MB) * 100);

  const active = data.tenants.filter((t) => daysLeft(t.paid_until) >= 0);
  const expired = data.tenants.filter((t) => daysLeft(t.paid_until) < 0);
  const list = filter === "activos" ? active : filter === "vencidos" ? expired : data.tenants;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Administración · AlNegocio</h1>
          <p className="text-sm text-slate-400">Gestiona tus clientes y suscripciones.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReload} className="press rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">Actualizar</button>
          <button onClick={onExit} className="press rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Salir</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat label="Clientes" value={`${data.tenants.length}`} />
        <AdminStat label="Activos" value={`${active.length}`} tone="emerald" />
        <AdminStat label="Vencidos" value={`${expired.length}`} tone="red" />
        <AdminStat label="Plan Pro" value={`${data.tenants.filter((t) => t.plan_id === "pro").length}`} tone="sky" />
      </div>

      {/* Consumo de Supabase (estimado) */}
      <div className="mt-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Consumo estimado de base de datos</span>
          <span className="text-slate-400">{usedMB.toFixed(1)} MB de {STORAGE_LIMIT_MB} MB</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full transition-all duration-700", usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.max(2, usedPct)}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Estimación basada en {totalRows.toLocaleString()} registros. El valor exacto está en supabase.com → Reports.
        </p>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex gap-2">
        {(["todos", "activos", "vencidos"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("press rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-apple", filter === f ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/15")}>
            {f}
          </button>
        ))}
      </div>

      {/* Tabla de clientes */}
      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Negocio</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Vence</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const dl = daysLeft(t.paid_until);
                const ok = dl >= 0;
                return (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{t.business_name}</p>
                      <p className="text-xs text-slate-400">{t.owner_name} · {t.email}</p>
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize">{t.plan_id}</span></td>
                    <td className="px-4 py-3 text-slate-300">{t.paid_until}<span className="ml-1 text-xs text-slate-500">({dl}d)</span></td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>{ok ? "Activo" : "Vencido"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setApproveFor(t)} className="press rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-400">Renovar</button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No hay clientes en este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {approveFor && <ApproveModal tenant={approveFor} onClose={() => setApproveFor(null)} onApprove={(m, p) => { onApprove(approveFor, m, p); setApproveFor(null); }} />}
    </div>
  );
}

function ApproveModal({ tenant, onClose, onApprove }: { tenant: AdminTenant; onClose: () => void; onApprove: (months: number, plan?: string) => void }) {
  const [months, setMonths] = useState(1);
  const [plan, setPlan] = useState(tenant.plan_id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="anim-scale-in w-full max-w-sm rounded-[2rem] bg-slate-900 p-6 ring-1 ring-white/10">
        <h3 className="text-lg font-black">Renovar suscripción</h3>
        <p className="mt-1 text-sm text-slate-400">{tenant.business_name}</p>

        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</span>
          <select value={plan} onChange={(e) => setPlan(e.target.value as AdminTenant["plan_id"])} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none">
            <option value="gratis">Gratis</option>
            <option value="estandar">Estándar</option>
            <option value="pro">Pro</option>
          </select>
        </label>

        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Meses a añadir</span>
          <div className="flex gap-2">
            {[1, 3, 6, 12].map((m) => (
              <button key={m} onClick={() => setMonths(m)} className={cn("press flex-1 rounded-xl py-2 text-sm font-bold transition-apple", months === m ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300")}>{m}</button>
            ))}
          </div>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="press rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
          <button onClick={() => onApprove(months, plan)} className="press rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-400">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "emerald" | "red" | "sky" }) {
  const tones = { slate: "text-white", emerald: "text-emerald-400", red: "text-red-400", sky: "text-sky-400" };
  return (
    <div className="anim-pop rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn("mt-2 text-2xl font-black tracking-tight", tones[tone])}>{value}</p>
    </div>
  );
}
