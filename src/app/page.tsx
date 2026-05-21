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
      include: {
        proyecto: { select: { nombre: true, color: true } },
        tareas: true,
      },
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
      <main className="has-bottom-nav min-h-dvh" style={{ background: "#09090f" }}>

        {/* ── HERO — gradiente púrpura real ────────── */}
        <div style={{
          background: "linear-gradient(170deg, #6d28d9 0%, #4c1d95 35%, #1e1045 65%, #09090f 100%)",
          paddingTop: "env(safe-area-inset-top)",
        }}>
          <div style={{ padding: "48px 24px 36px" }}>

            {/* Greeting */}
            <p className="greeting-label" style={{ marginBottom: 6 }}>
              {saludo}
            </p>

            {/* App name */}
            <h1 style={{
              fontSize: "2.6rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 4,
            }}>
              K.A.I.R.O.S.
            </h1>

            <p style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 28,
            }}>
              Kind of An Intelligent Reminder, Obviously Superior
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: eventosActivos.length === 1 ? "1 activo" : `${eventosActivos.length} activos`, highlight: eventosActivos.length > 0 },
                { label: `${eventosPendientes.length} próximos`, highlight: false },
                { label: `${proyectos.length} proyectos`, highlight: false },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background: s.highlight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  border: s.highlight ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY — cartas sobre fondo oscuro ─────── */}
        <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Sesiones activas */}
          {eventosActivos.length > 0 && (
            <section>
              <p className="section-title" style={{ marginBottom: 12, paddingLeft: 4 }}>
                En sesión ahora
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                        background: "linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(28,22,60,0.9) 100%)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderLeft: `3px solid ${evento.proyecto.color}`,
                        borderRadius: 20,
                        padding: "16px 18px",
                        textDecoration: "none",
                        boxShadow: "0 8px 32px rgba(109,40,217,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            background: `${evento.proyecto.color}22`,
                            color: evento.proyecto.color,
                            border: `1px solid ${evento.proyecto.color}44`,
                          }}>
                            {evento.proyecto.nombre}
                          </span>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.3)",
                          }}>
                            Activo
                          </span>
                        </div>
                        <span style={{ color: "#a78bfa", fontSize: "0.8rem", fontWeight: 600 }}>Ver →</span>
                      </div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>
                        {evento.nombre}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginBottom: 12 }}>
                        {pendientes} de {total} tareas pendientes
                      </p>
                      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 4, overflow: "hidden" }}>
                        <div style={{
                          height: 4,
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                          borderRadius: 999,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Próximos eventos */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 4 }}>
              <p className="section-title">
                Próximos eventos
              </p>
              <Link href="/proyectos" style={{ color: "#8b5cf6", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                Ver todos →
              </Link>
            </div>

            {eventosPendientes.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "32px 24px",
                textAlign: "center",
              }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.9rem", marginBottom: 16 }}>
                  No hay eventos próximos
                </p>
                <Link href="/nuevo-evento" style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                }}>
                  + Crear evento
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eventosPendientes.map((evento) => (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: `${evento.proyecto.color}18`,
                      border: `1px solid ${evento.proyecto.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: evento.proyecto.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {evento.nombre}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginTop: 2 }}>
                        {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                      </p>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", flexShrink: 0 }}>
                      {evento.proyecto.nombre}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Proyectos */}
          <section>
            <p className="section-title" style={{ marginBottom: 12, paddingLeft: 4 }}>
              Proyectos
            </p>

            {proyectos.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "32px 24px",
                textAlign: "center",
              }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.9rem", marginBottom: 16 }}>
                  Sin proyectos aún
                </p>
                <Link href="/nuevo-proyecto" style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
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
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: `2px solid ${p.color}`,
                      borderRadius: 18,
                      padding: "16px",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: `${p.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                    </div>
                    <p style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {p.nombre}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", marginTop: 3 }}>
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
