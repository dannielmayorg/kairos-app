"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EmojiPicker from "@/components/EmojiPicker";

const CATEGORIAS = [
  { value: "REUNION", label: "Reunión" },
  { value: "SESION",  label: "Sesión"  },
  { value: "TALLER",  label: "Taller"  },
  { value: "OTRO",    label: "Otro"    },
];

const DIAS_SEMANA = [
  { value: 1, label: "L", nombre: "Lunes"     },
  { value: 2, label: "M", nombre: "Martes"    },
  { value: 3, label: "X", nombre: "Miércoles" },
  { value: 4, label: "J", nombre: "Jueves"    },
  { value: 5, label: "V", nombre: "Viernes"   },
  { value: 6, label: "S", nombre: "Sábado"    },
  { value: 0, label: "D", nombre: "Domingo"   },
];

const OPCIONES_RECURRENCIA = [
  { value: "NINGUNA",      label: "No se repite" },
  { value: "DIARIA",       label: "Cada día"     },
  { value: "SEMANAL",      label: "Cada semana"  },
  { value: "MENSUAL",      label: "Cada mes"     },
  { value: "PERSONALIZADA",label: "Personalizado"},
];

const INTERVALOS_NOTIF = [
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
];

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const SECTION: React.CSSProperties = {
  background: "#141414",
  borderRadius: 20,
  padding: "20px",
};

function pill(active: boolean): React.CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: "0.78rem",
    fontWeight: 700,
    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "#c5f135" : "rgba(255,255,255,0.05)",
    color: active ? "#000" : "rgba(255,255,255,0.5)",
    cursor: "pointer",
  };
}

function dayBtn(active: boolean): React.CSSProperties {
  return {
    width: 38, height: 38, borderRadius: "50%",
    border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
    background: active ? "#c5f135" : "rgba(255,255,255,0.05)",
    color: active ? "#000" : "rgba(255,255,255,0.5)",
    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
  };
}

type ReglaRecurrencia = {
  intervalo?: number;
  diasSemana?: number[];
  terminaCon?: "fecha" | "ocurrencias";
  fechaFin?: string;
  ocurrencias?: number;
};

type Evento = {
  id: string; nombre: string; descripcion: string | null;
  fechaInicio: string; fechaFin: string; categoria: string;
  recurrencia: string; reglaRecurrencia: ReglaRecurrencia | null;
  intervaloNotificacion: number; eventoOriginalId: string | null;
  proyecto: { id: string; nombre: string };
};

