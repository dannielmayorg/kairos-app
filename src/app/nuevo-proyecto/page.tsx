"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const COLORES = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#c5f135", "#fff",
];

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  minHeight: 44,
  borderRadius: 12,
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
};

export default function NuevoProyecto() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es requerido."); return; }
    setCargando(true);
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, color }),
    });
    if (res.ok) {
      const p = await res.json();
      router.push(`/proyectos/${p.id}`);
    } else {
      setError("Error al crear el proyecto.");
      setCargando(false);
    }
  };

  return (
    <>
      <main style={{ background: "#000", minHeight: "100dvh" }}>

        {/* Header */}
        <header className="safe-header" style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          paddingBottom: 14,
          paddingLeft: 20,
          paddingRight: 20,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <Link href="/proyectos" aria-label="Volver a proyectos" style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 10, margin: -10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Nuevo proyecto</span>
        </header>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Nombre */}
            <div style={{ background: "#141414", borderRadius: 20, padding: "20px" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Tesis doctoral"
                style={INPUT}
                autoFocus
              />
            </div>

            {/* Color */}
            <div style={{ background: "#141414", borderRadius: 20, padding: "20px" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Color
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {COLORES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: c,
                      border: color === c ? `3px solid #fff` : "3px solid transparent",
                      outline: color === c ? `2px solid ${c}` : "none",
                      outlineOffset: 1,
                      cursor: "pointer",
                      transition: "transform 0.15s, opacity 0.12s",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Preview */}
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 14, background: "#0d0d0d", borderLeft: `3px solid ${color}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem" }}>{nombre || "Nombre del proyecto"}</span>
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "0.83rem", padding: "0 4px" }}>{error}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 14,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 14,
                  background: "#c5f135",
                  color: "#000",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  opacity: cargando ? 0.6 : 1,
                }}
              >
                {cargando ? "Creando..." : "Crear proyecto"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Navbar />
    </>
  );
}
