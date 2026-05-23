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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "rgba(255,255,255,0.45)",
        border: "1px solid rgba(255,255,255,0.08)",
        textDecoration: "none",
        background: "transparent",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
      </svg>
      Google Calendar
    </a>
  );
}
