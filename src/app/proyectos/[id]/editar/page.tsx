"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const COLORES = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#c5f135", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#ffffff",
];

export default function EditarProyecto() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  useEffect(() => {
    fetch(`/api/proyectos/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setNombre(p.nombre ?? "");
        setColor(p.color ?? "#6366f1");
        setCargando(false);
      });
  }, [id]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    await fetch(`/api/proyectos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), color }),
    });
    router.push(`/proyectos/${id}`);
  };

  const eliminar = async () => {
    setEliminando(true);
    await fetch(`/api/proyectos/${id}`, { method: "DELETE" });
    router.push("/proyectos");
  };

  if (cargando) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header className="safe-header" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href={`/proyectos/${id}`} aria-label="Volver al proyecto" style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 10, margin: -10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Editar proyecto</span>
      </header>

      <div style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Preview card */}
        <div style={{
          background: "#141414", borderRadius: 20, padding: "20px",
          borderLeft: `3px solid ${color}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
            {nombre || "Nombre del proyecto"}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nombre */}
          <div style={{ background: "#141414", borderRadius: 20, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mi proyecto"
              autoFocus
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: "1.1rem", fontWeight: 600,
              }}
            />
          </div>

          {/* Color */}
          <div style={{ background: "#141414", borderRadius: 20, padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Color
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: c, border: "none", cursor: "pointer",
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: 3,
                    boxShadow: color === c ? `0 0 0 5px rgba(255,255,255,0.08)` : "none",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!nombre.trim() || guardando}
            style={{
              padding: "15px",
              borderRadius: 16,
              background: nombre.trim() ? "#c5f135" : "rgba(255,255,255,0.06)",
              color: nombre.trim() ? "#000" : "rgba(255,255,255,0.2)",
              border: "none",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: nombre.trim() ? "pointer" : "default",
            }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {/* Zona de peligro */}
        <div style={{ marginTop: 8, background: "#141414", borderRadius: 20, padding: "20px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", fontWeight: 600, marginBottom: 12 }}>
            Zona de peligro
          </p>
          {!confirmarEliminar ? (
            <button
              onClick={() => setConfirmarEliminar(true)}
              style={{
                width: "100%", padding: "12px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
                fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              Eliminar proyecto
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", textAlign: "center", marginBottom: 4 }}>
                ¿Seguro? Se eliminarán todos los eventos y tareas.
              </p>
              <button
                onClick={eliminar}
                disabled={eliminando}
                style={{
                  padding: "12px", borderRadius: 12,
                  background: "#ef4444", color: "#fff",
                  border: "none", fontWeight: 800, fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar todo"}
              </button>
              <button
                onClick={() => setConfirmarEliminar(false)}
                style={{
                  padding: "12px", borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
                  border: "none", fontWeight: 600, fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
