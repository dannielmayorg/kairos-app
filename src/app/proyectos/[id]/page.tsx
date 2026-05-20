import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { formatFecha, formatHora } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

const estadoConfig = {
  PENDIENTE: { label: "Pendiente", color: "text-slate-400 bg-slate-700/50" },
  ACTIVO: { label: "Activo", color: "text-green-400 bg-green-500/20" },
  COMPLETADO: { label: "Completado", color: "text-slate-500 bg-slate-800" },
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
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/proyectos" className="hover:text-slate-300">Proyectos</Link>
          <span>/</span>
          <span className="text-slate-300">{proyecto.nombre}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: proyecto.color }}
            />
            <h1 className="text-2xl font-bold text-slate-200">{proyecto.nombre}</h1>
          </div>
          <Link
            href={`/nuevo-evento?proyectoId=${proyecto.id}`}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            + Nuevo evento
          </Link>
        </div>

        {proyecto.eventos.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <p>Sin eventos en este proyecto.</p>
            <Link
              href={`/nuevo-evento?proyectoId=${proyecto.id}`}
              className="mt-3 inline-block text-indigo-400 hover:underline text-sm"
            >
              Crear primer evento →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proyecto.eventos.map((evento) => {
              const cfg = estadoConfig[evento.estado];
              return (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="card p-4 flex items-center justify-between hover:border-indigo-500/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {categoriaLabel[evento.categoria] ?? evento.categoria}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{evento.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFecha(evento.fechaInicio)} · {formatHora(evento.fechaInicio)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {evento._count.tareas} tarea{evento._count.tareas !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
