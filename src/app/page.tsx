import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import PushSubscriber from "@/components/PushSubscriber";
import { formatFecha, formatHora } from "@/lib/dateUtils";
import { sincronizarEstados } from "./api/cron/notificaciones/route";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Auto-activar/completar eventos según la hora actual
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
      where: {
        estado: "PENDIENTE",
        fechaInicio: { gte: new Date() },
      },
      include: { proyecto: { select: { nombre: true, color: true } } },
      orderBy: { fechaInicio: "asc" },
      take: 5,
    }),
  ]);

  return (
    <>
      <Navbar />
      <PushSubscriber />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-400">
              K.A.I.R.O.S.
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kind of An Intelligent Reminder, Obviously Superior
            </p>
          </div>
          <Link
            href="/nuevo-evento"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            + Nuevo evento
          </Link>
        </div>

        {eventosActivos.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              En sesión ahora
            </h2>
            <div className="space-y-3">
              {eventosActivos.map((evento) => {
                const pendientes = evento.tareas.filter((t) => !t.completada).length;
                const total = evento.tareas.length;
                return (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}/sesion`}
                    className="card p-4 flex items-center justify-between hover:border-indigo-500/50 transition-colors"
                    style={{ borderLeft: `3px solid ${evento.proyecto.color}` }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: evento.proyecto.color }}
                        >
                          {evento.proyecto.nombre}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                          Activo
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200">{evento.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pendientes} de {total} tareas pendientes
                      </p>
                    </div>
                    <span className="text-indigo-400 text-sm">Ver sesión →</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Próximos eventos
            </h2>
            <Link href="/proyectos" className="text-xs text-indigo-400 hover:underline">
              Ver proyectos →
            </Link>
          </div>
          {eventosPendientes.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>No hay eventos próximos.</p>
              <Link
                href="/nuevo-evento"
                className="mt-3 inline-block text-indigo-400 hover:underline text-sm"
              >
                Crear un evento →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {eventosPendientes.map((evento) => (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="card p-4 flex items-center justify-between hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: evento.proyecto.color }}
                    />
                    <div>
                      <p className="font-medium text-slate-200">{evento.nombre}</p>
                      <p className="text-xs text-slate-500">
                        {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{evento.proyecto.nombre}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Proyectos
            </h2>
          </div>
          {proyectos.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>Aún no tienes proyectos.</p>
              <Link
                href="/nuevo-proyecto"
                className="mt-3 inline-block text-indigo-400 hover:underline text-sm"
              >
                Crear tu primer proyecto →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {proyectos.map((p) => (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="card p-4 hover:border-indigo-500/50 transition-colors"
                  style={{ borderTop: `3px solid ${p.color}` }}
                >
                  <p className="font-medium text-slate-200 truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {p._count.eventos} evento{p._count.eventos !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
