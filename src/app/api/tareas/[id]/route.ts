import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const tarea = await prisma.tarea.update({
    where: { id },
    data: {
      titulo: body.titulo,
      descripcion: body.descripcion,
      prioridad: body.prioridad,
      orden: body.orden,
      horaAviso: body.horaAviso !== undefined ? (body.horaAviso ?? null) : undefined,
      avisoEnviado: body.horaAviso ? false : undefined,
    },
  });
  return NextResponse.json(tarea);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.tarea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
