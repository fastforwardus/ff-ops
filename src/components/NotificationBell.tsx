"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type Notification = {
  id: string; type: string; title: string; body: string | null
  link: string | null; read: boolean; createdAt: string
}

export default function NotificationBell() {
  const [notifs,  setNotifs]  = useState<Notification[]>([])
  const [open,    setOpen]    = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30_000) // poll cada 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function fetchNotifs() {
    const res = await fetch("/api/notifications")
    if (res.ok) setNotifs(await res.json())
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "all" }) })
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifs.filter(n => !n.read).length

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return "ahora"
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          border: "1px solid var(--border)", background: open ? "var(--bg-subtle)" : "var(--bg-card)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--text-second)", fontSize: 13,
        }}
      >
        <span>🔔 Notificaciones</span>
        {unread > 0 && (
          <span style={{
            background: "#cc2020", color: "#fff", fontSize: 10, fontWeight: 700,
            borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center",
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 100, overflow: "hidden", minWidth: 280,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Notificaciones</div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11, color: "var(--text-third)", background: "none", border: "none", cursor: "pointer" }}>
                Marcar todo leído
              </button>
            )}
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifs.length === 0 && (
              <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: "var(--text-third)" }}>
                Sin notificaciones
              </div>
            )}
            {notifs.map(n => (
              <div
                key={n.id}
                onClick={async () => {
                  await markRead(n.id)
                  setOpen(false)
                  if (n.link) router.push(n.link)
                }}
                style={{
                  padding: "11px 14px", borderBottom: "1px solid var(--border)",
                  cursor: "pointer", background: n.read ? "transparent" : "var(--bg-subtle)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.read ? "transparent" : "#1a5fa0", marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "var(--text-primary)", marginBottom: 2, lineHeight: 1.3 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12, color: "var(--text-third)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-third)", flexShrink: 0, marginTop: 1 }}>{timeAgo(n.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
