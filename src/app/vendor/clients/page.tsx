"use client"
import { useEffect, useState } from "react"
import SidebarWrapper from "@/components/SidebarWrapper"
import { useSession } from "next-auth/react"

type Client = {
  id: string
  companyName: string
  country: string
  ownerEmail: string
  phone: string
  dunsStatus: string
  createdAt: string
  submissions: {
    id: string
    status: string
    urgency: string
    serviceLabel: string
    assignedToName: string | null
  }[]
}

const DUNS_LABEL: Record<string, string> = {
  has:       "Tiene DUNS",
  requested: "Solicitado",
  needed:    "Necesita DUNS",
  exempt:    "Exento",
}
const DUNS_COLOR: Record<string, { bg: string; color: string }> = {
  has:       { bg: "#edfaf3", color: "#1a7a4a" },
  requested: { bg: "#fff8ec", color: "#c8900a" },
  needed:    { bg: "#fff0f0", color: "#cc2020" },
  exempt:    { bg: "#f0f0ff", color: "#5555cc" },
}
const STATUS_LABEL: Record<string, string> = {
  waiting_duns:    "Esperando DUNS",
  pending_review:  "Pendiente revisión",
  under_review:    "En revisión",
  ready_to_submit: "Listo para submitir",
  submitted:       "Submitted",
  confirmed:       "Confirmado",
  problem:         "Hay un problema",
}
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  waiting_duns:    { bg: "#f0f0ff", color: "#5555cc" },
  pending_review:  { bg: "#fff8ec", color: "#c8900a" },
  under_review:    { bg: "#e8f4ff", color: "#1a5fa0" },
  ready_to_submit: { bg: "#f0fff4", color: "#1a7a4a" },
  submitted:       { bg: "#edfaf3", color: "#1a7a4a" },
  confirmed:       { bg: "#edfaf3", color: "#1a7a4a" },
  problem:         { bg: "#fff0f0", color: "#cc2020" },
}

export default function VendorClientsPage() {
  const { data: session } = useSession()
  const [clients,  setClients]  = useState<Client[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const res = await fetch("/api/vendor/clients")
    setClients(await res.json())
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarWrapper role="vendor" userName={(session?.user as any)?.name ?? ""}>
      <div style={{ padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 4, color: "var(--text-primary)" }}>Mis clientes</div>
            <div style={{ fontSize: 13, color: "var(--text-second)" }}>{clients.length} cliente{clients.length !== 1 ? "s" : ""} en tu cartera</div>
          </div>
          <a href="/vendor/clients/new" style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "var(--text-primary)", color: "var(--bg)",
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            display: "inline-block",
          }}>+ Nuevo cliente</a>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por empresa, email o país..."
            style={{
              width: "100%", maxWidth: 400, height: 36, fontSize: 13,
              padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--input-border)", background: "var(--input-bg)",
              color: "var(--text-primary)", outline: "none", fontFamily: "Inter, sans-serif",
            }}
          />
        </div>

        {loading && <div style={{ fontSize: 13, color: "var(--text-third)", padding: 20 }}>Cargando clientes…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-third)", fontSize: 14 }}>
            {clients.length === 0 ? (
              <>No tenés clientes todavía. <a href="/vendor/clients/new" style={{ color: "var(--text-primary)" }}>Agregá el primero →</a></>
            ) : "Sin resultados para esa búsqueda."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(client => {
            const isExpanded  = expanded === client.id
            const dunsStyle   = DUNS_COLOR[client.dunsStatus] ?? { bg: "var(--bg-subtle)", color: "var(--text-third)" }
            const hasProblems = client.submissions.some(s => s.status === "problem")
            const allDone     = client.submissions.length > 0 && client.submissions.every(s => s.status === "confirmed")

            return (
              <div key={client.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, overflow: "hidden",
                borderLeft: `3px solid ${hasProblems ? "#cc2020" : allDone ? "#1a7a4a" : "var(--border-mid)"}`,
              }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : client.id)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 120px 80px 36px", alignItems: "center", padding: "14px 18px", cursor: "pointer", gap: 12 }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{client.companyName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-third)" }}>{client.ownerEmail}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-second)" }}>{client.country}</div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: dunsStyle.bg, color: dunsStyle.color }}>
                      {DUNS_LABEL[client.dunsStatus] ?? client.dunsStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-second)", fontWeight: 500 }}>
                    {client.submissions.length} trámite{client.submissions.length !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-third)" }}>
                    {new Date(client.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                  </div>
                  <div style={{ fontSize: 16, color: "var(--text-third)", textAlign: "center", userSelect: "none" }}>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>

                {/* Expanded — trámites */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "var(--bg-subtle)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 4 }}>TELÉFONO</div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{client.phone || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 4 }}>EMAIL RESPONSABLE</div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{client.ownerEmail}</div>
                      </div>
                    </div>

                    {client.submissions.length === 0 ? (
                      <div style={{ fontSize: 13, color: "var(--text-third)", fontStyle: "italic" }}>Sin trámites activos.</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: "var(--text-third)", fontWeight: 500, marginBottom: 8, letterSpacing: "0.04em" }}>TRÁMITES</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {client.submissions.map(sub => {
                            const st = STATUS_COLOR[sub.status] ?? { bg: "var(--bg-card)", color: "var(--text-second)" }
                            const urgColor = sub.urgency === "critical" ? "#cc2020" : sub.urgency === "high" ? "#c8900a" : "var(--text-third)"
                            return (
                              <div key={sub.id} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                background: "var(--bg-card)", borderRadius: 8, padding: "10px 14px",
                                border: "1px solid var(--border)",
                              }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>{sub.serviceLabel}</div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  {sub.assignedToName && (
                                    <span style={{ fontSize: 11, color: "var(--text-third)" }}>
                                      👤 {sub.assignedToName}
                                    </span>
                                  )}
                                  <span style={{ fontSize: 11, fontWeight: 600, color: urgColor }}>
                                    {sub.urgency === "critical" ? "⚡" : sub.urgency === "high" ? "↑" : ""}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: st.bg, color: st.color }}>
                                    {STATUS_LABEL[sub.status] ?? sub.status}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: 14 }}>
                      <a href={`/vendor/clients/new`} style={{ fontSize: 12, color: "var(--text-second)", textDecoration: "none", border: "1px solid var(--border)", padding: "5px 12px", borderRadius: 6, background: "var(--bg-card)" }}>
                        + Agregar trámite
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </SidebarWrapper>
  )
}
