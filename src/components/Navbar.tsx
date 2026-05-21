"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: "calc(64px + env(safe-area-inset-bottom))",
        gap: 0,
      }}
    >
      {/* Inicio */}
      <Link
        href="/"
        aria-label="Inicio"
        aria-current={pathname === "/" ? "page" : undefined}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 20px", textDecoration: "none", transition: "opacity 0.15s", touchAction: "manipulation" }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: pathname === "/" ? "#c5f135" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === "/" ? "#000" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
          </svg>
        </div>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, color: pathname === "/" ? "#c5f135" : "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>Inicio</span>
      </Link>

      {/* + Nuevo evento — acción principal */}
      <Link
        href="/nuevo-evento"
        aria-label="Nuevo evento"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 20px", textDecoration: "none", transition: "opacity 0.15s, transform 0.12s", touchAction: "manipulation" }}
      >
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          background: "#c5f135",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 6px rgba(197,241,53,0.12)",
          transition: "transform 0.12s ease, box-shadow 0.12s ease",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>Nuevo</span>
      </Link>

      {/* Proyectos */}
      <Link
        href="/proyectos"
        aria-label="Proyectos"
        aria-current={pathname === "/proyectos" ? "page" : undefined}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 20px", textDecoration: "none", transition: "opacity 0.15s", touchAction: "manipulation" }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: pathname === "/proyectos" ? "#c5f135" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === "/proyectos" ? "#000" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
          </svg>
        </div>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, color: pathname === "/proyectos" ? "#c5f135" : "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>Proyectos</span>
      </Link>
    </nav>
  );
}
