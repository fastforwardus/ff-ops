"use client"
import { useEffect, useState } from "react"

type Lang = "es" | "en"

const T = {
  es: {
    title:        "Mi trámite",
    subtitle:     "Seguí el estado de tu registro en tiempo real.",
    status:       "Estado actual",
    service:      "Servicio",
    expires:      "Vence",
    noExpiry:     "A confirmar",
    steps: [
      { label: "Información recibida",   desc: "Recibimos todos tus datos." },
      { label: "Revisando tu expediente", desc: "Nuestro equipo está revisando la información." },
      { label: "Enviando a la agencia",   desc: "Estamos submiteando ante la FDA." },
      { label: "¡Registro aprobado!",     desc: "Tu número de registro está listo." },
    ],
    eta:          "Tiempo estimado",
    fda:          "Número de registro FDA",
    docs:         "Documentos",
    docsEmpty:    "No hay documentos adjuntos todavía.",
    addService:   "Solicitar otro servicio",
    addServiceBtn:"Enviar solicitud",
    addServicePh: "Contanos qué necesitás...",
    addServiceSent:"¡Solicitud enviada! Te contactamos pronto.",
    logout:       "Salir",
    loading:      "Cargando tu portal...",
    noSub:        "No encontramos trámites activos.",
  },
  en: {
    title:        "My registration",
    subtitle:     "Track your registration status in real time.",
    status:       "Current status",
    service:      "Service",
    expires:      "Expires",
    noExpiry:     "To be confirmed",
    steps: [
      { label: "Information received",  desc: "We received all your details." },
      { label: "Reviewing your file",   desc: "Our team is reviewing the information." },
      { label: "Filing with the agency", desc: "We are submitting to the FDA." },
      { label: "Registration approved!", desc: "Your registration number is ready." },
    ],
    eta:          "Estimated time",
    fda:          "FDA Registration Number",
    docs:         "Documents",
    docsEmpty:    "No documents attached yet.",
    addService:   "Request another service",
    addServiceBtn:"Send request",
    addServicePh: "Tell us what you need...",
    addServiceSent:"Request sent! We'll be in touch soon.",
    logout:       "Sign out",
    loading:      "Loading your portal...",
    noSub:        "No active registrations found.",
  },
}

const STATUS_TO_STEP: Record<string, number> = {
  waiting_duns:    0,
  pending_review:  0,
  under_review:    1,
  ready_to_submit: 1,
  submitted:       2,
  confirmed:       3,
  problem:         1,
}

type Submission = {
  id: string
  status: string
  serviceLabel: string
  serviceLabelEn: string
  fdaRegNumber: string | null
  expiresAt: string | null
  etaStep2: string | null
  etaStep3: string | null
  etaStep4: string | null
  clientName: string
}

export default function PortalPage() {
  const [lang,    setLang]    = useState<Lang>("es")
  const [sub,     setSub]     = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [note,    setNote]    = useState("")
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)
  const t = T[lang]

  useEffect(() => {
    fetch("/api/portal/submission")
      .then(r => { if (r.status === 401) { window.location.href = "/portal/login"; return Promise.reject() }; return r.json() })
      .then(data => { setSub(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function sendRequest() {
    if (!note) return
    setSending(true)
    await fetch("/api/portal/service-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    })
    setSending(false)
    setSent(true)
  }

  const step = sub ? STATUS_TO_STEP[sub.status] ?? 0 : 0
  const etaForStep = [null, sub?.etaStep2, sub?.etaStep3, sub?.etaStep4]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          FastForward <span style={{ color: "var(--text-third)", fontWeight: 300 }}>Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Lang toggle */}
          <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: 8, padding: 3, gap: 2, border: "1px solid var(--border)" }}>
            {(["es", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "4px 12px", borderRadius: 6, border: "none",
                background: lang === l ? "var(--bg-card)" : "transparent",
                color: lang === l ? "var(--text-primary)" : "var(--text-third)",
                fontSize: 12, fontWeight: lang === l ? 600 : 400,
                cursor: "pointer", transition: "all 0.12s",
                boxShadow: lang === l ? "var(--shadow)" : "none",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href="/api/portal/logout" style={{ fontSize: 12, color: "var(--text-third)", textDecoration: "none" }}>
            {t.logout} ↩
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        {loading && <div style={{ textAlign: "center", color: "var(--text-third)", fontSize: 14, padding: 40 }}>{t.loading}</div>}

        {!loading && !sub && (
          <div style={{ textAlign: "center", color: "var(--text-third)", fontSize: 14, padding: 40 }}>{t.noSub}</div>
        )}

        {!loading && sub && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 4 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-second)" }}>{t.subtitle}</div>
            </div>

            {/* Service card */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.service}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {lang === "es" ? sub.serviceLabel : sub.serviceLabelEn}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.expires}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString(lang === "es" ? "es-AR" : "en-US", { day: "numeric", month: "long", year: "numeric" }) : t.noExpiry}
                  </div>
                </div>
                {sub.fdaRegNumber && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.fda}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.08em", color: "#1a7a4a", fontFamily: "monospace" }}>{sub.fdaRegNumber}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress tracker */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px 8px", marginBottom: 24 }}>
              {t.steps.map((s, i) => {
                const done   = i < step
                const active = i === step
                const idle   = i > step
                const isLast = i === t.steps.length - 1

                return (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: isLast ? 12 : 0 }}>
                    {/* Left: circle + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        background: done ? "#1a7a4a" : active ? "#1a5fa0" : "var(--bg-subtle)",
                        color: done ? "#fff" : active ? "#fff" : "var(--text-third)",
                        border: active ? "2px solid #1a5fa0" : "none",
                        animation: active ? "pulse 2s ease-in-out infinite" : "none",
                      }}>
                        {done ? "✓" : i + 1}
                      </div>
                      {!isLast && (
                        <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? "#1a7a4a" : "var(--border)", margin: "3px 0" }} />
                      )}
                    </div>

                    {/* Right: text */}
                    <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 2, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: idle ? "var(--text-third)" : "var(--text-primary)", marginBottom: 2 }}>
                        {s.label}
                      </div>
                      {(done || active) && (
                        <div style={{ fontSize: 12, color: "var(--text-second)", lineHeight: 1.5 }}>
                          {s.desc}
                          {active && etaForStep[i] && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: "#1a5fa0", fontWeight: 500, background: "#e8f4ff", padding: "2px 7px", borderRadius: 10 }}>
                              {t.eta}: {etaForStep[i]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Request service */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{t.addService}</div>
              {sent ? (
                <div style={{ fontSize: 13, color: "#1a7a4a", background: "#edfaf3", border: "1px solid #a8e6c3", borderRadius: 8, padding: "10px 14px" }}>
                  ✓ {t.addServiceSent}
                </div>
              ) : (
                <>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder={t.addServicePh}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 13, fontFamily: "Inter, sans-serif", resize: "vertical", outline: "none", marginBottom: 10 }}
                  />
                  <button onClick={sendRequest} disabled={!note || sending} style={{
                    padding: "8px 18px", borderRadius: 8, border: "none",
                    background: "var(--text-primary)", color: "var(--bg)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    opacity: (!note || sending) ? 0.5 : 1,
                  }}>
                    {sending ? "…" : t.addServiceBtn}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}
