import type { AppData } from "./types";
import { monthKey } from "./format";

export function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(dd.toISOString().slice(0, 7));
  }
  return out;
}

export function inRange(iso: string, from?: string, to?: string): boolean {
  const t = iso.slice(0, 10);
  if (from && t < from) return false;
  if (to && t > to) return false;
  return true;
}

export type Period = "dia" | "semana" | "mes" | "anio";

/** Devuelve el rango {from, to} (yyyy-mm-dd) según el periodo elegido. */
export function periodRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const d = new Date(now);
  if (period === "dia") {
    return { from: to, to };
  }
  if (period === "semana") {
    d.setDate(d.getDate() - 6);
  } else if (period === "mes") {
    d.setMonth(d.getMonth() - 1);
    d.setDate(d.getDate() + 1);
  } else {
    d.setFullYear(d.getFullYear() - 1);
    d.setDate(d.getDate() + 1);
  }
  return { from: d.toISOString().slice(0, 10), to };
}

/** Serie de ingresos por día dentro de un rango (para gráficos diarios). */
export function dailySeries(data: AppData, from: string, to: string) {
  const days: Array<{ label: string; value: number }> = [];
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  // límite de barras para no saturar
  const maxDays = 31;
  let cur = new Date(start);
  const all: string[] = [];
  while (cur <= end && all.length < 366) {
    all.push(cur.toISOString().slice(0, 10));
    cur = new Date(cur.getTime() + 86_400_000);
  }
  const step = Math.max(1, Math.ceil(all.length / maxDays));
  for (let i = 0; i < all.length; i += step) {
    const chunk = all.slice(i, i + step);
    const value = data.sales
      .filter((s) => chunk.includes(s.date.slice(0, 10)))
      .reduce((a, s) => a + s.total, 0);
    const label = new Date(chunk[0] + "T00:00:00").toLocaleDateString("es-CU", { day: "2-digit", month: step > 1 ? "short" : undefined });
    days.push({ label, value });
  }
  return days;
}

/** Ingresos por método de pago (para gráfico de dona). */
export function salesByPayment(data: AppData, from?: string, to?: string) {
  const map = new Map<string, number>();
  data.sales.filter((s) => inRange(s.date, from, to)).forEach((s) => {
    map.set(s.payment, (map.get(s.payment) ?? 0) + s.total);
  });
  const colors: Record<string, string> = { efectivo: "#10b981", transferencia: "#0ea5e9", mlc: "#f59e0b" };
  return [...map.entries()].map(([k, v]) => ({ label: k, value: v, color: colors[k] ?? "#64748b" }));
}

export type Totals = {
  revenue: number; // ventas + suscripciones
  salesRevenue: number;
  subscriptionRevenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  payroll: number;
  tax: number;
  netProfit: number;
  salesCount: number;
};

export function computeTotals(data: AppData, from?: string, to?: string): Totals {
  const sales = data.sales.filter((s) => inRange(s.date, from, to));
  const salesRevenue = sales.reduce((s, x) => s + x.total, 0);
  const subscriptionRevenue = 0;
  const revenue = salesRevenue;
  const cogs = sales.reduce((s, x) => s + x.cogs, 0);
  const grossProfit = revenue - cogs;
  const expenses = data.expenses
    .filter((e) => inRange(e.date, from, to))
    .reduce((s, x) => s + x.amount, 0);
  const payroll = data.payrolls
    .filter((p) => inRange(p.date, from, to))
    .reduce((s, x) => s + x.net, 0);
  const tax = (revenue * data.business.taxRate) / 100;
  const netProfit = grossProfit - expenses - payroll - tax;
  return { revenue, salesRevenue, subscriptionRevenue, cogs, grossProfit, expenses, payroll, tax, netProfit, salesCount: sales.length };
}

export function monthlySeries(data: AppData, months: string[]) {
  return months.map((m) => {
    const sales = data.sales.filter((s) => monthKey(s.date) === m).reduce((a, s) => a + s.total, 0);
    const subs = 0;
    const expenses = data.expenses.filter((e) => monthKey(e.date) === m).reduce((a, e) => a + e.amount, 0);
    const payroll = data.payrolls.filter((p) => monthKey(p.date) === m).reduce((a, p) => a + p.net, 0);
    return { month: m, revenue: sales + subs, expenses: expenses + payroll };
  });
}

export function topProducts(data: AppData, from?: string, to?: string, limit = 5) {
  const map = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();
  data.sales
    .filter((s) => inRange(s.date, from, to))
    .forEach((s) =>
      s.items.forEach((it) => {
        const cur = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0, profit: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.price;
        cur.profit += it.qty * (it.price - it.cost);
        map.set(it.productId, cur);
      }),
    );
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function inventoryValue(data: AppData) {
  const cost = data.products.reduce((s, p) => s + p.stock * p.cost, 0);
  const retail = data.products.reduce((s, p) => s + p.stock * p.price, 0);
  return { cost, retail, potential: retail - cost };
}

export function lowStock(data: AppData) {
  return data.products.filter((p) => p.stock <= p.minStock);
}
