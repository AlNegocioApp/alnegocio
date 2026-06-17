import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { Card, Button, NumberInput, Modal, Badge, EmptyState, Stat, SectionTitle } from "../components/ui";
import { SuccessToast } from "../components/SuccessToast";
import { cup, pct } from "../lib/format";
import type { Product } from "../lib/types";

/**
 * Sección para negocios de ELABORACIÓN (pastelerías, dulcerías, restaurantes).
 * - Registrar producción (descuenta insumos, suma stock).
 * - Ver costo real de cada receta, margen y ganancia.
 * - Alertas de insumos insuficientes.
 */
export function Elaborados() {
  const { data, produce } = useStore();
  const [produceFor, setProduceFor] = useState<Product | null>(null);
  const [success, setSuccess] = useState("");

  const elaborados = useMemo(() => data.products.filter((p) => p.kind === "elaborado"), [data.products]);
  const supplyMap = useMemo(() => new Map(data.supplies.map((s) => [s.id, s])), [data.supplies]);

  const totalStockValue = elaborados.reduce((a, p) => a + p.stock * p.cost, 0);
  const totalPotential = elaborados.reduce((a, p) => a + p.stock * (p.price - p.cost), 0);

  function margin(p: Product) {
    return p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
  }
  // máximas unidades que se pueden producir según insumos disponibles
  function maxProducible(p: Product): number {
    if (!p.recipe || p.recipe.length === 0) return 0;
    let max = Infinity;
    for (const r of p.recipe) {
      const s = supplyMap.get(r.supplyId);
      const avail = s ? Math.floor(s.stock / r.qty) : 0;
      max = Math.min(max, avail);
    }
    return Number.isFinite(max) ? max : 0;
  }

  return (
    <div className="space-y-6">
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Productos elaborados" value={`${elaborados.length}`} />
        <Stat label="Valor en stock (costo)" value={cup(totalStockValue)} tone="blue" />
        <Stat label="Ganancia potencial" value={cup(totalPotential)} tone="green" />
      </div>

      <Card className="p-5">
        <SectionTitle title="Tus productos elaborados" subtitle="Registra producción y controla el costo real de cada receta." />
        {elaborados.length === 0 ? (
          <EmptyState title="Aún no tienes productos elaborados" hint="Crea un producto tipo 'Elaborado' en Productos y define su receta." />
        ) : (
          <div className="stagger space-y-3">
            {elaborados.map((p) => {
              const canMake = maxProducible(p);
              return (
                <div key={p.id} className="card-hover rounded-2xl border border-black/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <Badge>Stock: {p.stock} {p.unit}</Badge>
                        <Badge color="blue">Costo {cup(p.cost)}</Badge>
                        <Badge color="green">Precio {cup(p.price)}</Badge>
                        <Badge color={margin(p) >= 30 ? "green" : "amber"}>Margen {pct(margin(p))}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Puedes hacer</p>
                      <p className={`text-lg font-black ${canMake > 0 ? "text-emerald-600" : "text-red-500"}`}>{canMake} uds</p>
                    </div>
                  </div>

                  {/* Receta resumida */}
                  {p.recipe && p.recipe.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.recipe.map((r) => {
                        const s = supplyMap.get(r.supplyId);
                        const enough = s ? s.stock >= r.qty : false;
                        return (
                          <span key={r.supplyId} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${enough ? "bg-black/5 text-slate-600" : "bg-red-50 text-red-600"}`}>
                            {r.qty} {r.unit} {r.name}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3">
                    <Button size="sm" onClick={() => setProduceFor(p)} disabled={canMake <= 0}>
                      Registrar producción
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {produceFor && (
        <ProduceModal
          product={produceFor}
          max={maxProducible(produceFor)}
          onClose={() => setProduceFor(null)}
          onProduce={(qty) => {
            produce(produceFor.id, qty);
            setProduceFor(null);
            setSuccess(`¡${qty} ${produceFor.unit} de ${produceFor.name} producidos!`);
          }}
        />
      )}
      {success && <SuccessToast message={success} onDone={() => setSuccess("")} />}
    </div>
  );
}

function ProduceModal({ product, max, onClose, onProduce }: { product: Product; max: number; onClose: () => void; onProduce: (qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const valid = qty > 0 && qty <= max;
  const costTotal = qty * product.cost;

  return (
    <Modal open onClose={onClose} title={`Producir · ${product.name}`}>
      <p className="mb-4 text-sm text-slate-500">
        Con los insumos actuales puedes hacer hasta <strong>{max} {product.unit}</strong>. Al registrar, se descuentan los insumos y se suma al stock.
      </p>
      <NumberInput label={`Cantidad a producir (máx. ${max})`} min={1} value={qty} onChange={setQty} />
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between text-slate-600"><span>Costo total de producción</span><span className="font-bold text-slate-900">{cup(costTotal)}</span></div>
        <div className="flex justify-between text-slate-600"><span>Valor de venta</span><span className="font-bold text-emerald-600">{cup(qty * product.price)}</span></div>
      </div>
      {!valid && qty > max && <p className="mt-2 text-sm font-medium text-red-600">No hay insumos suficientes para esa cantidad.</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onProduce(qty)} disabled={!valid}>Registrar producción</Button>
      </div>
    </Modal>
  );
}
