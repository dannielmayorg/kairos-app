type EventoParaCalendar = {
  nombre: string;
  descripcion?: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  recurrencia: string;
  reglaRecurrencia?: unknown;
};

const BYDAY: Record<number, string> = {
  0: "SU", 1: "MO", 2: "TU", 3: "WE", 4: "TH", 5: "FR", 6: "SA",
};

function gCalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
}

export function urlGoogleCalendar(evento: EventoParaCalendar): string {
  const regla = evento.reglaRecurrencia as {
    intervalo?: number;
    diasSemana?: number[];
    fechaFin?: string;
  } | null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.nombre,
    dates: `${gCalDate(evento.fechaInicio)}/${gCalDate(evento.fechaFin)}`,
  });

  if (evento.descripcion) params.set("details", evento.descripcion);

  if (evento.recurrencia !== "NINGUNA") {
    const intervalo = regla?.intervalo ?? 1;
    let rrule = "";

    switch (evento.recurrencia) {
      case "DIARIA":
        rrule = `RRULE:FREQ=DAILY;INTERVAL=${intervalo}`;
        break;
      case "SEMANAL":
      case "PERSONALIZADA": {
        const dias =
          regla?.diasSemana?.map((d) => BYDAY[d]).join(",") ??
          BYDAY[evento.fechaInicio.getDay()];
        rrule = `RRULE:FREQ=WEEKLY;INTERVAL=${intervalo};BYDAY=${dias}`;
        break;
      }
      case "MENSUAL":
        rrule = `RRULE:FREQ=MONTHLY;INTERVAL=${intervalo}`;
        break;
    }

    if (rrule && regla?.fechaFin) {
      rrule += `;UNTIL=${regla.fechaFin.replace(/-/g, "")}T235959Z`;
    }
    if (rrule) params.set("recur", rrule);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
