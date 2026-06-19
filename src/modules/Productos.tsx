import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { Card, Button, Input, NumberInput, Select, Modal, Badge, EmptyState, Stat } from "../components/ui";
import { SuccessToast } from "../components/SuccessToast";
import { PlusIcon, TrashIcon, EditIcon, SearchIcon } from "../components/icons";
import { cup, pct } from "../lib/format";
import { inventoryValue } from "../lib/analytics";
import type { Product, ProductKind, RecipeItem } from "../lib/types";

const empty = { name: "", sku: "", categoryId: "", unit: "u", cost: 0, price: 0, stock: 0, minStock: 0, kind: "reventa" as const, recipe: [], laborCost: 0 };

function recipeCost(recipe: { qty: number; cost: number }[] | undefined, labor: number | undefined): number {
  const ing = (recipe ?? []).reduce((a, r) => a + r.qty * r.cost, 0);
  return Math.round(ing + (labor ?? 0));
}

export function Productos() {
  const { data, saveProduct, deleteProduct, addCategory, deleteCategory } = useStore();
  const { session } = usePlatform(); // 👈 IMPORTANTE: obtener tenant
  const tenant = session.status === "signedIn" ? session.tenant : null;
  
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(empty);
  const [recipeOf, setRecipeOf] = useState<Product | null>(null);
  const [success, setSuccess] = useState(false);

  const inv = inventoryValue(data);

  const list = useMemo(() => {
    return data.products.filter((p) => {
      const matchQ = `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase());
      const matchC = cat === "all" || p.categoryId === cat;
      return matchQ && matchC;
    });
  }, [data.products, query, cat]);

  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? "—";

  function openNew() {
    setForm({ ...empty, categoryId: data.categories[0]?.id ?? "" });
    setOpen(true);
  }
  function openEdit(p: Product) {
    setForm(p);
    setOpen(true);
  }
  
  function submit() {
    if (!form.name.trim()) return;
    
    // 🔧 DATOS CORRECTOS PARA SUPABASE
    const productData = {
      name: form.name,
      price: form.price,
      stock: form.stock,
      cost: form.cost || 0,
      sku: form.sku || '',
      unit: form.unit || 'u',
      min_stock: form.minStock || 0,
      category_id: form.categoryId || null,
      tenant_id: tenant?.id, // 👈 IMPORTANTE: tenant_id
    };
    
    saveProduct(productData);
    setOpen(false);
    setSuccess(true);
  }

  function margin(p: { cost: number; price: number }) {
    return p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Productos" value={`${data.products.length}`} />
        <Stat label="Valor a costo" value={cup(inv.cost)} tone="blue" />
        <Stat label="Valor a venta" value={cup(inv.retail)} tone="green" />
        <Stat label="Ganancia potencial" value={cup(inv.potential)} tone="green" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <Select
            value={cat}
            onChange={setCat}
            options={[{ value: "all", label: "Todas las categorías" }, ...data.categories.map((c) => ({ value: c.id, label: c.name }))]}
            className="min-w-[180px]"
          />
          <Button variant="outline" onClick={() => setCatOpen(true)}>Categorías</Button>
          <Button onClick={openNew}><PlusIcon className="h-4 w-4" /> Nuevo producto</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <div className="p-6"><EmptyState title="Sin productos" hint="Agrega tu primer producto al inventario." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold">Costo</th>
                  <th className="px-4 py-3 text-right font-semibold">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold">Margen</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {p.name}
                        {p.kind === "elaborado" && <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">Elaborado</span>}
                      </p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{catName(p.categoryId)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{cup(p.cost)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{cup(p.price)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{pct(margin(p))}</td>
                    <td className="px-4 py-3 text-right">
                      {p.stock <= p.minStock ? <Badge color="amber">{p.stock} {p.unit}</Badge> : <span className="font-medium text-slate-700">{p.stock} {p.unit}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {p.kind === "elaborado" && (
                          <button onClick={() => setRecipeOf(p)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50">Ver receta</button>
                        )}
                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"><EditIcon className="h-4 w-4" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? "Editar producto" : "Nuevo producto"} wide>
        <div className="mb-4">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de producto</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "reventa", label: "Reventa", desc: "Lo compras y lo vendes" },
              { id: "elaborado", label: "Elaborado", desc: "Lo haces con insumos" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm({ ...form, kind: t.id as ProductKind })}
                className={`rounded-xl border p-3 text-left transition ${form.kind === t.id ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-300 hover:border-slate-400"}`}
              >
                <p className="text-sm font-bold text-slate-900">{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className="sm:col-span-2" />
          <Input label="SKU / Código" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
          <Select label="Categoría" value={form.categoryId} onChange={(v) => setForm({ ...form, categoryId: v })} options={data.categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Input label="Unidad (u, lb, paq…)" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
          <NumberInput label="Costo (CUP)" min={0} value={form.cost} onChange={(n) => setForm({ ...form, cost: n })} />
          <NumberInput label="Precio venta (CUP)" min={0} value={form.price} onChange={(n) => setForm({ ...form, price: n })} />
          <NumberInput label="Stock actual" min={0} value={form.stock} onChange={(n) => setForm({ ...form, stock: n })} />
          <NumberInput label="Stock mínimo" min={0} value={form.minStock} onChange={(n) => setForm({ ...form, minStock: n })} />
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          Margen estimado: <strong className="text-emerald-600">{pct(margin(form))}</strong> · Ganancia por unidad: <strong>{cup(form.price - form.cost)}</strong>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit}>Guardar</Button>
        </div>
      </Modal>

      <Modal open={catOpen} onClose={() => setCatOpen(false)} title="Categorías">
        <div className="space-y-2">
          {data.categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-medium text-slate-800">{c.name}</span>
              <button onClick={() => deleteCategory(c.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={newCat} onChange={setNewCat} placeholder="Nueva categoría" className="flex-1" />
          <Button onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); } }}>Agregar</Button>
        </div>
      </Modal>

      {success && <SuccessToast message="¡Producto guardado!" onDone={() => setSuccess(false)} />}
      <Modal open={!!recipeOf} onClose={() => setRecipeOf(null)} title={`Receta · ${recipeOf?.name ?? ""}`}>
        {recipeOf && (
          <div>
            {(recipeOf.recipe ?? []).length === 0 ? (
              <EmptyState title="Este producto no tiene receta" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Insumo</th>
                      <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
                      <th className="px-3 py-2 text-right font-semibold">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recipeOf.recipe ?? []).map((r) => (
                      <tr key={r.supplyId} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-800">{r.name}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{r.qty} {r.unit}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-900">{cup(r.qty * r.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between font-bold text-slate-900"><span>Costo total</span><span>{cup(recipeOf.cost)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Precio de venta</span><span>{cup(recipeOf.price)}</span></div>
              <div className="flex justify-between font-bold text-emerald-600"><span>Ganancia por unidad</span><span>{cup(recipeOf.price - recipeOf.cost)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}