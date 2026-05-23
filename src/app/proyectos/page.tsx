import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function Proyectos() {
  const proyectos = await prisma.proyecto.findMany({
    orderBy: { creadoEn: "desc" },
    include: { _count: { select: { eventos: true } } },
  });

  return (
    <>
      <main style={{ background: "#000", minHeight: "100dvh" }}>

        {/* Header */}
        <div className="safe-header" style={{
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            Proyectos
          </h1>
          <Link
            href="/nuevo-proyecto"
            className="tappable"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              minHeight: 44,
              borderRadius: 12,
              background: "#c5f135",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.82rem",
              textDecoration: "none",
            }}
          >
            + Nuevo
          </Link>
        </div>

        <div style={{ padding: "0 16px" }}>
          {proyectos.length === 0 ? (
            <div style={{ background: "#141414", borderRadius: 20, padding: "48px 20px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 16 }}>
                Sin proyectos todavía
              </p>
              <Link
                href="/nuevo-proyecto"
                style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "#c5f135",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                + Crear proyecto
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proyectos.map((p) => (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="tappable"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#141414",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `3px solid ${p.color}`,
                    borderRadius: 18,
                    padding: "16px 18px",
                    textDecoration: "none",
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: `${p.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nombre}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", marginTop: 2 }}>
                      {p._count.eventos} evento{p._count.eventos !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Navbar />
    </>
  );
}
