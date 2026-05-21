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
      <main className="has-bottom-nav min-h-dvh" style={{ background: "var(--bg)" }}>

        {/* ── Header ──────────────────────────────────── */}
        <div
          className="px-5 pt-14 pb-8"
          style={{
            background: "linear-gradient(180deg, rgba(124,58,237,0.18) 0%, transparent 100%)",
          }}
        >
          <p style={{ color: "var(--text-3)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {saludo}
          </p>
          <h1
            className="mt-1 font-bold tracking-tight"
            style={{ fontSize: "2rem", color: "var(--text-1)" }}
          >
            K.A.I.R.O.S.
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: 2 }}>
            Kind of An Intelligent Reminder, Obviously Superior
          </p>

          {/* Stats pill row */}
          <div className="flex gap-3 mt-5">
            <div className="badge" style={{ background: "rgba(139,92,246,0.15)", color: "var(--purple)", border: "1px solid rgba(139,92,246,0.25)" }}>
              {eventosActivos.length} activo{eventosActivos.length !== 1 ? "s" : ""}
            </div>
            <div className="badge" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              {eventosPendientes.length} próximo{eventosPendientes.length !== 1 ? "s" : ""}
            </div>
            <div className="badge" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="px-5 space-y-8">

          {/* ── Sesiones activas ─────────────────────── */}
          {eventosActivos.length > 0 && (
            <section>
              <p className="section-label mb-3">En sesión ahora</p>
              <div className="space-y-3">
                {eventosActivos.map((evento) => {
                  const pendientes = evento.tareas.filter((t) => !t.completada).length;
                  const total = evento.tareas.length;
                  const pct = total > 0 ? Math.round(((total - pendientes) / total) * 100) : 0;
                  return (
                    <Link
                      key={evento.id}
                      href={`/eventos/${evento.id}/sesion`}
                      className="card p-4 block"
                      style={{ borderLeft: `3px solid ${evento.proyecto.color}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="badge"
                            style={{ background: `${evento.proyecto.color}22`, color: evento.proyecto.color, border: `1px solid ${evento.proyecto.color}44` }}
                          >
                            {evento.proyecto.nombre}
                          </span>
                          <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }}>
                            Activo
                          </span>
                        </div>
                        <span style={{ color: "var(--purple)", fontSize: "0.8rem", fontWeight: 600 }}>Ver →</span>
                      </div>
                      <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "1rem" }}>{evento.nombre}</p>
                      <p style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: 2 }}>
                        {pendientes} de {total} tareas pendientes
                      </p>
                      <div className="progress-track mt-3" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ height: 4, width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Próximos eventos ─────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">Próximos eventos</p>
              <Link href="/proyectos" style={{ color: "var(--purple)", fontSize: "0.75rem", fontWeight: 600 }}>
                Ver todos →
              </Link>
            </div>

            {eventosPendientes.length === 0 ? (
              <div className="card p-8 text-center">
                <p style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>No hay eventos próximos.</p>
                <Link
                  href="/nuevo-evento"
                  className="btn-purple inline-block mt-4 px-5 py-2.5 text-sm"
                >
                  + Crear evento
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {eventosPendientes.map((evento) => (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    className="card px-4 py-3 flex items-center gap-3"
                  >
                    <div
                      className="flex-shrink-0 rounded-xl flex items-center justify-center"
                      style={{ width: 40, height: 40, background: `${evento.proyecto.color}18`, border: `1px solid ${evento.proyecto.color}33` }}
                    >
                      <div className="rounded-full" style={{ width: 8, height: 8, background: evento.proyecto.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "0.9rem" }} className="truncate">
                        {evento.nombre}
                      </p>
                      <p style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: 1 }}>
                        {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                      </p>
                    </div>
                    <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>{evento.proyecto.nombre}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Proyectos ────────────────────────────── */}
          <section>
            <p className="section-label mb-3">Proyectos</p>
            {proyectos.length === 0 ? (
              <div className="card p-8 text-center">
                <p style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>Aún no tienes proyectos.</p>
                <Link
                  href="/nuevo-proyecto"
                  className="btn-purple inline-block mt-4 px-5 py-2.5 text-sm"
                >
                  + Crear proyecto
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {proyectos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    className="card p-4"
                    style={{ borderTop: `2px solid ${p.color}` }}
                  >
                    <div
                      className="rounded-xl mb-3 flex items-center justify-center"
                      style={{ width: 36, height: 36, background: `${p.color}18` }}
                    >
                      <div className="rounded-full" style={{ width: 10, height: 10, background: p.color }} />
                    </div>
                    <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "0.9rem" }} className="truncate">
                      {p.nombre}
                    </p>
                    <p style={{ color: "var(--text-3)", fontSize: "0.72rem", marginTop: 2 }}>
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
