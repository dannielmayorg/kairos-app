import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { formatFecha, formatHora } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE:  { label: "Pendiente",  color: "#f59e0b",              bg: "rgba(245,158,11,0.12)"  },
  ACTIVO:     { label: "Activo",     color: "#c5f135",              bg: "rgba(197,241,53,0.12)"  },
  COMPLETADO: { label: "Completado", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" },
};

const categoriaLabel: Record<string, string> = {
  REUNION: "Reunión",
  SESION: "Sesión",
  TALLER: "Taller",
  OTRO: "Otro",
};

export default async function ProyectoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      eventos: {
        orderBy: { fechaInicio: "asc" },
        include: { _count: { select: { tareas: true } } },
      },
    },
  });

  if (!proyecto) notFound();

  return (
    <>
      <main style={{ background: "#000", minHeight: "100dvh" }}>

        {/* Header */}
        <header className="safe-header" style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          paddingBottom: 14,
          paddingLeft: 20,
          paddingRight: 20,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <Link href="/proyectos" aria-label="Volver a proyectos" style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 10, margin: -10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: proyecto.color, flexShrink: 0 }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{proyecto.nombre}</span>
          </div>
          <Link href={`/proyectos/${proyecto.id}/editar`} aria-label="Editar proyecto" style={{ color: "rgba(255,255,255,0.35)", display: "flex", padding: 10, margin: -10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
        </header>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Project summary card */}
          <div style={{
            background: "#141414",
            borderRadius: 20,
            padding: "20px",
            borderLeft: `3px solid ${proyecto.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <span style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: 999,
                fontSize: "0.7rem",
                fontWeight: 700,
                background: `${proyecto.color}18`,
                color: proyecto.color,
                border: `1px solid ${proyecto.color}33`,
                marginBottom: 8,
              }}>
                Proyecto
              </span>
              <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
                {proyecto.nombre}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginTop: 4 }}>
                {proyecto.eventos.length} evento{proyecto.eventos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={`/nuevo-evento?proyectoId=${proyecto.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 12,
                background: "#c5f135",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.82rem",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              + Evento
            </Link>
          </div>

          {/* Events list */}
          {proyecto.eventos.length === 0 ? (
            <div style={{ background: "#141414", borderRadius: 20, padding: "48px 20px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 16 }}>
                Sin eventos en este proyecto
              </p>
              <Link
                href={`/nuevo-evento?proyectoId=${proyecto.id}`}
                style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "#c5f135",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                + Crear evento
              </Link>
            </div>
          ) : (
            <div style={{ background: "#141414", borderRadius: 20, overflow: "hidden" }}>
              {proyecto.eventos.map((evento, i) => {
                const cfg = estadoConfig[evento.estado] ?? estadoConfig.PENDIENTE;
                return (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    className="tappable"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      textDecoration: "none",
                      borderBottom: i < proyecto.eventos.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          background: cfg.bg,
                          color: cfg.color,
                        }}>
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
                          {categoriaLabel[evento.categoria] ?? evento.categoria}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1rem" }}>{(evento as { icono?: string }).icono ?? "📅"}</span>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {evento.nombre}
                        </p>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginTop: 2 }}>
                        {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
                        {evento._count.tareas} tarea{evento._count.tareas !== 1 ? "s" : ""}
                      </p>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Navbar />
    </>
  );
}
