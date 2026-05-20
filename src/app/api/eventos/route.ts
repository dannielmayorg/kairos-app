import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoRecurrencia, CategoriaEvento, Prisma, Prioridad } from "@prisma/client";
import { addDays, addMonths } from "@/lib/dateUtils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proyectoId = searchParams.get("proyectoId");
  const estado = searchParams.get("estado");

  const where: Prisma.EventoWhereInput = {};
  if (proyectoId) where.proyectoId = proyectoId;
  if (estado) where.estado = estado as never;

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

  const eventoBase = await prisma.evento.create({
    data: {
      proyectoId,
      nombre: nombre.trim(),
      descripcion,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      categoria: categoria ?? "OTRO",
      recurrencia: recurrencia ?? "NINGUNA",
      reglaRecurrencia: reglaRecurrencia ?? Prisma.JsonNull,
      intervaloNotificacion: intervaloNotificacion ?? 15,
    },
  });

  const tareasValidas: { titulo: string; prioridad?: string }[] =
    tareasIniciales?.filter((t: { titulo: string }) => t.titulo?.trim()) ?? [];

  if (tareasValidas.length) {
    await prisma.tarea.createMany({
      data: tareasValidas.map((t, i) => ({
        eventoId: eventoBase.id,
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
    const instancias = generarInstancias(eventoBase, reglaRecurrencia);
    for (const instancia of instancias) {
      const eventoInstancia = await prisma.evento.create({ data: instancia });
      if (tareasValidas.length) {
        await prisma.tarea.createMany({
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

  const limite = () =>
    porOcurrencias
      ? instancias.length < maxOcurrencias
      : instancias.length < 365 && (instancias[instancias.length - 1]?.fechaInicio as Date | undefined) !== undefined
        ? true
        : true;

  const dentroDeRango = (fecha: Date) =>
    porOcurrencias ? instancias.length < maxOcurrencias : fecha <= fechaLimite;

  const crearInstancia = (fecha: Date): Prisma.EventoCreateInput => ({
    proyecto: { connect: { id: base.proyectoId } },
    nombre: base.nombre,
    descripcion: base.descripcion,
    fechaInicio: fecha,
    fechaFin: new Date(fecha.getTime() + duracion),
    categoria: base.categoria,
    recurrencia: base.recurrencia,
    reglaRecurrencia: base.reglaRecurrencia ?? Prisma.JsonNull,
    eventoOriginalId: base.id,
  });

  void limite; // suprime warning de variable no usada

  if (
    (base.recurrencia === TipoRecurrencia.SEMANAL ||
      base.recurrencia === TipoRecurrencia.PERSONALIZADA) &&
    regla.diasSemana?.length
  ) {
    let cursor = addDays(base.fechaInicio, 1);
    cursor.setHours(0, 0, 0, 0);

    while (dentroDeRango(cursor) && instancias.length < 365) {
      const diaSemana = cursor.getDay();
      if (regla.diasSemana.includes(diaSemana)) {
        const fecha = new Date(cursor);
        fecha.setHours(hora, minutos, 0, 0);
        instancias.push(crearInstancia(fecha));
        if (!dentroDeRango(cursor)) break;
        if (intervalo > 1) {
          cursor = addDays(cursor, (intervalo - 1) * 7);
        }
      }
      cursor = addDays(cursor, 1);
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
    while (dentroDeRango(cursor) && instancias.length < 365) {
      instancias.push(crearInstancia(new Date(cursor)));
      avanzar();
    }
  }

  return instancias;
}
