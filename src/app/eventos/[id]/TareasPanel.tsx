"use client";

import { useState } from "react";

type Tarea = { id: string; titulo: string; prioridad: string; completada: boolean };

const PRIORIDAD: Record<string, { label: string; color: string; bg: string }> = {
  ALTA:  { label: "Alta",  color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  MEDIA: { label: "Media", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  BAJA:  { label: "Baja",  color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" },
};

export default function TareasPanel({
  eventoId,
  tareasIniciales,
}: {
  eventoId: string;
  tareasIniciales: Tarea[];
}) {
  const [tareas, setTareas] = useState<Tarea[]>(tareasIniciales);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [agregando, setAgregando] = useState(false);

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);

  const toggleTarea = async (tarea: Tarea) => {
    setTareas((prev) => prev.map((t) => t.id === tarea.id ? { ...t, completada: !t.completada } : t));
    const res = await fetch(`/api/tareas/${tarea.id}/completar`, { method: "PATCH" });
    if (!res.ok) {
      setTareas((prev) => prev.map((t) => t.id === tarea.id ? { ...t, completada: tarea.completada } : t));
    }
  };

  const agregarTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;
    setAgregando(true);
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId, titulo: nuevaTarea.trim(), orden: tareas.length }),
    });
    if (res.ok) {
      const t = await res.json();
      setTareas((prev) => [...prev, t]);
      setNuevaTarea("");
    }
    setAgregando(false);
  };

  const eliminarTarea = async (id: string) => {
    const snapshot = tareas;
    setTareas((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/tareas/${id}`, { method: "DELETE" });
    if (!res.ok) setTareas(snapshot);
  };

  return (
    <div>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 12, fontFamily: "var(--font-inter), sans-serif" }}>
        Tareas{" "}
        <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
          ({pendientes.length} pendientes)
        </span>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tareas.length === 0 && (
          <div style={{ background: "#141414", borderRadius: 16, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>
            Sin tareas. Agrega la primera abajo.
          </div>
        )}

        {pendientes.map((t) => (
          <TareaItem key={t.id} tarea={t} onToggle={() => toggleTarea(t)} onDelete={() => eliminarTarea(t.id)} />
        ))}

        {completadas.length > 0 && (
          <>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", padding: "8px 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Completadas
            </p>
            {completadas.map((t) => (
              <TareaItem key={t.id} tarea={t} onToggle={() => toggleTarea(t)} onDelete={() => eliminarTarea(t.id)} />
            ))}
          </>
        )}

        <form
          onSubmit={agregarTarea}
          style={{
            display: "flex",
            gap: 8,
            background: "#141414",
            borderRadius: 16,
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <input
            type="text"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="+ Nueva tarea..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.88rem",
            }}
          />
          <button
            type="submit"
            disabled={agregando || !nuevaTarea.trim()}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              background: nuevaTarea.trim() ? "#c5f135" : "rgba(255,255,255,0.06)",
              color: nuevaTarea.trim() ? "#000" : "rgba(255,255,255,0.3)",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: nuevaTarea.trim() ? "pointer" : "default",
              opacity: agregando ? 0.5 : 1,
            }}
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}

function TareaItem({
  tarea,
  onToggle,
  onDelete,
}: {
  tarea: Tarea;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cfg = PRIORIDAD[tarea.prioridad] ?? PRIORIDAD.BAJA;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: tarea.completada ? "#0d0d0d" : "#141414",
        border: `1px solid ${tarea.completada ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        padding: "12px 14px",
        opacity: tarea.completada ? 0.5 : 1,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          flexShrink: 0,
          cursor: "pointer",
          background: tarea.completada ? "#c5f135" : "transparent",
          border: tarea.completada ? "none" : "2px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {tarea.completada && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </button>

      <span style={{
        flex: 1,
        fontSize: "0.88rem",
        color: tarea.completada ? "rgba(255,255,255,0.35)" : "#fff",
        textDecoration: tarea.completada ? "line-through" : "none",
        fontWeight: 500,
      }}>
        {tarea.titulo}
      </span>

      <span style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.68rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}>
        {cfg.label}
      </span>

      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.2)",
          fontSize: "0.8rem",
          padding: "0 2px",
          lineHeight: 1,
        }}
        title="Eliminar"
      >
        ✕
      </button>
    </div>
  );
}
