import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if (!proyecto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(proyecto);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const proyecto = await prisma.proyecto.update({
    where: { id },
    data: { nombre: body.nombre, color: body.color },
  });
  return NextResponse.json(proyecto);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.proyecto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
