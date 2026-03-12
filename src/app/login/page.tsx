"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", { email, password, redirect: false })

    if (!res || res.error) {
      setError("Email o contraseña incorrectos.")
      setLoading(false)
      return
    }

    // Esperar que la cookie esté lista
    await new Promise(r => setTimeout(r, 800))

    const session = await fetch("/api/auth/session").then(r => r.json())
    const role          = session?.user?.role
    const needsPwChange = session?.user?.needsPwChange

    if (needsPwChange) { router.push("/change-password"); return }
    if (role === "admin")  { router.push("/admin/dashboard"); return }
    if (role === "vendor") { router.push("/vendor/dashboard"); return }
    if (role === "ops")    { router.push("/ops/queue"); return }
    if (role === "client") { router.push("/portal"); return }
    router.push("/")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #0e0e0e; }
        @media (max-width: 700px) { .wrap { grid-template-columns: 1fr; } .left { display: none !important; } }
        .left { display: flex; flex-direction: column; justify-content: space-between; padding: 48px; background: linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%); border-right: 1px solid #222; }
        .right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #fafaf9; }
        .form-box { width: 100%; max-width: 320px; }
        .form-title { font-size: 22px; font-weight: 600; color: #111; letter-spacing: -0.03em; margin-bottom: 6px; }
        .form-sub { font-size: 13px; color: #999; margin-bottom: 32px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12px; color: #666; font-weight: 500; margin-bottom: 5px; }
        .field input { width: 100%; height: 40px; font-size: 14px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #e8e8e8; background: #fff; color: #111; outline: none; transition: border-color 0.15s; font-family: 'Inter', sans-serif; }
        .field input:focus { border-color: #111; }
        .field input::placeholder { color: #ccc; }
        .err { background: #fff5f5; border: 1px solid #fdd; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #c00; margin-bottom: 16px; }
        .submit-btn { width: 100%; height: 42px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none; background: #111; color: #fff; cursor: pointer; transition: opacity 0.15s; font-family: 'Inter', sans-serif; }
        .submit-btn:hover { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .footer { margin-top: 28px; font-size: 11px; color: #ccc; text-align: center; }
      `}</style>
      <div className="wrap">
        <div className="left">
          <div style={{ fontSize:18, fontWeight:600, color:"#fff", letterSpacing:"-0.03em" }}>FastForward <span style={{ color:"#555", fontWeight:300 }}>Ops</span></div>
          <div>
            <div style={{ fontSize:28, fontWeight:300, color:"#fff", lineHeight:1.3, marginBottom:16, letterSpacing:"-0.04em" }}>
              FDA submissions,<br /><span style={{ color:"#555" }}>under control.</span>
            </div>
            <div style={{ color:"#444", fontSize:13, lineHeight:1.6, maxWidth:280 }}>
              Internal platform for managing <strong style={{ color:"#888", fontWeight:400 }}>FDA registrations</strong>, client portals, and operations workflows.
            </div>
          </div>
          <div style={{ fontSize:11, color:"#333" }}>FastForward LLC · Miami, FL</div>
        </div>
        <div className="right">
          <div className="form-box">
            <div className="form-title">Bienvenido</div>
            <div className="form-sub">Ingresá con tu cuenta</div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vos@fastfwdus.com" required autoFocus />
              </div>
              <div className="field" style={{ marginBottom:24 }}>
                <label>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              {error && <div className="err">{error}</div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Ingresando…" : "Ingresar →"}
              </button>
            </form>
            <div className="footer">FastForward LLC · Miami, FL</div>
          </div>
        </div>
      </div>
    </>
  )
}
