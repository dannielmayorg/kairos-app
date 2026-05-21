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

  const estadoConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ACTIVO:     { label: "Activo",     color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.25)" },
    PENDIENTE:  { label: "Pendiente",  color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)" },
    COMPLETADO: { label: "Completado", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.25)" },
  };
  const est = estadoConfig[evento.estado] ?? estadoConfig.PENDIENTE;

  return (
    <>
      <main className="has-bottom-nav min-h-dvh" style={{ background: "var(--bg)" }}>

        {/* Header */}
        <header
          className="sticky top-0 z-40 px-5 py-4 flex items-center gap-3"
          style={{
            background: "rgba(9,9,15,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link href="/" style={{ color: "var(--text-2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
            <Link href={`/proyectos/${evento.proyecto.id}`} className="hover:text-slate-300 transition-colors">
              {evento.proyecto.nombre}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-2)" }}>{evento.nombre}</span>
          </div>
        </header>

        <div className="px-5 py-6 space-y-4">

          {/* Event card */}
          <div
            className="card p-5"
            style={{ borderLeft: `3px solid ${evento.proyecto.color}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="badge"
                    style={{ background: `${evento.proyecto.color}18`, color: evento.proyecto.color, border: `1px solid ${evento.proyecto.color}33` }}
                  >
                    {evento.proyecto.nombre}
                  </span>
                  <span
                    className="badge"
                    style={{ background: est.bg, color: est.color, border: `1px solid ${est.border}` }}
                  >
                    {est.label}
                  </span>
                </div>
                <h1 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "1.25rem" }}>
                  {evento.nombre}
                </h1>
                {evento.descripcion && (
                  <p style={{ color: "var(--text-2)", fontSize: "0.85rem", marginTop: 4 }}>
                    {evento.descripcion}
                  </p>
                )}
                <p style={{ color: "var(--text-3)", fontSize: "0.78rem", marginTop: 6 }}>
                  {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)} — {formatHora(evento.fechaFin)}
                </p>
                <div className="mt-3">
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
              </div>
              <EventoAcciones evento={{ id: evento.id, estado: evento.estado }} />
            </div>

            {evento.estado === "ACTIVO" && (
              <Link
                href={`/eventos/${evento.id}/sesion`}
                className="btn-purple mt-4 flex items-center justify-center gap-2 w-full py-3 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
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
