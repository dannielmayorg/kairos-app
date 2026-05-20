"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const CATEGORIAS = [
  { value: "REUNION", label: "Reunión" },
  { value: "SESION", label: "Sesión" },
  { value: "TALLER", label: "Taller" },
  { value: "OTRO", label: "Otro" },
];

const DIAS_SEMANA = [
  { value: 1, label: "L", nombre: "Lunes" },
  { value: 2, label: "M", nombre: "Martes" },
  { value: 3, label: "X", nombre: "Miércoles" },
  { value: 4, label: "J", nombre: "Jueves" },
  { value: 5, label: "V", nombre: "Viernes" },
  { value: 6, label: "S", nombre: "Sábado" },
  { value: 0, label: "D", nombre: "Domingo" },
];

const OPCIONES_RECURRENCIA = [
  { value: "NINGUNA", label: "No se repite" },
  { value: "DIARIA", label: "Cada día" },
  { value: "SEMANAL", label: "Cada semana" },
  { value: "MENSUAL", label: "Cada mes" },
  { value: "PERSONALIZADA", label: "Personalizado" },
];

const INTERVALOS_NOTIF = [
  { value: 10, label: "Cada 10 min" },
  { value: 15, label: "Cada 15 min" },
  { value: 20, label: "Cada 20 min" },
  { value: 30, label: "Cada 30 min" },
  { value: 45, label: "Cada 45 min" },
  { value: 60, label: "Cada hora" },
];

function css(extra = "") {
  return `w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] ${extra}`;
}

type ReglaRecurrencia = {
  intervalo?: number;
  diasSemana?: number[];
  terminaCon?: "fecha" | "ocurrencias";
  fechaFin?: string;
  ocurrencias?: number;
};

type Evento = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  categoria: string;
  recurrencia: string;
  reglaRecurrencia: ReglaRecurrencia | null;
  intervaloNotificacion: number;
  eventoOriginalId: string | null;
  proyecto: { id: string; nombre: string };
};

