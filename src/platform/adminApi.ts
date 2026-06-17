import { SUPABASE_URL, SUPABASE_ANON_KEY, HAS_BACKEND } from "./config";

export type AdminTenant = {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  plan_id: "gratis" | "estandar" | "pro";
  paid_until: string;
  created_at: string;
};

export type AdminData = {
  tenants: AdminTenant[];
  counts: Record<string, number>;
};

function fnUrl(name: string) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

/** Lista todos los clientes + conteos (consumo). Requiere la clave de admin. */
export async function adminList(adminKey: string): Promise<{ ok: boolean; data?: AdminData; error?: string }> {
  if (!HAS_BACKEND) {
    return { ok: false, error: "Backend no conectado (modo demo)." };
  }
  try {
    const res = await fetch(fnUrl("admin-list"), {
      headers: { "x-admin-key": adminKey, apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? "Error" };
    return { ok: true, data: body as AdminData };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}

/** Renueva la suscripción de un cliente. */
export async function adminApprove(
  adminKey: string,
  tenantId: string,
  months: number,
  plan?: string,
): Promise<{ ok: boolean; error?: string; paid_until?: string }> {
  if (!HAS_BACKEND) return { ok: false, error: "Backend no conectado (modo demo)." };
  try {
    const res = await fetch(fnUrl("admin-approve"), {
      method: "POST",
      headers: { "x-admin-key": adminKey, apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, months, plan }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? "Error" };
    return { ok: true, paid_until: body.paid_until };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}
