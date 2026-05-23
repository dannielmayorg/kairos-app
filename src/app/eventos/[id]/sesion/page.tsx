"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatHora } from "@/lib/dateUtils";

type Tarea = {
  id: string;
  titulo: string;
  prioridad: string;
  completada: boolean;
  completadaEn: string | null;
  horaAviso: string | null;
  avisoEnviado: boolean;
};
type Evento = {
  id: string; nombre: string; icono: string; estado: string;
  fechaInicio: string; fechaFin: string;
  proyecto: { nombre: string; color: string };
  tareas: Tarea[];
};

const PRIORIDAD: Record<string, { label: string; color: string; bg: string }> = {
  ALTA:  { label: "Alta",  color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  MEDIA: { label: "Media", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  BAJA:  { label: "Baja",  color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" },
};

export default function SesionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

  // Agregar tarea
  const [mostrarInput, setMostrarInput] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [usarHora, setUsarHora] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Editar aviso de tarea existente
  const [editandoAviso, setEditandoAviso] = useState<string | null>(null);
  const [horaEditando, setHoraEditando] = useState("");

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/eventos/${id}`);
    if (res.ok) setEvento(await res.json());
    setCargando(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { if (mostrarInput) inputRef.current?.focus(); }, [mostrarInput]);

  const toggleTarea = async (tareaId: string) => {
    const res = await fetch(`/api/tareas/${tareaId}/completar`, { method: "PATCH" });
    if (res.ok) cargar();
  };

  const agregarTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.trim() || !evento) return;
    setAgregando(true);
    await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventoId: id,
        titulo: nuevaTarea.trim(),
        orden: evento.tareas.length,
        horaAviso: usarHora && nuevaHora ? nuevaHora : null,
      }),
    });
    setNuevaTarea("");
    setNuevaHora("");
    setUsarHora(false);
    setMostrarInput(false);
    setAgregando(false);
    cargar();
  };

  const guardarAviso = async (tareaId: string) => {
    await fetch(`/api/tareas/${tareaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horaAviso: horaEditando || null }),
    });
    setEditandoAviso(null);
    setHoraEditando("");
    cargar();
  };

  const quitarAviso = async (tareaId: string) => {
    await fetch(`/api/tareas/${tareaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horaAviso: null }),
    });
    setEditandoAviso(null);
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

  if (cargando) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>Cargando...</p>
    </div>
  );

  if (!evento) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <p style={{ color: "rgba(255,255,255,0.3)" }}>Evento no encontrado.</p>
    </div>
  );

  const pendientes = evento.tareas.filter((t) => !t.completada);
  const completadas = evento.tareas.filter((t) => t.completada);
  const pct = evento.tareas.length > 0 ? Math.round((completadas.length / evento.tareas.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header className="safe-header" style={{
        position: "sticky", top: 0, zIndex: 50,
        paddingBottom: 14,
        paddingLeft: 20,
        paddingRight: 20,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href={`/eventos/${id}`} aria-label="Volver al evento" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, padding: "10px 10px 10px 0", margin: "-10px -10px -10px 0" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(197,241,53,0.12)", border: "1px solid rgba(197,241,53,0.3)", borderRadius: 999, padding: "5px 14px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c5f135" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c5f135" }}>Sesión activa</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href={`/eventos/${id}/editar`} style={{ color: "rgba(255,255,255,0.35)", display: "flex" }} title="Editar evento">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
          <button onClick={completarEvento} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500, padding: 0 }}>
            Completar
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>

        {/* Info card */}
        <div style={{ background: "#141414", borderRadius: 20, padding: "20px" }}>
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: 999,
            fontSize: "0.7rem", fontWeight: 700,
            background: `${evento.proyecto.color}18`, color: evento.proyecto.color,
            border: `1px solid ${evento.proyecto.color}33`, marginBottom: 10,
          }}>
            {evento.proyecto.nombre}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{evento.icono}</span>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>{evento.nombre}</h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", marginBottom: 16 }}>
            {formatHora(evento.fechaInicio)} — {formatHora(evento.fechaFin)}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              {completadas.length} de {evento.tareas.length} completadas
            </span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#c5f135" }}>{pct}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 5, overflow: "hidden" }}>
            <div style={{ height: 5, width: `${pct}%`, background: "#c5f135", borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Todas completadas */}
        {pendientes.length === 0 && evento.tareas.length > 0 && (
          <div style={{ background: "#141414", borderRadius: 20, padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>✓</div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}>¡Todas completadas!</p>
            <button onClick={completarEvento} style={{ background: "#c5f135", color: "#000", border: "none", borderRadius: 14, padding: "12px 28px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
              Completar evento
            </button>
          </div>
        )}

        {/* Pendientes */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>
              {pendientes.length > 0 ? `Pendientes (${pendientes.length})` : "Tareas"}
            </p>
            <button
              onClick={() => { setMostrarInput((v) => !v); setUsarHora(false); setNuevaHora(""); }}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#c5f135", fontSize: "0.8rem", fontWeight: 700, padding: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              Agregar
            </button>
          </div>

          {/* Form agregar */}
          {mostrarInput && (
            <form onSubmit={agregarTarea} style={{ marginBottom: 12, background: "#141414", borderRadius: 16, padding: "14px", display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(197,241,53,0.2)" }}>
              <input
                ref={inputRef}
                type="text"
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                placeholder="Nombre de la tarea..."
                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.95rem", fontWeight: 500 }}
              />

              {/* Toggle recordatorio */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setUsarHora((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                    background: usarHora ? "rgba(197,241,53,0.15)" : "rgba(255,255,255,0.06)",
                    color: usarHora ? "#c5f135" : "rgba(255,255,255,0.35)",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  Recordatorio
                </button>

                {usarHora && (
                  <input
                    type="time"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    style={{
                      background: "#1a1a1a", border: "1px solid rgba(197,241,53,0.3)",
                      borderRadius: 10, padding: "4px 10px",
                      color: "#c5f135", fontSize: "0.85rem", outline: "none",
                    }}
                  />
                )}

                <button
                  type="submit"
                  disabled={!nuevaTarea.trim() || agregando}
                  style={{
                    marginLeft: "auto", padding: "5px 16px", borderRadius: 10,
                    background: nuevaTarea.trim() ? "#c5f135" : "rgba(255,255,255,0.06)",
                    color: nuevaTarea.trim() ? "#000" : "rgba(255,255,255,0.25)",
                    border: "none", fontWeight: 700, fontSize: "0.82rem",
                    cursor: nuevaTarea.trim() ? "pointer" : "default",
                  }}
                >
                  {agregando ? "..." : "Agregar"}
                </button>
              </div>
            </form>
          )}

          {pendientes.length === 0 && !mostrarInput && (
            <div style={{ background: "#141414", borderRadius: 16, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.85rem" }}>
              Sin tareas pendientes — toca Agregar para añadir
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendientes.map((t) => {
              const cfg = PRIORIDAD[t.prioridad] ?? PRIORIDAD.BAJA;
              const editando = editandoAviso === t.id;
              return (
                <div key={t.id}>
                  <button
                    onClick={() => toggleTarea(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: "#141414", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: editando ? "16px 16px 0 0" : 16,
                      padding: "14px 16px", cursor: "pointer",
                      textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 8, border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, color: "#fff", fontSize: "0.92rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titulo}</span>

                    {/* Hora aviso badge */}
                    {t.horaAviso && (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", borderRadius: 999,
                        fontSize: "0.68rem", fontWeight: 700,
                        background: t.avisoEnviado ? "rgba(255,255,255,0.06)" : "rgba(197,241,53,0.12)",
                        color: t.avisoEnviado ? "rgba(255,255,255,0.25)" : "#c5f135",
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {t.horaAviso}
                      </span>
                    )}

                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>

                    {/* Botón reloj */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editando) {
                          setEditandoAviso(null);
                        } else {
                          setEditandoAviso(t.id);
                          setHoraEditando(t.horaAviso ?? "");
                        }
                      }}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0,
                        color: t.horaAviso ? "#c5f135" : "rgba(255,255,255,0.2)",
                      }}
                      title="Recordatorio"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </button>
                  </button>

                  {/* Panel editar aviso */}
                  {editando && (
                    <div style={{
                      background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "0 0 16px 16px",
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Notificar a las</span>
                      <input
                        type="time"
                        value={horaEditando}
                        onChange={(e) => setHoraEditando(e.target.value)}
                        autoFocus
                        style={{
                          background: "#141414", border: "1px solid rgba(197,241,53,0.3)",
                          borderRadius: 8, padding: "4px 10px",
                          color: "#c5f135", fontSize: "0.85rem", outline: "none",
                        }}
                      />
                      <button
                        onClick={() => guardarAviso(t.id)}
                        style={{ padding: "4px 12px", borderRadius: 8, background: "#c5f135", color: "#000", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", marginLeft: "auto" }}
                      >
                        Guardar
                      </button>
                      {t.horaAviso && (
                        <button
                          onClick={() => quitarAviso(t.id)}
                          style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Completadas */}
        {completadas.length > 0 && (
          <section>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "var(--font-inter), sans-serif" }}>
              Completadas ({completadas.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {completadas.map((t) => (
                <button key={t.id} onClick={() => toggleTarea(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 16, padding: "14px 16px",
                  cursor: "pointer", textAlign: "left", width: "100%", opacity: 0.5,
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: "#c5f135", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <span style={{ flex: 1, color: "rgba(255,255,255,0.4)", fontSize: "0.92rem", textDecoration: "line-through" }}>{t.titulo}</span>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
