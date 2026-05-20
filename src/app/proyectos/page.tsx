import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function Proyectos() {
  const proyectos = await prisma.proyecto.findMany({
    orderBy: { creadoEn: "desc" },
    include: { _count: { select: { eventos: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-200">Proyectos</h1>
          <Link
            href="/nuevo-proyecto"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            + Nuevo proyecto
          </Link>
        </div>

        {proyectos.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <p className="text-lg mb-2">Sin proyectos todavía</p>
            <Link href="/nuevo-proyecto" className="text-indigo-400 hover:underline text-sm">
              Crear tu primer proyecto →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {proyectos.map((p) => (
              <Link
                key={p.id}
                href={`/proyectos/${p.id}`}
                className="card p-5 hover:border-indigo-500/50 transition-colors"
                style={{ borderLeft: `4px solid ${p.color}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-200 text-lg">{p.nombre}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {p._count.eventos} evento{p._count.eventos !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
