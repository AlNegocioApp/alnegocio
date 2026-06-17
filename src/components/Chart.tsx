import { useEffect, useState } from "react";
import { cup, compact } from "../lib/format";

/** Barras simples con animación de crecimiento escalonada. */
export function BarChart({ data, height = 170 }: { data: Array<{ label: string; value: number }>; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity duration-500" style={{ animation: `fadeIn .5s ease ${i * 0.07 + 0.4}s forwards` }}>
            {compact(d.value)}
          </span>
          <div
            className="bar-grow w-full rounded-xl bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:brightness-110"
            style={{ height: `${(d.value / max) * (height - 42)}px`, minHeight: d.value > 0 ? 6 : 0, animationDelay: `${i * 0.07}s` }}
            title={cup(d.value)}
          />
          <span className="text-[10px] font-medium text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Barras dobles (ingresos vs egresos) con animación. */
export function DualBarChart({
  data,
  height = 190,
}: {
  data: Array<{ label: string; a: number; b: number }>;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.a, d.b)));
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
          <div className="flex w-full items-end justify-center gap-1.5" style={{ height: height - 26 }}>
            <div
              className="bar-grow w-1/2 rounded-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/25"
              style={{ height: `${(d.a / max) * (height - 30)}px`, animationDelay: `${i * 0.08}s` }}
              title={`Ingresos ${cup(d.a)}`}
            />
            <div
              className="bar-grow w-1/2 rounded-lg bg-gradient-to-t from-rose-500 to-rose-300 shadow-md shadow-rose-400/25"
              style={{ height: `${(d.b / max) * (height - 30)}px`, animationDelay: `${i * 0.08 + 0.04}s` }}
              title={`Gastos ${cup(d.b)}`}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Dona con animación de "dibujado" del trazo. */
export function DonutChart({ segments, size = 160 }: { segments: Array<{ label: string; value: number; color: string }>; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = size / 2 - 14;
  const circ = 2 * Math.PI * radius;
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* pista de fondo */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={18} />
          {segments.map((seg, i) => {
            const len = (seg.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray={`${drawn ? len : 0} ${circ}`}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)", transitionDelay: `${i * 0.12}s` }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {/* total en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total</span>
          <span className="text-sm font-black text-slate-900">{compact(total)}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm" style={{ animation: `fadeUp .4s ease ${i * 0.08 + 0.2}s both` }}>
            <span className="h-3 w-3 rounded-full" style={{ background: seg.color }} />
            <span className="text-slate-600">{seg.label}</span>
            <span className="ml-auto font-bold text-slate-900">{cup(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
