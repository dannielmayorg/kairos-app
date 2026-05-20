import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { nombre, descripcion, horaInicio, horaFin, categoria, intervaloNotificacion } = body;

  // Encontrar el evento actual para saber su fecha y padre de serie
  const eventoActual = await prisma.evento.findUnique({ where: { id } });
  if (!eventoActual) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const origenId = eventoActual.eventoOriginalId ?? id;

  // Buscar todos los eventos futuros de la misma serie
  const eventosFuturos = await prisma.evento.findMany({
    where: {
      OR: [
        { eventoOriginalId: origenId },
        { id: origenId },
      ],
      fechaInicio: { gte: eventoActual.fechaInicio },
      NOT: { id },
    },
  });

  // Actualizar cada evento manteniendo su fecha pero cambiando la hora
  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);

  await Promise.all(
    eventosFuturos.map((ev) => {
      const nuevaInicio = new Date(ev.fechaInicio);
      nuevaInicio.setHours(hIni, mIni, 0, 0);
      const nuevaFin = new Date(ev.fechaFin);
      nuevaFin.setHours(hFin, mFin, 0, 0);

      return prisma.evento.update({
        where: { id: ev.id },
        data: {
          nombre,
          descripcion,
          fechaInicio: nuevaInicio,
          fechaFin: nuevaFin,
          categoria,
          intervaloNotificacion,
        },
      });
    })
  );

  return NextResponse.json({ actualizados: eventosFuturos.length });
}
