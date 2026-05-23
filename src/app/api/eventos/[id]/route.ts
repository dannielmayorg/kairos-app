import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      proyecto: { select: { id: true, nombre: true, color: true } },
      tareas: { orderBy: [{ orden: "asc" }, { creadoEn: "asc" }] },
    },
  });
  if (!evento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(evento);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const evento = await prisma.evento.update({
    where: { id },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      icono: body.icono,
      fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      fechaFin: body.fechaFin ? new Date(body.fechaFin) : undefined,
      categoria: body.categoria,
      recurrencia: body.recurrencia,
      reglaRecurrencia: body.reglaRecurrencia ?? undefined,
      intervaloNotificacion: body.intervaloNotificacion,
    },
  });
  return NextResponse.json(evento);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.evento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
