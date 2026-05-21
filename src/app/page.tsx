import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import PushSubscriber from "@/components/PushSubscriber";
import { formatFecha, formatHora } from "@/lib/dateUtils";
import { sincronizarEstados } from "./api/cron/notificaciones/route";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await sincronizarEstados();

  const [proyectos, eventosActivos, eventosPendientes] = await Promise.all([
    prisma.proyecto.findMany({
      orderBy: { creadoEn: "desc" },
      include: { _count: { select: { eventos: true } } },
    }),
    prisma.evento.findMany({
      where: { estado: "ACTIVO" },
      include: { proyecto: { select: { nombre: true, color: true } }, tareas: true },
      orderBy: { fechaInicio: "asc" },
    }),
    prisma.evento.findMany({
      where: { estado: "PENDIENTE", fechaInicio: { gte: new Date() } },
      include: { proyecto: { select: { nombre: true, color: true } } },
      orderBy: { fechaInicio: "asc" },
      take: 5,
    }),
  ]);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <PushSubscriber />
      <main className="has-bottom-nav" style={{ background: "#000", minHeight: "100dvh" }}>

        {/* ── Header ──────────────────────────── */}
        <div style={{
          padding: "56px 20px 20px",
          paddingTop: "calc(56px + env(safe-area-inset-top))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <p className="greeting-label" style={{ marginBottom: 4 }}>{saludo}</p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 3 }}>
              K.A.I.R.O.S.
            </h1>
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", fontWeight: 500, letterSpacing: "0.01em" }}>
              Kind of An Intelligent Reminder, Obviously Superior
            </p>
          </div>
          <Link href="/nuevo-proyecto" style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#1c1c1c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>

        {/* ── Stats pills ──────────────────────── */}
        <div style={{ padding: "0 20px 24px", display: "flex", gap: 8 }}>
          <div style={{ padding: "7px 14px", borderRadius: 999, background: eventosActivos.length > 0 ? "#8b5cf6" : "#1c1c1c", fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
            {eventosActivos.length} activo{eventosActivos.length !== 1 ? "s" : ""}
          </div>
          <div style={{ padding: "7px 14px", borderRadius: 999, background: "#1c1c1c", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            {eventosPendientes.length} próximos
          </div>
          <div style={{ padding: "7px 14px", borderRadius: 999, background: "#1c1c1c", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            {proyectos.length} proyectos
          </div>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Sesión activa — HERO CARD ────────── */}
          {eventosActivos.map((evento) => {
            const pendientes = evento.tareas.filter((t) => !t.completada).length;
            const total = evento.tareas.length;
            const pct = total > 0 ? Math.round(((total - pendientes) / total) * 100) : 0;
            return (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}/sesion`}
                style={{
                  display: "block",
                  background: "#8b5cf6",
                  borderRadius: 24,
                  padding: "24px",
                  textDecoration: "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }} />
                <div style={{
                  position: "absolute",
                  bottom: -20,
                  right: 20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    En sesión
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "4px 12px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>Activo</span>
                  </div>
                </div>

                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4, position: "relative" }}>
                  {evento.nombre}
                </p>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", marginBottom: 20, position: "relative" }}>
                  {evento.proyecto.nombre} · {pendientes} tareas pendientes
                </p>

                {/* Progress */}
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>
                      {completadas(evento.tareas)} de {total}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ height: 5, width: `${pct}%` }} />
                  </div>
                </div>

                {/* CTA */}
                <div style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 14,
                  padding: "12px",
                  position: "relative",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>Abrir sesión</span>
                </div>
              </Link>
            );
          })}

          {/* ── Próximos eventos ─────────────────── */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p className="section-title">Próximos eventos</p>
              <Link href="/proyectos" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#8b5cf6", textDecoration: "none" }}>
                Ver todos
              </Link>
            </div>

            {eventosPendientes.length === 0 ? (
              <div style={{ background: "#141414", borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 16 }}>
                  No hay eventos próximos
                </p>
                <Link href="/nuevo-evento" style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "#8b5cf6",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}>
                  + Crear evento
                </Link>
              </div>
            ) : (
              <div style={{ background: "#141414", borderRadius: 20, overflow: "hidden" }}>
                {eventosPendientes.map((evento, i) => (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      textDecoration: "none",
                      borderBottom: i < eventosPendientes.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 13,
                      background: `${evento.proyecto.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: evento.proyecto.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {evento.nombre}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginTop: 2 }}>
                        {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Proyectos ────────────────────────── */}
          <section style={{ paddingBottom: 8 }}>
            <p className="section-title" style={{ marginBottom: 14 }}>Proyectos</p>

            {proyectos.length === 0 ? (
              <div style={{ background: "#141414", borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 16 }}>Sin proyectos aún</p>
                <Link href="/nuevo-proyecto" style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "#8b5cf6",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}>
                  + Crear proyecto
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {proyectos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    style={{
                      display: "block",
                      background: "#141414",
                      border: `1px solid ${p.color}30`,
                      borderTop: `2px solid ${p.color}`,
                      borderRadius: 18,
                      padding: "16px 14px",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `${p.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    </div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nombre}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.7rem", marginTop: 3 }}>
                      {p._count.eventos} evento{p._count.eventos !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Navbar />
    </>
  );
}

function completadas(tareas: { completada: boolean }[]) {
  return tareas.filter((t) => t.completada).length;
}
