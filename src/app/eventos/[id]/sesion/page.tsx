"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatHora } from "@/lib/dateUtils";

type Tarea = {
  id: string;
  titulo: string;
  prioridad: string;
  completada: boolean;
  completadaEn: string | null;
};

type Evento = {
  id: string;
  nombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  proyecto: { nombre: string; color: string };
  tareas: Tarea[];
};

const prioridadColor: Record<string, string> = {
  ALTA: "text-red-400",
  MEDIA: "text-yellow-400",
  BAJA: "text-slate-500",
};

export default function SesionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/eventos/${id}`);
    if (res.ok) setEvento(await res.json());
    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggleTarea = async (tareaId: string) => {
    await fetch(`/api/tareas/${tareaId}/completar`, { method: "PATCH" });
    cargar();
  };

  const completarEvento = async () => {
    await fetch(`/api/eventos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "COMPLETADO" }),
    });
    router.push(`/eventos/${id}`);
  };

  if (cargando) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Cargando sesión...</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-slate-500">Evento no encontrado.</p>
      </div>
    );
  }

  const pendientes = evento.tareas.filter((t) => !t.completada);
  const completadas = evento.tareas.filter((t) => t.completada);
  const progreso = evento.tareas.length > 0
    ? Math.round((completadas.length / evento.tareas.length) * 100)
    : 0;

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--kairos-dark)" }}>
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "var(--kairos-card)", borderBottom: "1px solid var(--kairos-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link href={`/eventos/${id}`} className="text-slate-400 hover:text-slate-200">
            ← Volver
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
            Sesión activa
          </span>
        </div>
        <button
          onClick={completarEvento}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-medium hover:bg-slate-600 transition-colors"
        >
          Completar evento
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: evento.proyecto.color }}
          >
            {evento.proyecto.nombre}
          </div>
          <h1 className="text-2xl font-bold text-slate-200">{evento.nombre}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {formatHora(evento.fechaInicio)} — {formatHora(evento.fechaFin)}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{completadas.length} de {evento.tareas.length} completadas</span>
            <span>{progreso}%</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--kairos-border)" }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%`, backgroundColor: "var(--kairos-purple)" }}
            />
          </div>
        </div>

        {pendientes.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Pendientes ({pendientes.length})
            </h2>
            <div className="space-y-2">
              {pendientes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTarea(t.id)}
                  className="card w-full px-4 py-3 flex items-center gap-3 text-left hover:border-indigo-500/50 transition-colors"
                >
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0 hover:border-indigo-500" />
                  <span className="flex-1 text-sm text-slate-200">{t.titulo}</span>
                  <span className={`text-xs ${prioridadColor[t.prioridad] ?? "text-slate-500"}`}>
                    {t.prioridad.charAt(0) + t.prioridad.slice(1).toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {pendientes.length === 0 && evento.tareas.length > 0 && (
          <div className="card p-8 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-slate-200 font-medium">¡Todas las tareas completadas!</p>
            <button
              onClick={completarEvento}
              className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Completar evento
            </button>
          </div>
        )}

        {completadas.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
              Completadas ({completadas.length})
            </h2>
            <div className="space-y-2">
              {completadas.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTarea(t.id)}
                  className="card w-full px-4 py-3 flex items-center gap-3 text-left opacity-50 hover:opacity-70 transition-opacity"
                >
                  <div className="w-5 h-5 rounded border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs">
                    ✓
                  </div>
                  <span className="flex-1 text-sm text-slate-400 line-through">{t.titulo}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
