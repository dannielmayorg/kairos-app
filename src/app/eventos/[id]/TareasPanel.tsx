"use client";

import { useState } from "react";

type Tarea = {
  id: string;
  titulo: string;
  prioridad: string;
  completada: boolean;
};

const prioridadConfig: Record<string, { label: string; color: string }> = {
  ALTA: { label: "Alta", color: "text-red-400" },
  MEDIA: { label: "Media", color: "text-yellow-400" },
  BAJA: { label: "Baja", color: "text-slate-500" },
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
    setTareas((prev) =>
      prev.map((t) => (t.id === tarea.id ? { ...t, completada: !t.completada } : t))
    );
    await fetch(`/api/tareas/${tarea.id}/completar`, { method: "PATCH" });
  };

  const agregarTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;
    setAgregando(true);
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventoId,
        titulo: nuevaTarea.trim(),
        orden: tareas.length,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTareas((prev) => [...prev, t]);
      setNuevaTarea("");
    }
    setAgregando(false);
  };

  const eliminarTarea = async (id: string) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tareas/${id}`, { method: "DELETE" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-300">
          Tareas{" "}
          <span className="text-slate-500 font-normal">
            ({pendientes.length} pendientes)
          </span>
        </h2>
      </div>

      <div className="space-y-2">
        {tareas.length === 0 && (
          <div
            className="card p-6 text-center text-slate-500 text-sm"
          >
            Sin tareas. Agrega la primera abajo.
          </div>
        )}

        {pendientes.map((t) => (
          <TareaItem
            key={t.id}
            tarea={t}
            onToggle={() => toggleTarea(t)}
            onDelete={() => eliminarTarea(t.id)}
          />
        ))}

        {completadas.length > 0 && (
          <>
            <p className="text-xs text-slate-600 pt-3 pb-1">Completadas</p>
            {completadas.map((t) => (
              <TareaItem
                key={t.id}
                tarea={t}
                onToggle={() => toggleTarea(t)}
                onDelete={() => eliminarTarea(t.id)}
              />
            ))}
          </>
        )}

        <form onSubmit={agregarTarea} className="card px-4 py-3 flex gap-2">
          <input
            type="text"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="+ Nueva tarea..."
            className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none"
          />
          <button
            type="submit"
            disabled={agregando || !nuevaTarea.trim()}
            className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
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
  const cfg = prioridadConfig[tarea.prioridad] ?? prioridadConfig.MEDIA;
  return (
    <div
      className={`card px-4 py-3 flex items-center gap-3 group ${
        tarea.completada ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          tarea.completada
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "border-slate-600 hover:border-indigo-500"
        }`}
      >
        {tarea.completada && <span className="text-xs">✓</span>}
      </button>
      <span
        className={`flex-1 text-sm ${
          tarea.completada ? "line-through text-slate-500" : "text-slate-200"
        }`}
      >
        {tarea.titulo}
      </span>
      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
      <button
        onClick={onDelete}
        className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs ml-1"
        title="Eliminar"
      >
        ✕
      </button>
    </div>
  );
}
