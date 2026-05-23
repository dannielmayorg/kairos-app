"use client";

import { useState } from "react";

const EMOJIS = [
  // Tiempo / calendario
  "📅","🗓️","⏰","⏱️","🕐","📌",
  // Trabajo
  "🎯","📝","📊","📈","💡","📋",
  "✅","💼","🔑","📎","🗂️","📁",
  // Personas / reuniones
  "🤝","👥","💬","🗣️","📢","🎤",
  // Eventos / celebración
  "🎉","🎊","🏆","🥂","🎂","🌟",
  // Creativo
  "🎨","🎭","🎬","🎵","📸","🎮",
  // Aprendizaje / tech
  "📚","🎓","🔬","💻","📱","⚙️",
  // Salud / deporte
  "🏃","💪","🧘","🏋️","⚽","🧠",
  // Naturaleza / energía
  "🔥","⚡","💫","🚀","🌈","✨",
  // Misc
  "❤️","🦁","🐉","🌙","☕","🍕",
];

export default function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label style={{
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "rgba(255,255,255,0.4)",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Ícono
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#1a1a1a",
          border: open ? "1px solid rgba(197,241,53,0.4)" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "10px 16px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{value}</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", flex: 1, textAlign: "left" }}>
          {open ? "Elige un ícono" : "Cambiar ícono"}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Grid */}
      {open && (
        <div style={{
          marginTop: 8,
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 4,
        }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => { onChange(e); setOpen(false); }}
              style={{
                fontSize: "1.4rem",
                padding: "8px 4px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: value === e ? "rgba(197,241,53,0.15)" : "transparent",
                outline: value === e ? "1px solid rgba(197,241,53,0.4)" : "none",
                transition: "background 0.1s",
                lineHeight: 1,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
