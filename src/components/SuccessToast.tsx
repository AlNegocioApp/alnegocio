import { useEffect } from "react";

/**
 * Confirmación visual estilo Apple: un círculo verde con un check animado
 * que aparece, late y desaparece. Se usa al registrar ventas, productos, etc.
 */
export function SuccessToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="anim-fade-in pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div className="anim-scale-in glass flex flex-col items-center gap-3 rounded-[2rem] px-10 py-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40">
          <svg className="anim-check h-11 w-11 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-900">{message}</p>
      </div>
    </div>
  );
}
