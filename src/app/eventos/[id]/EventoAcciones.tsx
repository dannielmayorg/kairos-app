"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const transiciones: Record<string, { siguiente: string; label: string; color: string }> = {
  PENDIENTE: { siguiente: "ACTIVO", label: "Iniciar sesión", color: "bg-green-600 hover:bg-green-500" },
  ACTIVO: { siguiente: "COMPLETADO", label: "Completar", color: "bg-slate-700 hover:bg-slate-600" },
  COMPLETADO: { siguiente: "PENDIENTE", label: "Reabrir", color: "bg-slate-700 hover:bg-slate-600" },
};

const estadoBadge: Record<string, string> = {
  PENDIENTE: "text-slate-400 bg-slate-700/50",
  ACTIVO: "text-green-400 bg-green-500/20",
  COMPLETADO: "text-slate-500 bg-slate-800",
};

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACTIVO: "Activo",
  COMPLETADO: "Completado",
};

export default function EventoAcciones({
  evento,
}: {
  evento: { id: string; estado: string };
}) {
  const [estado, setEstado] = useState(evento.estado);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const transicion = transiciones[estado];

  const cambiarEstado = async () => {
    setCargando(true);
    const res = await fetch(`/api/eventos/${evento.id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: transicion.siguiente }),
    });
    if (res.ok) {
      setEstado(transicion.siguiente);
      router.refresh();
    }
    setCargando(false);
  };

  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge[estado]}`}
      >
        {estadoLabel[estado]}
      </span>
      <div className="flex gap-2">
        <Link
          href={`/eventos/${evento.id}/editar`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-[var(--kairos-border)] hover:text-slate-200 hover:border-slate-500 transition-colors"
        >
          Editar
        </Link>
        <button
          onClick={cambiarEstado}
          disabled={cargando}
          className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${transicion.color} disabled:opacity-50`}
        >
          {cargando ? "..." : transicion.label}
        </button>
      </div>
    </div>
  );
}
