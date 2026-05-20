import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { enviarNotificacion } from "@/lib/webpush";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature") ?? "";

  const isValid = await receiver
    .verify({
      signature,
      body,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/notificaciones`,
    })
    .catch(() => false);

  if (!isValid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  await sincronizarEstados();

  const ahora = new Date();
  const eventosActivos = await prisma.evento.findMany({
    where: { estado: "ACTIVO" },
    include: { tareas: { where: { completada: false } } },
  });

  if (!eventosActivos.length) {
    return NextResponse.json({ mensaje: "No hay eventos activos" });
  }

  const suscripciones = await prisma.suscripcionPush.findMany();
  if (!suscripciones.length) {
    return NextResponse.json({ mensaje: "No hay suscripciones" });
  }

  const notificaciones: Promise<unknown>[] = [];

  for (const evento of eventosActivos) {
    if (!evento.tareas.length) continue;

    // Respetar el intervalo de notificación configurado por evento
    if (evento.ultimaNotificacion) {
      const minutosDesdeUltima =
        (ahora.getTime() - evento.ultimaNotificacion.getTime()) / 60000;
      if (minutosDesdeUltima < evento.intervaloNotificacion) continue;
    }
    const titulos = evento.tareas
      .slice(0, 3)
      .map((t) => t.titulo)
      .join(", ");
    const resto =
      evento.tareas.length > 3 ? ` y ${evento.tareas.length - 3} más` : "";
    const cuerpo = `${evento.tareas.length} tarea${evento.tareas.length > 1 ? "s" : ""} pendiente${evento.tareas.length > 1 ? "s" : ""}: ${titulos}${resto}`;

    // Registrar cuándo se notificó este evento
    notificaciones.push(
      prisma.evento.update({
        where: { id: evento.id },
        data: { ultimaNotificacion: ahora },
      }).catch(() => null)
    );

    for (const sub of suscripciones) {
      notificaciones.push(
        enviarNotificacion(
          sub.endpoint,
          sub.keys as { p256dh: string; auth: string },
          {
            title: `⏰ ${evento.nombre}`,
            body: cuerpo,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/eventos/${evento.id}/sesion`,
          }
        ).catch(() => null)
      );
    }
  }

  await Promise.all(notificaciones);

  return NextResponse.json({
    procesados: eventosActivos.length,
    notificaciones: notificaciones.length,
  });
}

export async function sincronizarEstados() {
  const ahora = new Date();

  // Activar eventos que deberían estar corriendo
  await prisma.evento.updateMany({
    where: {
      estado: "PENDIENTE",
      fechaInicio: { lte: ahora },
      fechaFin: { gte: ahora },
    },
    data: { estado: "ACTIVO" },
  });

  // Completar eventos que ya terminaron
  await prisma.evento.updateMany({
    where: {
      estado: "ACTIVO",
      fechaFin: { lt: ahora },
    },
    data: { estado: "COMPLETADO" },
  });
}
