import { useState } from "react";
import { useStore } from "../lib/store";
import { Card, Button, Input, Modal, Badge, EmptyState, SectionTitle } from "../components/ui";
import { PlusIcon, TrashIcon } from "../components/icons";
import { whatsappLink } from "../platform/config";
import type { Warehouse } from "../lib/types";

/**
 * Gestión de almacenes / negocios (función del plan PRO).
 * Permite registrar varios puntos/negocios bajo la misma cuenta.
 */
export function Almacenes({ isPro }: { isPro: boolean }) {
  const { data, updateBusiness } = useStore();
  const warehouses = data.business.warehouses ?? [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  function add() {
    if (!name.trim()) return;
    const w: Warehouse = { id: `alm${Date.now().toString(36)}`, name: name.trim(), location: location.trim(), active: true };
    updateBusiness({ warehouses: [...warehouses, w] });
    setName("");
    setLocation("");
    setOpen(false);
  }
  function remove(id: string) {
    updateBusiness({ warehouses: warehouses.filter((w) => w.id !== id) });
  }
  function toggle(id: string) {
    updateBusiness({ warehouses: warehouses.map((w) => (w.id === id ? { ...w, active: !w.active } : w)) });
  }

  // Si NO es Pro: mostrar invitación a mejorar
  if (!isPro) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="anim-scale-in p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-3xl text-white shadow-lg shadow-emerald-500/30">🏬</div>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">Multi-almacén es del plan Pro</h2>
          <p className="mt-2 text-slate-500">
            Con el plan <strong>Pro</strong> puedes crear todos los almacenes que quieras y gestionar varios negocios en una sola app.
          </p>
          <a
            href={whatsappLink("Hola, quiero mejorar al plan Pro de AlNegocio para tener varios almacenes.")}
            target="_blank"
            rel="noreferrer"
            className="press mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25"
          >
            Mejorar a Pro por WhatsApp
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <SectionTitle
          title="Tus almacenes / negocios"
          subtitle="Plan Pro: gestiona varios puntos bajo la misma cuenta."
          action={<Button onClick={() => setOpen(true)}><PlusIcon className="h-4 w-4" /> Nuevo almacén</Button>}
        />
        {warehouses.length === 0 ? (
          <EmptyState title="Sin almacenes" hint="Crea tu primer almacén o negocio." />
        ) : (
          <div className="stagger grid gap-3 sm:grid-cols-2">
            {warehouses.map((w) => (
              <div key={w.id} className="card-hover flex items-start justify-between rounded-2xl border border-black/5 p-4">
                <div>
                  <p className="font-bold text-slate-900">{w.name}</p>
                  <p className="text-sm text-slate-500">{w.location || "Sin ubicación"}</p>
                  <div className="mt-2">{w.active ? <Badge color="green">Activo</Badge> : <Badge color="slate">Inactivo</Badge>}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggle(w.id)} className="press rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-black/5">
                    {w.active ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => remove(w.id)} className="press rounded-lg p-2 text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo almacén / negocio">
        <div className="space-y-4">
          <Input label="Nombre" value={name} onChange={setName} placeholder="Ej: Sucursal Centro" />
          <Input label="Ubicación (opcional)" value={location} onChange={setLocation} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={add}>Crear</Button>
        </div>
      </Modal>
    </div>
  );
}
