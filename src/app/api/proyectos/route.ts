import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const proyectos = await prisma.proyecto.findMany({
    orderBy: { creadoEn: "desc" },
    include: { _count: { select: { eventos: true } } },
  });
  return NextResponse.json(proyectos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nombre, color } = body;
  if (!nombre?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }
  const proyecto = await prisma.proyecto.create({
    data: { nombre: nombre.trim(), color: color ?? "#6366f1" },
  });
  return NextResponse.json(proyecto, { status: 201 });
}
