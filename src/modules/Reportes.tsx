import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { Card, Button, SectionTitle, Stat, EmptyState } from "../components/ui";
import { BarChart, DonutChart } from "../components/Chart";
import { cup, fmtDate } from "../lib/format";
import {
  computeTotals,
  topProducts,
  inRange,
  periodRange,
  dailySeries,
  salesByPayment,
  type Period,
} from "../lib/analytics";
import { cn } from "../utils/cn";

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "dia", label: "Hoy" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
  { id: "anio", label: "Año" },
];

export function Reportes() {
  const { data } = useStore();
  const [period, setPeriod] = useState<Period>("mes");
  const { from, to } = useMemo(() => periodRange(period), [period]);

  const totals = computeTotals(data, from, to);
  const top = topProducts(data, from, to, 8);
  const daily = useMemo(() => dailySeries(data, from, to), [data, from, to]);
  const byPayment = useMemo(() => salesByPayment(data, from, to), [data, from, to]);
  const marginPct = totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0;

  function download(name: string, content: string) {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSalesCSV() {
    const rows = data.sales.filter((s) => inRange(s.date, from, to));
    const header = "Fecha,Cliente,Pago,Subtotal,Descuento,Total,Costo,Ganancia\n";
    const body = rows.map((s) => `${s.date.slice(0, 10)},${s.customerName},${s.payment},${s.subtotal},${s.discount},${s.total},${s.cogs},${s.profit}`).join("\n");
    download("ventas.csv", header + body);
  }
  function exportProductsCSV() {
    const header = "Producto,SKU,Costo,Precio,Stock,StockMinimo\n";
    const body = data.products.map((p) => `${p.name},${p.sku},${p.cost},${p.price},${p.stock},${p.minStock}`).join("\n");
    download("productos.csv", header + body);
  }

  function printSummary() {
    const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Resumen ${data.business.name}</title>
      <style>
        body{font-family:-apple-system,Arial,sans-serif;padding:40px;color:#0f172a}
        h1{margin:0 0 4px} .muted{color:#64748b;font-size:13px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
        .box{border:1px solid #e2e8f0;border-radius:12px;padding:14px}
        .box .l{font-size:12px;color:#64748b;text-transform:uppercase}
        .box .v{font-size:22px;font-weight:800;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
        th,td{border-bottom:1px solid #e2e8f0;text-align:left;padding:8px}
        td.r,th.r{text-align:right}
      </style></head><body>
      <h1>${data.business.name}</h1>
      <p class="muted">Resumen · ${periodLabel} (${fmtDate(from)} - ${fmtDate(to)})</p>
      <div class="grid">
        <div class="box"><div class="l">Ingresos</div><div class="v">${cup(totals.revenue)}</div></div>
        <div class="box"><div class="l">Costo mercancía</div><div class="v">${cup(totals.cogs)}</div></div>
        <div class="box"><div class="l">Ganancia bruta</div><div class="v">${cup(totals.grossProfit)}</div></div>
        <div class="box"><div class="l">Ganancia neta</div><div class="v">${cup(totals.netProfit)}</div></div>
        <div class="box"><div class="l">Gastos + salarios</div><div class="v">${cup(totals.expenses + totals.payroll)}</div></div>
        <div class="box"><div class="l">Ventas</div><div class="v">${totals.salesCount}</div></div>
      </div>
      <h3>Productos más vendidos</h3>
      <table><tr><th>Producto</th><th class="r">Unidades</th><th class="r">Ingresos</th><th class="r">Ganancia</th></tr>
      ${top.map((t) => `<tr><td>${t.name}</td><td class="r">${t.qty}</td><td class="r">${cup(t.revenue)}</td><td class="r">${cup(t.profit)}</td></tr>`).join("")}
      </table>
      <p class="muted" style="margin-top:30px">Generado por AlNegocio</p>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div className="space-y-6">
      {/* Filtro de periodo */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="inline-flex rounded-2xl bg-black/5 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn("press rounded-xl px-4 py-2 text-sm font-semibold transition-apple", period === p.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={printSummary}>🖨️ Imprimir resumen</Button>
          <Button variant="outline" size="sm" onClick={exportSalesCSV}>Exportar ventas</Button>
          <Button variant="outline" size="sm" onClick={exportProductsCSV}>Exportar productos</Button>
        </div>
      </Card>

      <p className="text-sm text-slate-500">Periodo: {fmtDate(from)} — {fmtDate(to)}</p>

      {/* KPIs */}
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ingresos" value={cup(totals.revenue)} hint={`${totals.salesCount} ventas`} tone="green" />
        <Stat label="Ganancia bruta" value={cup(totals.grossProfit)} tone="blue" />
        <Stat label="Ganancia neta" value={cup(totals.netProfit)} tone={totals.netProfit >= 0 ? "green" : "red"} />
        <Stat label="Margen neto" value={`${marginPct.toFixed(1)}%`} tone={marginPct >= 0 ? "green" : "red"} />
      </div>

      {/* Gráfico de ingresos por día */}
      <Card className="p-5">
        <SectionTitle title="Ingresos en el periodo" subtitle="Evolución de las ventas" />
        {daily.every((d) => d.value === 0) ? (
          <EmptyState title="Sin ventas en este periodo" />
        ) : (
          <BarChart data={daily} height={200} />
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Métodos de pago */}
        <Card className="p-5">
          <SectionTitle title="Métodos de pago" subtitle="Cómo te pagan tus clientes" />
          {byPayment.length === 0 ? <EmptyState title="Sin datos" /> : <DonutChart segments={byPayment} />}
        </Card>

        {/* Ranking de productos */}
        <Card className="p-5">
          <SectionTitle title="Más vendidos" subtitle="Top productos del periodo" />
          {top.length === 0 ? (
            <EmptyState title="Sin ventas" />
          ) : (
            <div className="space-y-3">
              {top.slice(0, 6).map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/5 text-sm font-bold text-slate-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.qty} uds · ganancia {cup(t.profit)}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{cup(t.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
