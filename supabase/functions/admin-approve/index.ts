// ============================================================
//  Edge Function: admin-approve
//  Renueva la suscripción de un cliente (extiende paid_until y/o
//  cambia su plan). Protegida por ADMIN_KEY.
// ============================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_KEY = Deno.env.get("ADMIN_KEY") ?? "cambia-esta-clave";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function addMonths(base: string, months: number): string {
  const d = new Date(base + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = req.headers.get("x-admin-key") ?? "";
    if (key !== ADMIN_KEY) return json({ error: "No autorizado" }, 401);

    const { tenantId, months, plan } = await req.json();
    if (!tenantId || !months) return json({ error: "Datos incompletos" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: tenant } = await admin.from("tenants").select("paid_until, plan_id").eq("id", tenantId).single();
    if (!tenant) return json({ error: "Negocio no encontrado" }, 404);

    const today = new Date().toISOString().slice(0, 10);
    const base = tenant.paid_until > today ? tenant.paid_until : today;
    const newPaidUntil = addMonths(base, Number(months));

    const update: Record<string, unknown> = { paid_until: newPaidUntil };
    if (plan && ["gratis", "estandar", "pro"].includes(plan)) update.plan_id = plan;

    await admin.from("tenants").update(update).eq("id", tenantId);
    await admin.from("invoices").insert({
      tenant_id: tenantId,
      months: Number(months),
      amount: 0,
      method: "transferencia",
    });

    return json({ ok: true, paid_until: newPaidUntil });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