export default function EditarEvento({ params }: { params: Promise<{ id: string }> }) {
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
  const [icono, setIcono] = useState("📅");
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
        setIcono((ev as { icono?: string }).icono ?? "📅");
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
    setDiasSemana((prev) => prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) return setError("El nombre es requerido.");
    if (horaFin <= horaInicio) return setError("La hora de fin debe ser posterior al inicio.");

    const fechaInicio = `${fecha}T${horaInicio}:00`;
    const fechaFin = `${fecha}T${horaFin}:00`;
    const reglaRecurrencia = recurrencia !== "NINGUNA" ? {
      intervalo,
      diasSemana: (recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA") ? diasSemana : undefined,
      terminaCon,
      fechaFin: terminaCon === "fecha" ? (fechaFinSerie || undefined) : undefined,
      ocurrencias: terminaCon === "ocurrencias" ? ocurrencias : undefined,
    } : null;

    setCargando(true);
    const res = await fetch(`/api/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, icono, fechaInicio, fechaFin, categoria, recurrencia, reglaRecurrencia, intervaloNotificacion: intervaloNotif }),
    });

    if (!res.ok) { setError("Error al guardar."); setCargando(false); return; }

    if (alcance === "futuros" && evento?.eventoOriginalId) {
      await fetch(`/api/eventos/${id}/editar-futuros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, horaInicio, horaFin, categoria, intervaloNotificacion: intervaloNotif }),
      });
    }

    router.push(`/eventos/${id}`);
  };

  if (!evento) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <p style={{ color: "rgba(255,255,255,0.3)" }}>Cargando...</p>
    </div>
  );

  const esSerie = !!evento.eventoOriginalId || evento.recurrencia !== "NINGUNA";
  const mostrarDias = recurrencia === "SEMANAL" || recurrencia === "PERSONALIZADA";

  return (
    <>
      <main style={{ background: "#000", minHeight: "100dvh" }}>

        {/* Header */}
        <header className="safe-header" style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Link href={`/eventos/${id}`} aria-label="Volver al evento" style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 10, margin: -10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Editar evento</span>
        </header>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Info básica */}
            <div style={SECTION}>
              <div style={{ marginBottom: 16 }}>
                <EmojiPicker value={icono} onChange={setIcono} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={INPUT} autoFocus />
              </div>
              <div>
                <label style={LABEL}>Descripción <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} style={{ ...INPUT, resize: "none" }} />
              </div>
            </div>

            {/* Fecha y hora */}
            <div style={SECTION}>
              <label style={LABEL}>Fecha y hora</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ ...INPUT, marginBottom: 10 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} style={{ ...INPUT, flex: 1 }} />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "1rem" }}>→</span>
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} style={{ ...INPUT, flex: 1 }} />
              </div>
            </div>

            {/* Repetición */}
            <div style={SECTION}>
              <label style={LABEL}>Repetición</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {OPCIONES_RECURRENCIA.map((op) => (
                  <button key={op.value} type="button" onClick={() => setRecurrencia(op.value)} style={pill(recurrencia === op.value)}>
                    {op.label}
                  </button>
                ))}
              </div>

              {mostrarDias && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Repetir los días</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {DIAS_SEMANA.map((d) => (
                      <button key={d.value} type="button" onClick={() => toggleDia(d.value)} title={d.nombre} style={dayBtn(diasSemana.includes(d.value))}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recurrencia === "PERSONALIZADA" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Cada</span>
                  <input type="number" min={1} max={52} value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))} style={{ ...INPUT, width: 64 }} />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>semana(s)</span>
                </div>
              )}

              {recurrencia !== "NINGUNA" && (
                <div>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Termina</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="radio" name="terminaCon" checked={terminaCon === "fecha"} onChange={() => setTerminaCon("fecha")} style={{ accentColor: "#c5f135" }} />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>En fecha</span>
                    </label>
                    {terminaCon === "fecha" && (
                      <input type="date" value={fechaFinSerie} onChange={(e) => setFechaFinSerie(e.target.value)} style={{ ...INPUT, marginLeft: 20 }} />
                    )}
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexWrap: "wrap" }}>
                      <input type="radio" name="terminaCon" checked={terminaCon === "ocurrencias"} onChange={() => setTerminaCon("ocurrencias")} style={{ accentColor: "#c5f135" }} />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>Después de</span>
                      <input type="number" min={1} max={200} value={ocurrencias} onChange={(e) => setOcurrencias(Number(e.target.value))} onClick={() => setTerminaCon("ocurrencias")} style={{ ...INPUT, width: 60, textAlign: "center" }} />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>sesiones</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Categoría */}
            <div style={SECTION}>
              <label style={LABEL}>Categoría</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIAS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setCategoria(c.value)} style={pill(categoria === c.value)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recordatorio */}
            <div style={SECTION}>
              <label style={LABEL}>Recordatorio</label>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                Frecuencia de notificaciones push durante la sesión
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {INTERVALOS_NOTIF.map((op) => (
                  <button key={op.value} type="button" onClick={() => setIntervaloNotif(op.value)} style={pill(intervaloNotif === op.value)}>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alcance para series */}
            {esSerie && (
              <div style={SECTION}>
                <label style={LABEL}>¿Qué quieres editar?</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { value: "solo",    label: "Solo este evento"               },
                    { value: "futuros", label: "Este y todos los siguientes"    },
                  ].map((op) => (
                    <label key={op.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input
                        type="radio" name="alcance" value={op.value}
                        checked={alcance === op.value}
                        onChange={() => setAlcance(op.value as "solo" | "futuros")}
                        style={{ accentColor: "#c5f135" }}
                      />
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{op.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ color: "#ef4444", fontSize: "0.83rem", padding: "0 4px" }}>{error}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1, padding: "13px", borderRadius: 14,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                style={{
                  flex: 1, padding: "13px", borderRadius: 14,
                  background: "#c5f135", color: "#000", border: "none",
                  fontSize: "0.9rem", fontWeight: 800, cursor: "pointer",
                  opacity: cargando ? 0.6 : 1,
                }}
              >
                {cargando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Navbar />
    </>
  );
}
