/**
 * Configuración general de AlNegocio.
 */

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

// ============================================================
//  🔌 CONEXIÓN A SUPABASE (backend)
// ============================================================
// 👇 COPIA TU ANON KEY DE SUPABASE Y PÉGALA DENTRO DE LAS COMILLAS 👇
const MANUAL_SUPABASE_URL = "https://qabgldgdeigpduuzygpy.supabase.co";
const MANUAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhYmdsZGdkZWlncGR1dXp5Z3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDg4MjcsImV4cCI6MjA5NjAyNDgyN30.-jrnZH2H-NqV4qVeFkuD6-JLv6RpaYNjIh2OjehD4jw";

export const SUPABASE_URL = env.VITE_SUPABASE_URL ?? MANUAL_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? MANUAL_SUPABASE_ANON_KEY ?? "";
export const HAS_BACKEND = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ============================================================
//  📞 CONTACTO (WhatsApp del administrador)
// ============================================================
export const WHATSAPP_NUMBER = "5355513981";
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ============================================================
//  💳 PLANES DE SUSCRIPCIÓN
// ============================================================
export type PlanId = "gratis" | "estandar" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  highlight?: boolean;
  maxProducts: number | null;
  maxWarehouses: number;
  maxSubaccounts: number;
  multiBusiness: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "gratis",
    name: "Gratis",
    tagline: "Prueba completa por 15 días",
    priceLabel: "Gratis · 15 días",
    maxProducts: 100,
    maxWarehouses: 1,
    maxSubaccounts: 2,
    multiBusiness: false,
    features: [
      "Acceso completo por 15 días",
      "Todas las funciones del plan Estándar",
      "Hasta 100 productos",
      "1 almacén",
      "Sin compromiso",
    ],
  },
  {
    id: "estandar",
    name: "Estándar",
    tagline: "Para tu negocio del día a día",
    priceLabel: "5 USD/mes",
    highlight: true,
    maxProducts: 100,
    maxWarehouses: 1,
    maxSubaccounts: 2,
    multiBusiness: false,
    features: [
      "Punto de venta (POS) y control de ventas",
      "Hasta 100 productos",
      "1 almacén",
      "2 subcuentas (vendedor/administrador)",
      "Inventario, compras y proveedores",
      "Empleados, salarios y contabilidad",
      "Cuadre de caja y reportes",
      "Se paga en USD o su equivalente en CUP",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Sin límites, para crecer",
    priceLabel: "10 USD/mes",
    maxProducts: null,
    maxWarehouses: 99,
    maxSubaccounts: 99,
    multiBusiness: true,
    features: [
      "Todo lo del plan Estándar",
      "Productos ilimitados",
      "Crea los almacenes que quieras",
      "Gestiona varios negocios en una sola app",
      "Subcuentas ilimitadas",
      "Soporte prioritario",
      "Se paga en USD o su equivalente en CUP",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export const TRIAL_DAYS = 15;