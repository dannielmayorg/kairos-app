import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventoId, titulo, descripcion, prioridad, orden, horaAviso } = body;

  if (!eventoId || !titulo?.trim()) {
    return NextResponse.json({ error: "eventoId y titulo requeridos" }, { status: 400 });
  }

  const tarea = await prisma.tarea.create({
    data: {
      eventoId,
      titulo: titulo.trim(),
      descripcion,
      prioridad: prioridad ?? "MEDIA",
      orden: orden ?? 0,
      horaAviso: horaAviso ?? null,
    },
  });
  return NextResponse.json(tarea, { status: 201 });
}
