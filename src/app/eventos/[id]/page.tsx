import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { formatFecha, formatHora } from "@/lib/dateUtils";
import EventoAcciones from "./EventoAcciones";
import TareasPanel from "./TareasPanel";
import GoogleCalendarButton from "@/components/GoogleCalendarButton";
import { sincronizarEstados } from "@/app/api/cron/notificaciones/route";

export const dynamic = "force-dynamic";

export default async function EventoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await sincronizarEstados();
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      proyecto: { select: { id: true, nombre: true, color: true } },
      tareas: { orderBy: [{ orden: "asc" }, { creadoEn: "asc" }] },
    },
  });

  if (!evento) notFound();

  const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVO:     { label: "Activo",     color: "#c5f135",             bg: "rgba(197,241,53,0.12)" },
    PENDIENTE:  { label: "Pendiente",  color: "#f59e0b",             bg: "rgba(245,158,11,0.12)" },
    COMPLETADO: { label: "Completado", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
  };
  const est = estadoConfig[evento.estado] ?? estadoConfig.PENDIENTE;

  return (
    <>
      <main style={{ background: "#000", minHeight: "100dvh" }}>

        {/* Header */}
        <header className="safe-header" style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <Link href="/" aria-label="Volver al inicio" style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 10, margin: -10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
            <Link href={`/proyectos/${evento.proyecto.id}`} style={{ color: "inherit", textDecoration: "none" }}>
              {evento.proyecto.nombre}
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>{evento.nombre}</span>
          </div>
        </header>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Event card */}
          <div style={{
            background: "#141414",
            borderRadius: 20,
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: 999,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: `${evento.proyecto.color}18`,
                    color: evento.proyecto.color,
                    border: `1px solid ${evento.proyecto.color}33`,
                  }}>
                    {evento.proyecto.nombre}
                  </span>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: 999,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: est.bg,
                    color: est.color,
                  }}>
                    {est.label}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{evento.icono}</span>
                  <h1 style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
                    {evento.nombre}
                  </h1>
                </div>
                {evento.descripcion && (
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", marginBottom: 4 }}>
                    {evento.descripcion}
                  </p>
                )}
                <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.78rem", marginBottom: 12 }}>
                  {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)} — {formatHora(evento.fechaFin)}
                </p>
                <GoogleCalendarButton
                  evento={{
                    nombre: evento.nombre,
                    descripcion: evento.descripcion,
                    fechaInicio: evento.fechaInicio,
                    fechaFin: evento.fechaFin,
                    recurrencia: evento.recurrencia,
                    reglaRecurrencia: evento.reglaRecurrencia,
                  }}
                />
              </div>
              <EventoAcciones evento={{ id: evento.id, estado: evento.estado }} />
            </div>

            {evento.estado === "ACTIVO" && (
              <Link
                href={`/eventos/${evento.id}/sesion`}
                className="tappable"
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#c5f135",
                  color: "#000",
                  borderRadius: 14,
                  padding: "14px",
                  minHeight: 44,
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><polygon points="5,3 19,12 5,21" /></svg>
                Abrir sesión activa
              </Link>
            )}
          </div>

          <TareasPanel
            eventoId={evento.id}
            tareasIniciales={evento.tareas.map((t) => ({
              id: t.id,
              titulo: t.titulo,
              prioridad: t.prioridad,
              completada: t.completada,
            }))}
          />
        </div>
      </main>
      <Navbar />
    </>
  );
}
