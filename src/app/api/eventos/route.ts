import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoRecurrencia, CategoriaEvento, EstadoEvento, Prisma, Prioridad } from "@prisma/client";
import { addDays, addMonths } from "@/lib/dateUtils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proyectoId = searchParams.get("proyectoId");
  const estado = searchParams.get("estado");

  const ESTADOS_VALIDOS = Object.values(EstadoEvento);
  if (estado && !ESTADOS_VALIDOS.includes(estado as EstadoEvento)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const where: Prisma.EventoWhereInput = {};
  if (proyectoId) where.proyectoId = proyectoId;
  if (estado) where.estado = estado as EstadoEvento;

  const eventos = await prisma.evento.findMany({
    where,
    orderBy: { fechaInicio: "asc" },
    include: {
      proyecto: { select: { nombre: true, color: true } },
      _count: { select: { tareas: true } },
    },
  });
  return NextResponse.json(eventos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    proyectoId,
    nombre,
    descripcion,
    icono,
    fechaInicio,
    fechaFin,
    categoria,
    recurrencia,
    reglaRecurrencia,
    intervaloNotificacion,
    tareas: tareasIniciales,
  } = body;

  if (!proyectoId || !nombre?.trim() || !fechaInicio || !fechaFin) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const tareasValidas: { titulo: string; prioridad?: string }[] =
    tareasIniciales?.filter((t: { titulo: string }) => t.titulo?.trim()) ?? [];

  const eventoBase = await prisma.$transaction(async (tx) => {
    const base = await tx.evento.create({
      data: {
        proyectoId,
        nombre: nombre.trim(),
        descripcion,
        icono: icono ?? "📅",
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        categoria: categoria ?? "OTRO",
        recurrencia: recurrencia ?? "NINGUNA",
        reglaRecurrencia: reglaRecurrencia ?? Prisma.JsonNull,
        intervaloNotificacion: intervaloNotificacion ?? 15,
      },
    });

    if (tareasValidas.length) {
      await tx.tarea.createMany({
        data: tareasValidas.map((t, i) => ({
          eventoId: base.id,
          titulo: t.titulo,
          prioridad: (t.prioridad as Prioridad) ?? Prioridad.MEDIA,
          orden: i,
        })),
      });
    }

    if (
      recurrencia &&
      recurrencia !== TipoRecurrencia.NINGUNA &&
      (reglaRecurrencia?.fechaFin || reglaRecurrencia?.ocurrencias)
    ) {
      const instancias = generarInstancias(base, reglaRecurrencia);
      for (const instancia of instancias) {
        const eventoInstancia = await tx.evento.create({ data: instancia });
        if (tareasValidas.length) {
          await tx.tarea.createMany({
            data: tareasValidas.map((t, i) => ({
              eventoId: eventoInstancia.id,
              titulo: t.titulo,
              prioridad: (t.prioridad as Prioridad) ?? Prioridad.MEDIA,
              orden: i,
            })),
          });
        }
      }
    }

    return base;
  });

  return NextResponse.json(eventoBase, { status: 201 });
}

type ReglaRecurrencia = {
  intervalo?: number;
  diasSemana?: number[];
  terminaCon?: "fecha" | "ocurrencias";
  fechaFin?: string;
  ocurrencias?: number;
};

type EventoBase = {
  id: string;
  proyectoId: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  fechaInicio: Date;
  fechaFin: Date;
  categoria: CategoriaEvento;
  recurrencia: TipoRecurrencia;
  reglaRecurrencia: Prisma.JsonValue;
};

function generarInstancias(
  base: EventoBase,
  regla: ReglaRecurrencia
): Prisma.EventoCreateInput[] {
  const instancias: Prisma.EventoCreateInput[] = [];
  const duracion = base.fechaFin.getTime() - base.fechaInicio.getTime();
  const intervalo = regla.intervalo ?? 1;
  const hora = base.fechaInicio.getHours();
  const minutos = base.fechaInicio.getMinutes();
  const maxOcurrencias = regla.ocurrencias ?? 365;
  const fechaLimite = regla.fechaFin ? new Date(regla.fechaFin) : new Date("2099-12-31");
  const porOcurrencias = regla.terminaCon === "ocurrencias" && !!regla.ocurrencias;

  const limite = porOcurrencias ? maxOcurrencias : 365;

  const dentroDeRango = (fecha: Date) =>
    porOcurrencias ? instancias.length < maxOcurrencias : fecha <= fechaLimite;

  const crearInstancia = (fecha: Date): Prisma.EventoCreateInput => ({
    proyecto: { connect: { id: base.proyectoId } },
    nombre: base.nombre,
    descripcion: base.descripcion,
    icono: base.icono,
    fechaInicio: fecha,
    fechaFin: new Date(fecha.getTime() + duracion),
    categoria: base.categoria,
    recurrencia: base.recurrencia,
    reglaRecurrencia: base.reglaRecurrencia ?? Prisma.JsonNull,
    eventoOriginalId: base.id,
  });

  if (
    (base.recurrencia === TipoRecurrencia.SEMANAL ||
      base.recurrencia === TipoRecurrencia.PERSONALIZADA) &&
    regla.diasSemana?.length
  ) {
    // Normalizar al lunes de la semana que contiene fechaInicio
    const dow = base.fechaInicio.getDay();
    const offsetLunes = dow === 0 ? -6 : 1 - dow;
    const lunesRef = addDays(base.fechaInicio, offsetLunes);
    lunesRef.setHours(0, 0, 0, 0);

    // Iterar semana por semana (respetando el intervalo completo por semana)
    let semana = 1;
    while (instancias.length < limite) {
      const lunesSemana = addDays(lunesRef, semana * intervalo * 7);

      for (let d = 0; d < 7 && instancias.length < limite; d++) {
        const dia = addDays(lunesSemana, d);
        if (!regla.diasSemana.includes(dia.getDay())) continue;
        const fecha = new Date(dia);
        fecha.setHours(hora, minutos, 0, 0);
        if (fecha <= base.fechaInicio) continue; // excluir el evento base
        if (!dentroDeRango(fecha)) continue;
        instancias.push(crearInstancia(fecha));
      }

      // Si el inicio de la próxima semana ya está fuera de rango, parar
      const lunesSiguiente = addDays(lunesSemana, intervalo * 7);
      lunesSiguiente.setHours(hora, minutos, 0, 0);
      if (!porOcurrencias && lunesSiguiente > fechaLimite) break;

      semana++;
      if (semana > 400) break; // safety cap
    }
  } else {
    let cursor = new Date(base.fechaInicio);

    const avanzar = () => {
      switch (base.recurrencia) {
        case TipoRecurrencia.DIARIA:
          cursor = addDays(cursor, intervalo);
          break;
        case TipoRecurrencia.MENSUAL:
          cursor = addMonths(cursor, intervalo);
          break;
        default:
          cursor = addDays(cursor, intervalo * 7);
      }
    };

    avanzar();
    while (dentroDeRango(cursor) && instancias.length < limite) {
      instancias.push(crearInstancia(new Date(cursor)));
      avanzar();
    }
  }

  return instancias;
}
