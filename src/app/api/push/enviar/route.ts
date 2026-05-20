import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacion } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  const { title, body } = await req.json();
  const suscripciones = await prisma.suscripcionPush.findMany();

  const resultados = await Promise.allSettled(
    suscripciones.map((s) =>
      enviarNotificacion(
        s.endpoint,
        s.keys as { p256dh: string; auth: string },
        { title: title ?? "K.A.I.R.O.S.", body: body ?? "Notificación de prueba" }
      )
    )
  );

  const fallidas = resultados.filter((r) => r.status === "rejected");
  return NextResponse.json({ enviadas: resultados.length, fallidas: fallidas.length });
}