export default function EditarEvento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [categoria, setCategoria] = useState("SESION");
  const [recurrencia, setRecurrencia] = useState("NINGUNA");
  const [intervalo, setIntervalo] = useState(1);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [terminaCon, setTerminaCon] = useState<"fecha" | "ocurrencias">("fecha");
  const [fechaFinSerie, setFechaFinSerie] = useState("");
  const [ocurrencias, setOcurrencias] = useState(10);
  const [intervaloNotif, setIntervaloNotif] = useState(15);
  const [alcance, setAlcance] = useState<"solo" | "futuros">("solo");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/eventos/${id}`)
      .then((r) => r.json())
      .then((ev: Evento) => {
        setEvento(ev);
        setNombre(ev.nombre);
        setDescripcion(ev.descripcion ?? "");
        const fi = new Date(ev.fechaInicio);
        const ff = new Date(ev.fechaFin);
        setFecha(fi.toISOString().slice(0, 10));
        setHoraInicio(fi.toTimeString().slice(0, 5));
        setHoraFin(ff.toTimeString().slice(0, 5));
        setCategoria(ev.categoria);
        setRecurrencia(ev.recurrencia);
        setIntervaloNotif(ev.intervaloNotificacion ?? 15);
        if (ev.reglaRecurrencia) {
          setIntervalo(ev.reglaRecurrencia.intervalo ?? 1);
          setDiasSemana(ev.reglaRecurrencia.diasSemana ?? []);
          setTerminaCon(ev.reglaRecurrencia.terminaCon ?? "fecha");
          setFechaFinSerie(ev.reglaRecurrencia.fechaFin ?? "");
          setOcurrencias(ev.reglaRecurrencia.ocurrencias ?? 10);
        }
      });
  }, [id]);

  const toggleDia = (dia: number) =>
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) return setError("El nombre es requerido.");
    if (horaFin <= horaInicio) return setError("La hora de fin debe ser posterior al inicio.");

    const fechaInicio = `${fecha}T${horaInicio}:00`;
    const fechaFin = `${fecha}T${horaFin}:00`;

    const reglaRecurrencia =
      recurrencia !== "NINGUNA"
        ? {
            intervalo,
            diasSemana:
              recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA"
                ? diasSemana
                : undefined,
            terminaCon,
            fechaFin: terminaCon === "fecha" ? (fechaFinSerie || undefined) : undefined,
            ocurrencias: terminaCon === "ocurrencias" ? ocurrencias : undefined,
          }
        : null;

    setCargando(true);

    // Editar este evento
    const res = await fetch(`/api/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        descripcion,
        fechaInicio,
        fechaFin,
        categoria,
        recurrencia,
        reglaRecurrencia,
        intervaloNotificacion: intervaloNotif,
      }),
    });

    if (!res.ok) {
      setError("Error al guardar.");
      setCargando(false);
      return;
    }

    // Si tiene serie y eligió editar futuros, actualizar los siguientes
    if (alcance === "futuros" && evento?.eventoOriginalId) {
      await fetch(`/api/eventos/${id}/editar-futuros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          horaInicio,
          horaFin,
          categoria,
          intervaloNotificacion: intervaloNotif,
        }),
      });
    }

    router.push(`/eventos/${id}`);
  };

  if (!evento) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Cargando...
        </div>
      </>
    );
  }

  const esSerie = !!evento.eventoOriginalId || evento.recurrencia !== "NINGUNA";
  const mostrarDias = recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA";

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-200 mb-6">Editar evento</h1>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Info básica */}
          <div className="card p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={css()}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Descripción <span className="text-slate-600">(opcional)</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className={css("resize-none")}
              />
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-medium text-slate-400">Fecha y hora</p>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={css()}
            />
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={css("flex-1")}
              />
              <span className="text-slate-500 text-sm">→</span>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className={css("flex-1")}
              />
            </div>
          </div>

          {/* Recurrencia */}
          <div className="card p-4 space-y-4">
            <p className="text-xs font-medium text-slate-400">Repetición</p>
            <div className="flex flex-wrap gap-2">
              {OPCIONES_RECURRENCIA.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setRecurrencia(op.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recurrencia === op.value
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] hover:text-slate-200"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {mostrarDias && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Repetir los días</p>
                <div className="flex gap-1.5">
                  {DIAS_SEMANA.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDia(d.value)}
                      title={d.nombre}
                      className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                        diasSemana.includes(d.value)
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] hover:border-indigo-500"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recurrencia !== "NINGUNA" && (
              <>
                {recurrencia === "PERSONALIZADA" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Cada</span>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={intervalo}
                      onChange={(e) => setIntervalo(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg text-sm text-slate-200 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-400">semana(s)</span>
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Termina</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="terminaCon"
                        checked={terminaCon === "fecha"}
                        onChange={() => setTerminaCon("fecha")}
                        className="accent-indigo-500"
                      />
                      <span className="text-sm text-slate-300">En fecha</span>
                    </label>
                    {terminaCon === "fecha" && (
                      <input
                        type="date"
                        value={fechaFinSerie}
                        onChange={(e) => setFechaFinSerie(e.target.value)}
                        className={css("ml-6")}
                      />
                    )}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="terminaCon"
                        checked={terminaCon === "ocurrencias"}
                        onChange={() => setTerminaCon("ocurrencias")}
                        className="accent-indigo-500"
                      />
                      <span className="text-sm text-slate-300">Después de</span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={ocurrencias}
                        onChange={(e) => setOcurrencias(Number(e.target.value))}
                        onClick={() => setTerminaCon("ocurrencias")}
                        className="w-16 px-2 py-1 rounded-lg text-sm text-center text-slate-200 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-300">sesiones</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Categoría */}
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Categoría</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategoria(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    categoria === c.value
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] hover:text-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo de notificaciones */}
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 mb-1">
              Recordatorio en celular
            </p>
            <p className="text-xs text-slate-600 mb-3">
              Frecuencia de notificaciones push durante la sesión
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERVALOS_NOTIF.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setIntervaloNotif(op.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    intervaloNotif === op.value
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] hover:text-slate-200"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alcance para series */}
          {esSerie && (
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-400 mb-3">
                ¿Qué quieres editar?
              </p>
              <div className="space-y-2">
                {[
                  { value: "solo", label: "Solo este evento" },
                  { value: "futuros", label: "Este y todos los siguientes" },
                ].map((op) => (
                  <label
                    key={op.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="alcance"
                      value={op.value}
                      checked={alcance === op.value}
                      onChange={() =>
                        setAlcance(op.value as "solo" | "futuros")
                      }
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">{op.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 px-1">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors border border-[var(--kairos-border)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
