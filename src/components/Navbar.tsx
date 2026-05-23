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
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 24px", textDecoration: "none", touchAction: "manipulation", minHeight: 44 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === "/" ? "#c5f135" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
        </svg>
        <span style={{ fontSize: "0.65rem", fontWeight: 600, color: pathname === "/" ? "#fff" : "rgba(255,255,255,0.3)", letterSpacing: "0.01em" }}>Inicio</span>
      </Link>

      {/* + Nuevo evento — acción principal */}
      <Link
        href="/nuevo-evento"
        aria-label="Nuevo evento"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 20px", textDecoration: "none", touchAction: "manipulation" }}
      >
        <div style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          background: "#c5f135",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </Link>

      {/* Proyectos */}
      <Link
        href="/proyectos"
        aria-label="Proyectos"
        aria-current={pathname === "/proyectos" ? "page" : undefined}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 24px", textDecoration: "none", touchAction: "manipulation", minHeight: 44 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === "/proyectos" ? "#c5f135" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
        <span style={{ fontSize: "0.65rem", fontWeight: 600, color: pathname === "/proyectos" ? "#fff" : "rgba(255,255,255,0.3)", letterSpacing: "0.01em" }}>Proyectos</span>
      </Link>
    </nav>
  );
}
