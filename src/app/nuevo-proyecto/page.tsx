"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const COLORES = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

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
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-200 mb-6">Nuevo proyecto</h1>
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tesis doctoral"
              className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ backgroundColor: "var(--kairos-dark)", border: "1px solid var(--kairos-border)" }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
              style={{ border: "1px solid var(--kairos-border)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {cargando ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
