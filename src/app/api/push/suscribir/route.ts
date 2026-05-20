import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  await prisma.suscripcionPush.upsert({
    where: { endpoint: sub.endpoint },
    update: { keys: sub.keys },
    create: { endpoint: sub.endpoint, keys: sub.keys },
  });

  return NextResponse.json({ ok: true });
}
