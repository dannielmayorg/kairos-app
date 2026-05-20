"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/proyectos", label: "Proyectos" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header
      style={{ backgroundColor: "var(--kairos-card)", borderBottom: "1px solid var(--kairos-border)" }}
      className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-widest text-indigo-400">K.A.I.R.O.S.</span>
      </Link>
      <nav className="flex items-center gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === l.href
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/nuevo-proyecto"
          className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          + Proyecto
        </Link>
      </nav>
    </header>
  );
}
