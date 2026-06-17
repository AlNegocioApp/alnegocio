import { useState } from "react";
import { useStore } from "../lib/store";
import { Card, Button, Input, NumberInput, SectionTitle, EmptyState } from "../components/ui";
import { PlusIcon, TrashIcon } from "../components/icons";
import { cup } from "../lib/format";
import { cn } from "../utils/cn";
import type { Currency } from "../lib/types";

/**
 * Tasa de cambio con monedas CONFIGURABLES por el dueño.
 * Cada moneda tiene tasa de COMPRA y de PAGO.
 */
export function Cambio({ canEdit }: { canEdit: boolean }) {
  const { data, updateBusiness } = useStore();
  const currencies = data.business.currencies ?? [];

  function update(id: string, patch: Partial<Currency>) {
    updateBusiness({ currencies: currencies.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function addCurrency() {
    const nc: Currency = { id: `cur${Date.now().toString(36)}`, code: "NUEVA", buy: 0, pay: 0 };
    updateBusiness({ currencies: [...currencies, nc] });
  }
  function removeCurrency(id: string) {
    updateBusiness({ currencies: currencies.filter((c) => c.id !== id) });
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Tarjetas con las tasas actuales */}
      <div className="stagger grid gap-3 sm:grid-cols-2">
        {currencies.length === 0 ? (
          <EmptyState title="Sin monedas" hint="Agrega las monedas que aceptas (USD, EUR, MLC…)." />
        ) : (
          currencies.map((c) => (
            <Card key={c.id} className="p-5">
              <p className="text-lg font-black tracking-tight text-slate-900">{c.code}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-500/10 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Compra</p>
                  <p className="mt-1 text-xl font-black text-amber-700">{cup(c.buy)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Pago</p>
                  <p className="mt-1 text-xl font-black text-emerald-700">{cup(c.pay)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/60 p-4">
        <p className="text-sm text-emerald-900">
          <strong>Compra:</strong> a cómo el negocio compra la divisa.{" "}
          <strong>Pago:</strong> a cómo se acepta cuando un cliente paga con ella.
          {!canEdit && " Estas tasas las fija el dueño."}
        </p>
      </Card>

      {/* Editar (solo dueño) */}
      {canEdit && (
        <Card className="p-5">
          <SectionTitle
            title="Monedas y tasas"
            subtitle="Renombra, ajusta o agrega las monedas que quieras (USD, EUR, MLC, Zelle…)."
            action={<Button size="sm" onClick={addCurrency}><PlusIcon className="h-4 w-4" /> Agregar moneda</Button>}
          />
          <div className="space-y-3">
            {currencies.map((c) => (
              <div key={c.id} className="rounded-2xl border border-black/10 p-3">
                <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <Input label="Moneda" value={c.code} onChange={(v) => update(c.id, { code: v.toUpperCase() })} />
                  <NumberInput label="Compra (CUP)" min={0} value={c.buy} onChange={(n) => update(c.id, { buy: n })} />
                  <NumberInput label="Pago (CUP)" min={0} value={c.pay} onChange={(n) => update(c.id, { pay: n })} />
                  <button onClick={() => removeCurrency(c.id)} className="press mb-1 rounded-xl p-2.5 text-red-500 hover:bg-red-50">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {currencies.length > 0 && <Calculator currencies={currencies} />}
    </div>
  );
}

function Calculator({ currencies }: { currencies: Currency[] }) {
  const [amount, setAmount] = useState(0);
  const [curId, setCurId] = useState(currencies[0]?.id ?? "");
  const [mode, setMode] = useState<"pay" | "buy">("pay");

  const cur = currencies.find((c) => c.id === curId) ?? currencies[0];
  const rate = mode === "pay" ? cur.pay : cur.buy;
  const result = amount * rate;

  return (
    <Card className="p-5">
      <SectionTitle title="Calculadora" subtitle="Convierte divisa a CUP según compra o pago" />
      <div className="flex flex-wrap items-end gap-3">
        <NumberInput label="Monto" min={0} value={amount} onChange={setAmount} className="flex-1" />
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Moneda</span>
          <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-black/5 p-1">
            {currencies.map((c) => (
              <button key={c.id} onClick={() => setCurId(c.id)} className={cn("rounded-xl px-3.5 py-2 text-sm font-semibold transition-apple", curId === c.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
                {c.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-2xl bg-black/5 p-1">
        <button onClick={() => setMode("pay")} className={cn("rounded-xl px-4 py-2 text-sm font-semibold transition-apple", mode === "pay" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500")}>
          Cliente paga con divisa
        </button>
        <button onClick={() => setMode("buy")} className={cn("rounded-xl px-4 py-2 text-sm font-semibold transition-apple", mode === "buy" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500")}>
          Comprar divisa
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-center text-white">
        <p className="text-sm text-slate-300">{amount} {cur.code} = </p>
        <p className={cn("mt-1 text-3xl font-black", mode === "pay" ? "text-emerald-400" : "text-amber-400")}>{cup(result)}</p>
        <p className="mt-1 text-xs text-slate-400">{mode === "pay" ? "aceptas como pago" : "pagas al comprar"} · 1 {cur.code} = {cup(rate)}</p>
      </div>
    </Card>
  );
}
