"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function SetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token  = params.get("token") ?? ""
  const [pw1,     setPw1]     = useState("")
  const [pw2,     setPw2]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw1 !== pw2) { setError("Las contraseñas no coinciden."); return }
    if (pw1.length < 8) { setError("Mínimo 8 caracteres."); return }
    setLoading(true)
    const res = await fetch("/api/client/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw1 }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) { setDone(true); setTimeout(() => router.push("/portal"), 2000) }
    else setError(data.error ?? "Error al guardar la contraseña.")
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>
            FastForward <span style={{ color: "#aaa", fontWeight: 300 }}>Portal</span>
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>Creá tu contraseña para acceder al portal</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: 24 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a7a4a", marginBottom: 6 }}>¡Contraseña guardada!</div>
              <div style={{ fontSize: 13, color: "#888" }}>Redirigiendo a tu portal…</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4, fontWeight: 500 }}>Nueva contraseña</div>
                <input type="password" value={pw1} onChange={e => setPw1(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required autoFocus
                  style={{ width: "100%", height: 38, fontSize: 14, padding: "0 12px", borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff", color: "#111", outline: "none", boxSizing: "border-box" as any }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4, fontWeight: 500 }}>Repetir contraseña</div>
                <input type="password" value={pw2} onChange={e => setPw2(e.target.value)}
                  placeholder="Repetí la contraseña" required
                  style={{ width: "100%", height: 38, fontSize: 14, padding: "0 12px", borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff", color: "#111", outline: "none", boxSizing: "border-box" as any }} />
              </div>
              {error && <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#cc2020", marginBottom: 14 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ width: "100%", height: 40, fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Guardando…" : "Guardar contraseña →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return <Suspense><SetPasswordForm /></Suspense>
}
