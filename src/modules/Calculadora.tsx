import { useState } from "react";
import { Card } from "../components/ui";
import { cn } from "../utils/cn";

/** Calculadora estilo Apple para el vendedor/dueño. */
export function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true); // próximo dígito empieza nuevo número

  function inputDigit(d: string) {
    if (fresh) {
      setDisplay(d === "." ? "0." : d);
      setFresh(false);
    } else {
      if (d === "." && display.includes(".")) return;
      setDisplay(display.length < 12 ? display + d : display);
    }
  }

  function clearAll() {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function toggleSign() {
    setDisplay((v) => (v.startsWith("-") ? v.slice(1) : v === "0" ? v : "-" + v));
  }

  function percent() {
    setDisplay((v) => String(Number(v) / 100));
  }

  function compute(a: number, b: number, o: string): number {
    if (o === "+") return a + b;
    if (o === "−") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b === 0 ? 0 : a / b;
    return b;
  }

  function chooseOp(nextOp: string) {
    const current = Number(display);
    if (prev !== null && op && !fresh) {
      const result = compute(prev, current, op);
      setPrev(result);
      setDisplay(formatNum(result));
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  }

  function equals() {
    if (prev === null || !op) return;
    const result = compute(prev, Number(display), op);
    setDisplay(formatNum(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function formatNum(n: number): string {
    if (!isFinite(n)) return "0";
    const s = String(Math.round(n * 1e8) / 1e8);
    return s.length > 12 ? n.toExponential(4) : s;
  }

  const Btn = ({ label, onClick, kind = "num", wide }: { label: string; onClick: () => void; kind?: "num" | "op" | "fn" | "eq"; wide?: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "press flex h-16 items-center justify-center rounded-2xl text-2xl font-medium transition-apple",
        wide && "col-span-2 justify-start pl-7",
        kind === "num" && "bg-black/5 text-slate-900 hover:bg-black/10",
        kind === "fn" && "bg-black/10 text-slate-700 hover:bg-black/15",
        kind === "op" && (op === label ? "bg-white text-emerald-600 ring-2 ring-emerald-500" : "bg-emerald-500 text-white hover:brightness-105"),
        kind === "eq" && "bg-emerald-500 text-white hover:brightness-105",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-sm">
      <Card className="anim-scale-in overflow-hidden p-5">
        {/* Pantalla */}
        <div className="mb-4 flex min-h-[88px] items-end justify-end rounded-2xl bg-slate-900 px-5 py-4">
          <span className="break-all text-right text-5xl font-light tracking-tight text-white">{display}</span>
        </div>

        {/* Teclado */}
        <div className="grid grid-cols-4 gap-2.5">
          <Btn label="C" kind="fn" onClick={clearAll} />
          <Btn label="±" kind="fn" onClick={toggleSign} />
          <Btn label="%" kind="fn" onClick={percent} />
          <Btn label="÷" kind="op" onClick={() => chooseOp("÷")} />

          <Btn label="7" onClick={() => inputDigit("7")} />
          <Btn label="8" onClick={() => inputDigit("8")} />
          <Btn label="9" onClick={() => inputDigit("9")} />
          <Btn label="×" kind="op" onClick={() => chooseOp("×")} />

          <Btn label="4" onClick={() => inputDigit("4")} />
          <Btn label="5" onClick={() => inputDigit("5")} />
          <Btn label="6" onClick={() => inputDigit("6")} />
          <Btn label="−" kind="op" onClick={() => chooseOp("−")} />

          <Btn label="1" onClick={() => inputDigit("1")} />
          <Btn label="2" onClick={() => inputDigit("2")} />
          <Btn label="3" onClick={() => inputDigit("3")} />
          <Btn label="+" kind="op" onClick={() => chooseOp("+")} />

          <Btn label="0" wide onClick={() => inputDigit("0")} />
          <Btn label="." onClick={() => inputDigit(".")} />
          <Btn label="=" kind="eq" onClick={equals} />
        </div>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-400">Calculadora rápida de AlNegocio</p>
    </div>
  );
}
