"use client"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/theme"
import { signOut } from "next-auth/react"
import NotificationBell from "./NotificationBell"

type NavItem = { label: string; href: string }

const NAV: Record<string, NavItem[]> = {
  admin: [
    { label: "Dashboard",       href: "/admin/dashboard" },
    { label: "Cola de trabajo", href: "/ops/queue" },
    { label: "Clientes",        href: "/admin/clients" },
    { label: "Equipo",          href: "/admin/team" },
    { label: "Precios",         href: "/admin/prices" },
  ],
  vendor: [
    { label: "Inicio",          href: "/vendor/dashboard" },
    { label: "Mis clientes",    href: "/vendor/clients" },
    { label: "Nuevo cliente",   href: "/vendor/clients/new" },
  ],
  ops: [
    { label: "Cola de trabajo", href: "/ops/queue" },
    { label: "Mis clientes",    href: "/vendor/clients" },
    { label: "Nuevo cliente",   href: "/vendor/clients/new" },
  ],
}

export default function Sidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const items = NAV[role] ?? []

  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: `1px solid var(--sidebar-border)`,
      padding: "24px 12px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: "var(--sidebar-bg)",
      minHeight: "100vh",
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", padding: "4px 10px", marginBottom: 24, color: "var(--text-primary)" }}>
          FastForward <span style={{ color: "var(--text-third)", fontWeight: 300 }}>Ops</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <a key={item.href} href={item.href} style={{
                display: "block", padding: "7px 10px", borderRadius: 8,
                fontSize: 13, textDecoration: "none",
                color: active ? "var(--text-primary)" : "var(--text-second)",
                background: active ? "var(--bg-subtle)" : "transparent",
                fontWeight: active ? 500 : 400,
                transition: "background 0.1s",
              }}>
                {item.label}
              </a>
            )
          })}
        </nav>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <NotificationBell />
        <div style={{
          display: "flex", background: "var(--bg-subtle)",
          borderRadius: 8, padding: 3, gap: 2,
          border: `1px solid var(--border)`,
        }}>
          {(["light", "dark"] as const).map(t => (
            <button key={t} onClick={toggle} style={{
              flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
              background: theme === t ? "var(--bg-card)" : "transparent",
              color: theme === t ? "var(--text-primary)" : "var(--text-third)",
              fontSize: 12, fontWeight: theme === t ? 500 : 400,
              cursor: "pointer", transition: "background 0.12s",
              boxShadow: theme === t ? "var(--shadow)" : "none",
            }}>
              {t === "light" ? "☀ Light" : "◐ Dark"}
            </button>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", borderRadius: 8,
          border: `1px solid var(--border)`,
          background: "var(--bg-card)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--bg-subtle)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: "var(--text-second)",
          }}>
            {userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-third)", textTransform: "capitalize" }}>{role}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} title="Salir" style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-third)", fontSize: 14, padding: 0,
          }}>↩</button>
        </div>
      </div>
    </div>
  )
}
