"use client"
import { useEffect, useState } from "react"

type Service = { id: string; labelEs: string; priceUsd: number; category: string; active: boolean }

const CATEGORY_LABELS: Record<string, string> = {
  food:      "Alimentos y bebidas",
  alcohol:   "Bebidas alcohólicas",
  cosmetics: "Cosméticos",
  pharma:    "Farmacéuticos",
  devices:   "Dispositivos médicos",
  usda:      "USDA / NOAA / USFWS",
  business:  "Empresa y marca",
  recurring: "Servicios recurrentes",
}

const CATEGORY_COLORS: Record<string, string> = {
  food:      "#1a7a4a",
  alcohol:   "#7b3fa0",
  cosmetics: "#c8900a",
  pharma:    "#1a5fa0",
  devices:   "#0e6e6e",
  usda:      "#5a6e1a",
  business:  "#333",
  recurring: "#666",
}

export default function VendorDashboard() {
  const [services,  setServices]  = useState<Service[]>([])
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetch("/api/admin/services")
      .then(r => r.json())
      .then(data => { setServices(data.filter((s: Service) => s.active)); setLoading(false) })
  }, [])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedServices = services.filter(s => selected.has(s.id))
  const total = selectedServices.reduce((sum, s) => sum + s.priceUsd, 0)

  const grouped = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = []
    acc[svc.category].push(svc)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #f0f0f0", padding: "24px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", padding: "4px 10px", marginBottom: 24 }}>
            FastForward <span style={{ color: "#aaa", fontWeight: 300 }}>Ops</span>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Inicio",        href: "/vendor/dashboard", active: true },
              { label: "Mis clientes",  href: "/vendor/clients" },
              { label: "Nuevo cliente", href: "/vendor/clients/new" },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", padding: "7px 10px",
                borderRadius: 8, fontSize: 13, textDecoration: "none",
                color: (item as any).active ? "#111" : "#888",
                background: (item as any).active ? "#f5f5f5" : "transparent",
                fontWeight: (item as any).active ? 500 : 400,
              }}>{item.label}</a>
            ))}
          </nav>
        </div>
        <div style={{ fontSize: 11, color: "#ccc", padding: "8px 10px" }}>Vendedor</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: "#fafaf9", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ padding: "28px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 4 }}>
              ¿Qué servicio necesita el cliente?
            </div>
            <div style={{ fontSize: 13, color: "#999" }}>
              Seleccioná uno o más servicios para arrancar el trámite.
            </div>
          </div>
          {selected.size > 0 && (
            <a href="/vendor/clients/new" style={{
              padding: "10px 20px", borderRadius: 9, border: "none",
              background: "#111", color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", textDecoration: "none", display: "inline-block",
            }}>
              Continuar con {selected.size} servicio{selected.size > 1 ? "s" : ""} →
            </a>
          )}
        </div>

        {/* Service grid */}
        <div style={{ flex: 1, padding: "24px 36px", overflowY: "auto" }}>
          {loading && <div style={{ fontSize: 13, color: "#aaa" }}>Cargando servicios…</div>}

          {!loading && Object.entries(grouped).map(([cat, svcs]) => (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                {CATEGORY_LABELS[cat] ?? cat}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {svcs.map(svc => {
                  const isSelected = selected.has(svc.id)
                  const color = CATEGORY_COLORS[cat] ?? "#333"
                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggle(svc.id)}
                      style={{
                        background: isSelected ? "#fff" : "#fff",
                        border: isSelected ? `1.5px solid ${color}` : "1px solid #ebebeb",
                        borderRadius: 10,
                        padding: "14px 14px 12px",
                        cursor: "pointer",
                        position: "relative",
                        transition: "border-color 0.12s, box-shadow 0.12s",
                        boxShadow: isSelected ? `0 0 0 3px ${color}18` : "none",
                        userSelect: "none",
                      }}
                    >
                      {/* Color bar */}
                      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", borderRadius: "10px 0 0 10px", background: color, opacity: isSelected ? 1 : 0.25 }} />

                      {/* Checkmark */}
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          width: 18, height: 18, borderRadius: "50%",
                          background: color, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700,
                        }}>✓</div>
                      )}

                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 8, paddingRight: 20, lineHeight: 1.35 }}>
                        {svc.labelEs}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? color : "#333", letterSpacing: "-0.02em" }}>
                        ${svc.priceUsd.toLocaleString()}
                        <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 3 }}>USD</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom summary bar */}
        {selected.size > 0 && (
          <div style={{
            borderTop: "1px solid #ebebeb", background: "#fff",
            padding: "14px 36px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16,
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#f5f5f5", borderRadius: 20, padding: "4px 10px 4px 12px",
                  fontSize: 12, color: "#444",
                }}>
                  {svc.labelEs}
                  <button onClick={e => { e.stopPropagation(); toggle(svc.id) }} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#999", fontSize: 14, lineHeight: 1, padding: 0,
                  }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#aaa" }}>Total estimado</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#111" }}>
                  ${total.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: "#aaa" }}>USD</span>
                </div>
              </div>
              <a href="/vendor/clients/new" style={{
                padding: "10px 22px", borderRadius: 9, border: "none",
                background: "#111", color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
              }}>
                Continuar →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
