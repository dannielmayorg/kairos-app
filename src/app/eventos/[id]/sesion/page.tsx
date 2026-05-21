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

const prioridadConfig: Record<string, { label: string; color: string; bg: string }> = {
  ALTA:  { label: "Alta",  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  MEDIA: { label: "Media", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  BAJA:  { label: "Baja",  color: "#475569", bg: "rgba(71,85,105,0.12)" },
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

  useEffect(() => { cargar(); }, [cargar]);

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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div
            className="rounded-2xl mb-4 mx-auto"
            style={{ width: 48, height: 48, background: "rgba(139,92,246,0.2)", animation: "pulse 1.5s infinite" }}
          />
          <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--text-3)" }}>Evento no encontrado.</p>
      </div>
    );
  }

  const pendientes = evento.tareas.filter((t) => !t.completada);
  const completadas = evento.tareas.filter((t) => t.completada);
  const progreso = evento.tareas.length > 0
    ? Math.round((completadas.length / evento.tareas.length) * 100)
    : 0;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between"
        style={{
          background: "rgba(9,9,15,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href={`/eventos/${id}`}
          className="flex items-center gap-2"
          style={{ color: "var(--text-2)", fontSize: "0.9rem" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </Link>

        <span
          className="badge"
          style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          Sesión activa
        </span>

        <button
          onClick={completarEvento}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          Completar
        </button>
      </header>

      <main className="flex-1 px-5 py-6 space-y-6 pb-10">

        {/* Event info */}
        <div
          className="card p-5"
          style={{ borderLeft: `3px solid ${evento.proyecto.color}` }}
        >
          <span
            className="badge mb-2"
            style={{ background: `${evento.proyecto.color}18`, color: evento.proyecto.color, border: `1px solid ${evento.proyecto.color}33` }}
          >
            {evento.proyecto.nombre}
          </span>
          <h1 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "1.3rem", marginTop: 4 }}>
            {evento.nombre}
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.8rem", marginTop: 4 }}>
            {formatHora(evento.fechaInicio)} — {formatHora(evento.fechaFin)}
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>
                {completadas.length} de {evento.tareas.length} completadas
              </span>
              <span style={{ color: "var(--purple)", fontSize: "0.8rem", fontWeight: 700 }}>
                {progreso}%
              </span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className="progress-fill" style={{ height: 6, width: `${progreso}%` }} />
            </div>
          </div>
        </div>

        {/* ¡Todas completadas! */}
        {pendientes.length === 0 && evento.tareas.length > 0 && (
          <div className="card p-8 text-center">
            <div
              className="rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ width: 56, height: 56, background: "rgba(16,185,129,0.15)", fontSize: "1.5rem" }}
            >
              ✓
            </div>
            <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "1.1rem" }}>
              ¡Todas completadas!
            </p>
            <button
              onClick={completarEvento}
              className="btn-purple mt-4 px-6 py-2.5 text-sm"
            >
              Completar evento
            </button>
          </div>
        )}

        {/* Pendientes */}
        {pendientes.length > 0 && (
          <section>
            <p className="section-label mb-3">Pendientes ({pendientes.length})</p>
            <div className="space-y-2">
              {pendientes.map((t) => {
                const cfg = prioridadConfig[t.prioridad] ?? prioridadConfig.BAJA;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTarea(t.id)}
                    className="card w-full px-4 py-3.5 flex items-center gap-3 text-left"
                  >
                    <div
                      className="flex-shrink-0 rounded-lg border-2 flex items-center justify-center"
                      style={{ width: 22, height: 22, borderColor: "var(--border-2)" }}
                    />
                    <span className="flex-1" style={{ color: "var(--text-1)", fontSize: "0.9rem" }}>
                      {t.titulo}
                    </span>
                    <span
                      className="badge"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Completadas */}
        {completadas.length > 0 && (
          <section>
            <p className="section-label mb-3">Completadas ({completadas.length})</p>
            <div className="space-y-2">
              {completadas.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTarea(t.id)}
                  className="card w-full px-4 py-3.5 flex items-center gap-3 text-left"
                  style={{ opacity: 0.45 }}
                >
                  <div
                    className="flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{ width: 22, height: 22, background: "var(--purple)", color: "#fff", fontSize: "0.75rem" }}
                  >
                    ✓
                  </div>
                  <span className="flex-1 line-through" style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>
                    {t.titulo}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
