import { prisma } from "@/lib/prisma";

export async function sincronizarEstados() {
  const ahora = new Date();

  await prisma.evento.updateMany({
    where: {
      estado: "PENDIENTE",
      fechaInicio: { lte: ahora },
      fechaFin: { gte: ahora },
    },
    data: { estado: "ACTIVO" },
  });

  await prisma.evento.updateMany({
    where: {
      estado: "ACTIVO",
      fechaFin: { lt: ahora },
    },
    data: { estado: "COMPLETADO" },
  });
}
