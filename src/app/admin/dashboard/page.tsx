import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SidebarWrapper from "@/components/SidebarWrapper"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin") redirect("/login")

  return (
    <SidebarWrapper role="admin" userName={session.user?.name ?? "Admin"}>
      <div style={{ padding: "32px 40px" }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 4, color: "var(--text-primary)" }}>
          Dashboard
        </div>
        <div style={{ fontSize: 13, color: "var(--text-second)", marginBottom: 32 }}>
          Bienvenido, {session.user?.name?.split(" ")[0]} 👋
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Trámites activos",        value: "—", color: "var(--text-primary)" },
            { label: "Pendientes de revisión",  value: "—", color: "#c8900a" },
            { label: "Confirmados este mes",    value: "—", color: "#1a7a4a" },
          ].map(card => (
            <div key={card.label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "20px 22px",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-third)", marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color, letterSpacing: "-0.04em" }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "var(--text-third)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Accesos rápidos
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "→ Gestionar precios", href: "/admin/prices" },
            { label: "→ Cola de trabajo",   href: "/ops/queue" },
            { label: "→ Equipo",            href: "/admin/team" },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13, color: "var(--text-second)",
              textDecoration: "none", background: "var(--bg-card)",
            }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </SidebarWrapper>
  )
}
