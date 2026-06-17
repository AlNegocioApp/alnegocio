// ============================================================
//  Edge Function: admin-list
//  Devuelve la lista de TODOS los negocios (clientes) para el panel
//  de administración. Protegida por ADMIN_KEY (solo tú la sabes).
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Verificar la clave de administrador
    const key = req.headers.get("x-admin-key") ?? "";
    if (key !== ADMIN_KEY) return json({ error: "No autorizado" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Negocios
    const { data: tenants } = await admin
      .from("tenants")
      .select("id, business_name, owner_name, email, phone, plan_id, paid_until, created_at")
      .order("created_at", { ascending: false });

    // Conteos para estimar el consumo
    const tables = ["tenants", "members", "products", "sales", "purchases", "contacts", "employees", "expenses", "invoices", "subscription_requests"];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { count } = await admin.from(t).select("*", { count: "exact", head: true });
      counts[t] = count ?? 0;
    }

    return json({ ok: true, tenants: tenants ?? [], counts });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
