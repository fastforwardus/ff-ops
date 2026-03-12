"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import SidebarWrapper from "@/components/SidebarWrapper"

type Service = { id: string; labelEs: string; priceUsd: number; category: string; active: boolean }

const CATEGORY_LABELS: Record<string, string> = {
  food: "Alimentos y bebidas", alcohol: "Bebidas alcohólicas", cosmetics: "Cosméticos",
  pharma: "Farmacéuticos", devices: "Dispositivos médicos", usda: "USDA / NOAA / USFWS",
  business: "Empresa y marca", recurring: "Servicios recurrentes",
}
const CATEGORY_COLORS: Record<string, string> = {
  food: "#1a7a4a", alcohol: "#7b3fa0", cosmetics: "#c8900a", pharma: "#1a5fa0",
  devices: "#0e6e6e", usda: "#5a6e1a", business: "#333", recurring: "#666",
}

export default function VendorDashboard() {
  const { data: session } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/services")
      .then(r => r.json())
      .then(data => { setServices(data.filter((s: Service) => s.active)); setLoading(false) })
  }, [])

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const selectedServices = services.filter(s => selected.has(s.id))
  const total = selectedServices.reduce((sum, s) => sum + s.priceUsd, 0)
  const grouped = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = []
    acc[svc.category].push(svc)
    return acc
  }, {} as Record<string, Service[]>)

  const role = (session?.user as any)?.role ?? "vendor"
  const userName = (session?.user as any)?.name ?? ""

  return (
    <SidebarWrapper role={role} userName={userName}>
      <div style={{ padding: "28px 36px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 4, color: "var(--text-primary)" }}>
              ¿Qué servicio necesita el cliente?
            </div>
            <div style={{ fontSize: 13, color: "var(--text-third)" }}>Seleccioná uno o más servicios para arrancar el trámite.</div>
          </div>
          {selected.size > 0 && (
            <a href="/vendor/clients/new" style={{ padding: "10px 20px", borderRadius: 9, background: "var(--text-primary)", color: "var(--bg)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Continuar con {selected.size} servicio{selected.size > 1 ? "s" : ""} →
            </a>
          )}
        </div>

        {loading && <div style={{ fontSize: 13, color: "var(--text-third)" }}>Cargando servicios…</div>}

        {!loading && Object.entries(grouped).map(([cat, svcs]) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-third)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {svcs.map(svc => {
                const isSelected = selected.has(svc.id)
                const color = CATEGORY_COLORS[cat] ?? "#333"
                return (
                  <div key={svc.id} onClick={() => toggle(svc.id)} style={{
                    background: "var(--bg-card)", border: isSelected ? `1.5px solid ${color}` : "1px solid var(--border)",
                    borderRadius: 10, padding: "14px 14px 12px", cursor: "pointer", position: "relative",
                    boxShadow: isSelected ? `0 0 0 3px ${color}18` : "none", userSelect: "none",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", borderRadius: "10px 0 0 10px", background: color, opacity: isSelected ? 1 : 0.25 }} />
                    {isSelected && (
                      <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8, paddingRight: 20, lineHeight: 1.35 }}>{svc.labelEs}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? color : "var(--text-second)", letterSpacing: "-0.02em" }}>
                      ${svc.priceUsd.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-third)", marginLeft: 3 }}>USD</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {selected.size > 0 && (
          <div style={{ position: "sticky", bottom: 0, background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-subtle)", borderRadius: 20, padding: "4px 10px 4px 12px", fontSize: 12, color: "var(--text-second)" }}>
                  {svc.labelEs}
                  <button onClick={e => { e.stopPropagation(); toggle(svc.id) }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-third)", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-third)" }}>Total estimado</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                  ${total.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-third)" }}>USD</span>
                </div>
              </div>
              <a href="/vendor/clients/new" style={{ padding: "10px 22px", borderRadius: 9, background: "var(--text-primary)", color: "var(--bg)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Continuar →</a>
            </div>
          </div>
        )}
      </div>
    </SidebarWrapper>
  )
}
