"use client";

import { urlGoogleCalendar } from "@/lib/googleCalendar";

type Props = {
  evento: {
    nombre: string;
    descripcion?: string | null;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    recurrencia: string;
    reglaRecurrencia?: unknown;
  };
};

export default function GoogleCalendarButton({ evento }: Props) {
  const url = urlGoogleCalendar({
    ...evento,
    fechaInicio: new Date(evento.fechaInicio),
    fechaFin: new Date(evento.fechaFin),
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors border border-[var(--kairos-border)] hover:border-slate-500"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
      </svg>
      Agregar a Google Calendar
    </a>
  );
}
