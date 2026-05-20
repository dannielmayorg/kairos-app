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

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/proyectos" className="hover:text-slate-300">Proyectos</Link>
          <span>/</span>
          <Link href={`/proyectos/${evento.proyecto.id}`} className="hover:text-slate-300">
            {evento.proyecto.nombre}
          </Link>
          <span>/</span>
          <span className="text-slate-300">{evento.nombre}</span>
        </div>

        <div className="card p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: evento.proyecto.color }}
                />
                <span className="text-sm text-slate-400">{evento.proyecto.nombre}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-200 mb-1">{evento.nombre}</h1>
              {evento.descripcion && (
                <p className="text-sm text-slate-400 mb-2">{evento.descripcion}</p>
              )}
              <p className="text-sm text-slate-500">
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
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors"
            >
              ▶ Abrir sesión activa
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
      </main>
    </>
  );
}
