"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
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
      <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 20px", textDecoration: "none" }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: pathname === "/" ? "#a8ff3e" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === "/" ? "#000" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
          </svg>
        </div>
      </Link>

      {/* + Nuevo evento — acción principal */}
      <Link href="/nuevo-evento" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          background: "#a8ff3e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 6px rgba(139,92,246,0.15)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </Link>

      {/* Proyectos */}
      <Link href="/proyectos" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 20px", textDecoration: "none" }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: pathname === "/proyectos" ? "#a8ff3e" : "transparent",
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
      </Link>
    </nav>
  );
}
