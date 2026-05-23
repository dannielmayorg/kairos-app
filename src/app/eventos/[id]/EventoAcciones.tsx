"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const transiciones: Record<string, { siguiente: string; label: string; lime: boolean }> = {
  PENDIENTE:  { siguiente: "ACTIVO",     label: "Iniciar sesión", lime: true  },
  ACTIVO:     { siguiente: "COMPLETADO", label: "Completar",      lime: false },
  COMPLETADO: { siguiente: "PENDIENTE",  label: "Reabrir",        lime: false },
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href={`/eventos/${evento.id}/editar`}
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.08)",
            textDecoration: "none",
            background: "transparent",
          }}
        >
          Editar
        </Link>
        <button
          onClick={cambiarEstado}
          disabled={cargando}
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: cargando ? "default" : "pointer",
            opacity: cargando ? 0.5 : 1,
            background: transicion.lime ? "#c5f135" : "rgba(255,255,255,0.08)",
            color: transicion.lime ? "#000" : "rgba(255,255,255,0.6)",
          }}
        >
          {cargando ? "..." : transicion.label}
        </button>
      </div>
    </div>
  );
}
