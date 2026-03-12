"use client"
import { useState } from "react"

export default function PortalLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    window.location.href = "/portal"
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: 360, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>FastForward</span>
          <span style={{ color: "var(--text-third)", fontWeight: 300 }}> Portal</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ color: "#cc2020", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "11px 0", background: "var(--text-main)", color: "var(--bg-main)", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Entrando..." : "Entrar al portal"}
          </button>
        </form>
      </div>
    </div>
  )
}
