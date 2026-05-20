"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type Proyecto = { id: string; nombre: string; color: string };

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

const INTERVALOS_NOTIF = [
  { value: 10, label: "Cada 10 min" },
  { value: 15, label: "Cada 15 min" },
  { value: 20, label: "Cada 20 min" },
  { value: 30, label: "Cada 30 min" },
  { value: 45, label: "Cada 45 min" },
  { value: 60, label: "Cada hora" },
];

const OPCIONES_RECURRENCIA = [
  { value: "NINGUNA", label: "No se repite" },
  { value: "DIARIA", label: "Cada día" },
  { value: "SEMANAL", label: "Cada semana" },
  { value: "MENSUAL", label: "Cada mes" },
  { value: "PERSONALIZADA", label: "Personalizado" },
];

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function inputStyle(extra = "") {
  return `w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--kairos-dark)] border border-[var(--kairos-border)] ${extra}`;
}

function NuevoEventoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preseleccionado = searchParams.get("proyectoId") ?? "";

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState(preseleccionado);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [categoria, setCategoria] = useState("SESION");
  const [recurrencia, setRecurrencia] = useState("NINGUNA");
  const [intervalo, setIntervalo] = useState(1);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [terminaCon, setTerminaCon] = useState<"fecha" | "ocurrencias">("fecha");
  const [fechaFinSerie, setFechaFinSerie] = useState("");
  const [ocurrencias, setOcurrencias] = useState(10);
  const [tareas, setTareas] = useState<string[]>([""]);
  const [intervaloNotif, setIntervaloNotif] = useState(15);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/proyectos")
      .then((r) => r.json())
      .then(setProyectos);
  }, []);

  // Auto-seleccionar el día de la semana cuando cambia la fecha
  useEffect(() => {
    if (
      fecha &&
      (recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA")
    ) {
      const d = new Date(fecha + "T12:00:00");
      const dia = d.getDay();
      if (!diasSemana.includes(dia)) {
        setDiasSemana([dia]);
      }
    }
  }, [fecha, recurrencia]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDia = (dia: number) => {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const agregarTarea = () => setTareas((prev) => [...prev, ""]);
  const actualizarTarea = (i: number, val: string) =>
    setTareas((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  const eliminarTarea = (i: number) =>
    setTareas((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!proyectoId) return setError("Selecciona un proyecto.");
    if (!nombre.trim()) return setError("El nombre es requerido.");
    if (!fecha) return setError("La fecha es requerida.");
    if (horaFin <= horaInicio) return setError("La hora de fin debe ser posterior al inicio.");

    if (recurrencia !== "NINGUNA") {
      if (terminaCon === "fecha" && !fechaFinSerie)
        return setError("Define hasta cuándo se repite.");
      if (terminaCon === "ocurrencias" && (!ocurrencias || ocurrencias < 1))
        return setError("Define cuántas sesiones.");
      if (
        (recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA") &&
        diasSemana.length === 0
      )
        return setError("Selecciona al menos un día de la semana.");
    }

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
            fechaFin: terminaCon === "fecha" ? fechaFinSerie : undefined,
            ocurrencias: terminaCon === "ocurrencias" ? ocurrencias : undefined,
          }
        : undefined;

    setCargando(true);
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyectoId,
        nombre,
        descripcion,
        fechaInicio,
        fechaFin,
        categoria,
        recurrencia,
        reglaRecurrencia,
        intervaloNotificacion: intervaloNotif,
        tareas: tareas.filter((t) => t.trim()).map((t) => ({ titulo: t })),
      }),
    });

    if (res.ok) {
      const ev = await res.json();
      router.push(`/eventos/${ev.id}`);
    } else {
      setError("Error al crear el evento.");
      setCargando(false);
    }
  };

  const mostrarDias =
    recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA";
  const mostrarIntervalo = recurrencia === "PERSONALIZADA";

  const unidadIntervalo: Record<string, string> = {
    DIARIA: "día(s)",
    SEMANAL: "semana(s)",
    MENSUAL: "mes(es)",
    PERSONALIZADA: "semana(s)",
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-200 mb-6">Nuevo evento</h1>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Proyecto */}
          <div className="card p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Proyecto</label>
              <select
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                className={inputStyle()}
              >
                <option value="">Seleccionar proyecto...</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Sesión Action Lab"
                className={inputStyle()}
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
                className={inputStyle("resize-none")}
              />
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-medium text-slate-400">Fecha y hora</p>
            <div>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputStyle()}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={inputStyle("flex-1")}
              />
              <span className="text-slate-500 text-sm">→</span>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className={inputStyle("flex-1")}
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
                  onClick={() => {
                    setRecurrencia(op.value);
                    if (
                      op.value === "SEMANAL" ||
                      op.value === "PERSONALIZADA"
                    ) {
                      const d = new Date(fecha + "T12:00:00");
                      setDiasSemana([d.getDay()]);
                    }
                  }}
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

            {mostrarIntervalo && (
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
                <span className="text-sm text-slate-400">
                  {unidadIntervalo[recurrencia] ?? "semana(s)"}
                </span>
              </div>
            )}

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
                      min={fecha}
                      className={inputStyle("ml-6")}
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

          {/* Recordatorio en celular */}
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

          {/* Tareas iniciales */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400">
                Tareas <span className="text-slate-600">(opcional)</span>
              </p>
              <button
                type="button"
                onClick={agregarTarea}
                className="text-xs text-indigo-400 hover:underline"
              >
                + Agregar
              </button>
            </div>
            <div className="space-y-2">
              {tareas.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => actualizarTarea(i, e.target.value)}
                    placeholder={`Tarea ${i + 1}`}
                    className={inputStyle("flex-1")}
                  />
                  {tareas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarTarea(i)}
                      className="px-2 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 px-1">{error}</p>
          )}

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
              {cargando ? "Creando..." : recurrencia !== "NINGUNA" ? "Crear serie" : "Crear evento"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default function NuevoEvento() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center text-slate-500">Cargando...</div>}>
      <NuevoEventoForm />
    </Suspense>
  );
}
