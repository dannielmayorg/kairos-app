import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const actualizada = await prisma.tarea.update({
    where: { id },
    data: {
      completada: !tarea.completada,
      completadaEn: !tarea.completada ? new Date() : null,
    },
  });
  return NextResponse.json(actualizada);
}
