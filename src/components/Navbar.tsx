"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Inicio",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: "rgba(9,9,15,0.85)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(64px + env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-8 py-2"
            style={{ color: active ? "var(--purple)" : "var(--text-3)" }}
          >
            {tab.icon(active)}
            <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.04em" }}>
              {tab.label}
            </span>
          </Link>
        );
      })}

      {/* Central add button */}
      <Link
        href="/nuevo-evento"
        className="flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          boxShadow: "0 4px 24px rgba(139,92,246,0.45)",
          marginBottom: 8,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>

      <Link
        href="/nuevo-proyecto"
        className="flex flex-col items-center gap-1 px-8 py-2"
        style={{ color: "var(--text-3)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.04em" }}>Proyecto</span>
      </Link>

      <Link
        href="/proyectos"
        className="flex flex-col items-center gap-1 px-8 py-2"
        style={{ color: "var(--text-3)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.04em" }}>Opciones</span>
      </Link>
    </nav>
  );
}
