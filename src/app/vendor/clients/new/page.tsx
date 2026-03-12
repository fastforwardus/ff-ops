"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type FormData = {
  // Paso 1 - DUNS
  dunsStatus: "has" | "pending" | "waiting"
  dunsNumber: string
  dunsRequestedAt: string
  dunsTrackingNumber: string
  // Paso 2 - Empresa
  companyName: string
  tradeNames: string
  country: string
  address: string
  state: string
  postalCode: string
  phone: string
  emergencyPhone: string
  ownerEmail: string
  // Paso 3 - Owner / US Agent
  ownerName: string
  ownerRole: string
  ownerAddress: string
  ownerPhone: string
  authorizerName: string
  authorizerEmail: string
  // Paso 4 - Actividad
  activityTypes: string[]
  foodCategories: string[]
  seasonal: boolean
  monthsOperation: string
  internalNotes: string
  // Servicios seleccionados (del dashboard)
  serviceIds: string[]
}

const ACTIVITY_TYPES = [
  "Manufacturer", "Packer", "Repacker", "Importer", "Broker",
  "Distributor", "Warehouse", "Holding Facility", "Processor",
]
const FOOD_CATEGORIES = [
  "Bakery products", "Beverages", "Candy", "Cereal",
  "Cheese", "Chocolate", "Coffee & Tea", "Dairy",
  "Fish & Seafood", "Frozen foods", "Fruits & Vegetables",
  "Grains & Beans", "Meat & Poultry", "Nuts & Seeds",
  "Oils & Fats", "Sauces & Condiments", "Snacks", "Spices",
  "Supplements", "Other",
]

const STEPS = ["DUNS", "Empresa", "Responsable", "Actividad", "Confirmar"]

export default function NewClientPage() {
  const router = useRouter()
  const [step,    setStep]    = useState(0)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState<FormData>({
    dunsStatus: "has", dunsNumber: "", dunsRequestedAt: "", dunsTrackingNumber: "",
    companyName: "", tradeNames: "", country: "", address: "", state: "", postalCode: "",
    phone: "", emergencyPhone: "", ownerEmail: "",
    ownerName: "", ownerRole: "owner", ownerAddress: "", ownerPhone: "",
    authorizerName: "", authorizerEmail: "",
    activityTypes: [], foodCategories: [], seasonal: false, monthsOperation: "", internalNotes: "",
    serviceIds: [],
  })

  function set(field: keyof FormData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleArray(field: "activityTypes" | "foodCategories", value: string) {
    setForm(prev => {
      const arr = prev[field] as string[]
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  async function submit() {
    setSaving(true)
    const res = await fetch("/api/vendor/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) router.push("/vendor/clients")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #f0f0f0", padding: "24px 12px", background: "#fff" }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", padding: "4px 10px", marginBottom: 24 }}>
          FastForward <span style={{ color: "#aaa", fontWeight: 300 }}>Ops</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "Inicio",        href: "/vendor/dashboard" },
            { label: "Mis clientes",  href: "/vendor/clients" },
            { label: "Nuevo cliente", href: "/vendor/clients/new", active: true },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              padding: "7px 10px", borderRadius: 8, fontSize: 13, textDecoration: "none",
              color: (item as any).active ? "#111" : "#888",
              background: (item as any).active ? "#f5f5f5" : "transparent",
              fontWeight: (item as any).active ? 500 : 400,
            }}>{item.label}</a>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: "#fafaf9", display: "flex", flexDirection: "column" }}>
        {/* Steps header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "16px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < step ? "#111" : i === step ? "#111" : "#f0f0f0",
                    color: i <= step ? "#fff" : "#aaa",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i === step ? 500 : 400, color: i === step ? "#111" : i < step ? "#555" : "#bbb" }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 32, height: 1, background: i < step ? "#111" : "#e5e5e5", margin: "0 8px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div style={{ flex: 1, padding: "32px 36px", maxWidth: 700 }}>

          {/* PASO 1 — DUNS */}
          {step === 0 && (
            <div>
              <div style={titleStyle}>¿El cliente tiene número DUNS?</div>
              <div style={subtitleStyle}>El DUNS es requerido para el registro FDA. Si no lo tiene, el trámite queda en espera hasta recibirlo.</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {([
                  { value: "has",     label: "Sí, ya tiene DUNS",          desc: "El trámite avanza de inmediato" },
                  { value: "pending", label: "Está en trámite",            desc: "Ya lo solicitó, en proceso" },
                  { value: "waiting", label: "No tiene, hay que solicitarlo", desc: "El expediente queda en espera (≤45 días)" },
                ] as const).map(opt => (
                  <label key={opt.value} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                    borderRadius: 10, border: `1.5px solid ${form.dunsStatus === opt.value ? "#111" : "#e5e5e5"}`,
                    background: form.dunsStatus === opt.value ? "#fafaf9" : "#fff",
                    cursor: "pointer",
                  }}>
                    <input type="radio" name="duns" value={opt.value} checked={form.dunsStatus === opt.value}
                      onChange={() => set("dunsStatus", opt.value)} style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {form.dunsStatus === "has" && (
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Número DUNS</div>
                  <input value={form.dunsNumber} onChange={e => set("dunsNumber", e.target.value)}
                    placeholder="123456789" style={inputStyle} />
                </div>
              )}
              {(form.dunsStatus === "pending" || form.dunsStatus === "waiting") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={fieldGroup}>
                    <div style={fieldLabel}>Fecha de solicitud</div>
                    <input type="date" value={form.dunsRequestedAt} onChange={e => set("dunsRequestedAt", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={fieldGroup}>
                    <div style={fieldLabel}>Número de tracking (opcional)</div>
                    <input value={form.dunsTrackingNumber} onChange={e => set("dunsTrackingNumber", e.target.value)}
                      placeholder="DUNS-XXXX" style={inputStyle} />
                  </div>
                </div>
              )}

              {form.dunsStatus === "waiting" && (
                <div style={{ background: "#fff8ec", border: "1px solid #f5d88a", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#c8900a", marginTop: 16 }}>
                  ⏳ El expediente se crea en estado <strong>"Esperando DUNS"</strong>. Cuando llegue, operaciones lo carga y el trámite continúa.
                </div>
              )}
            </div>
          )}

          {/* PASO 2 — Empresa */}
          {step === 1 && (
            <div>
              <div style={titleStyle}>Datos del establecimiento</div>
              <div style={subtitleStyle}>Nombre legal y dirección exacta del establecimiento que se registra.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
                  <div style={fieldLabel}>Nombre legal del establecimiento *</div>
                  <input value={form.companyName} onChange={e => set("companyName", e.target.value)}
                    placeholder="Lácteos del Sur S.A." style={inputStyle} />
                </div>
                <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
                  <div style={fieldLabel}>Nombres comerciales (opcional)</div>
                  <input value={form.tradeNames} onChange={e => set("tradeNames", e.target.value)}
                    placeholder="LacSur, Quesos del Sur" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>País *</div>
                  <input value={form.country} onChange={e => set("country", e.target.value)}
                    placeholder="Chile" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Estado / Provincia</div>
                  <input value={form.state} onChange={e => set("state", e.target.value)}
                    placeholder="Región Metropolitana" style={inputStyle} />
                </div>
                <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
                  <div style={fieldLabel}>Dirección completa *</div>
                  <input value={form.address} onChange={e => set("address", e.target.value)}
                    placeholder="Av. Ejemplo 1234, Santiago" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Código postal</div>
                  <input value={form.postalCode} onChange={e => set("postalCode", e.target.value)}
                    placeholder="8320000" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Teléfono principal *</div>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+56 2 1234 5678" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Teléfono de emergencia</div>
                  <input value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)}
                    placeholder="+56 9 8765 4321" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Email del owner / contacto principal *</div>
                  <input type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)}
                    placeholder="contacto@lacteossur.cl" style={inputStyle} />
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Se usa para crear la cuenta del portal del cliente</div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3 — Owner / US Agent */}
          {step === 2 && (
            <div>
              <div style={titleStyle}>Responsable y US Agent</div>
              <div style={subtitleStyle}>Datos del owner/operator y del US Agent FDA.</div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                Owner / Operator
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Nombre completo</div>
                  <input value={form.ownerName} onChange={e => set("ownerName", e.target.value)}
                    placeholder="Juan Pérez" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Rol</div>
                  <select value={form.ownerRole} onChange={e => set("ownerRole", e.target.value)} style={inputStyle}>
                    <option value="owner">Owner</option>
                    <option value="operator">Operator</option>
                    <option value="agent_in_charge">Agent in Charge</option>
                  </select>
                </div>
                <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
                  <div style={fieldLabel}>Dirección del owner</div>
                  <input value={form.ownerAddress} onChange={e => set("ownerAddress", e.target.value)}
                    placeholder="Misma que el establecimiento" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Teléfono</div>
                  <input value={form.ownerPhone} onChange={e => set("ownerPhone", e.target.value)}
                    placeholder="+56 9 ..." style={inputStyle} />
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                Autorizante del registro
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Nombre</div>
                  <input value={form.authorizerName} onChange={e => set("authorizerName", e.target.value)}
                    placeholder="María García" style={inputStyle} />
                </div>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>Email</div>
                  <input type="email" value={form.authorizerEmail} onChange={e => set("authorizerEmail", e.target.value)}
                    placeholder="maria@lacteossur.cl" style={inputStyle} />
                </div>
              </div>

              <div style={{ background: "#f5f5f5", borderRadius: 10, padding: "14px 16px", fontSize: 13 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 8 }}>US AGENT (pre-completado)</div>
                <div style={{ color: "#555", lineHeight: 1.7 }}>
                  <div><strong>FastForward LLC</strong></div>
                  <div>33 SW 2nd Ave #1202, Miami FL 33130</div>
                  <div>US Agent Inbox® — se asigna al crear el trámite</div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4 — Actividad */}
          {step === 3 && (
            <div>
              <div style={titleStyle}>Actividad del establecimiento</div>
              <div style={subtitleStyle}>Qué hace el establecimiento y qué productos maneja.</div>

              <div style={{ marginBottom: 20 }}>
                <div style={fieldLabel}>Tipos de actividad</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {ACTIVITY_TYPES.map(a => (
                    <button key={a} onClick={() => toggleArray("activityTypes", a)} style={{
                      padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      border: form.activityTypes.includes(a) ? "1.5px solid #111" : "1px solid #e5e5e5",
                      background: form.activityTypes.includes(a) ? "#111" : "#fff",
                      color: form.activityTypes.includes(a) ? "#fff" : "#555",
                      fontWeight: form.activityTypes.includes(a) ? 500 : 400,
                    }}>{a}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={fieldLabel}>Categorías de alimentos FDA</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {FOOD_CATEGORIES.map(c => (
                    <button key={c} onClick={() => toggleArray("foodCategories", c)} style={{
                      padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      border: form.foodCategories.includes(c) ? "1.5px solid #1a7a4a" : "1px solid #e5e5e5",
                      background: form.foodCategories.includes(c) ? "#edfaf3" : "#fff",
                      color: form.foodCategories.includes(c) ? "#1a7a4a" : "#555",
                      fontWeight: form.foodCategories.includes(c) ? 500 : 400,
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={fieldGroup}>
                  <div style={fieldLabel}>¿Operación estacional?</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    {["Sí", "No"].map(v => (
                      <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="radio" name="seasonal" checked={form.seasonal === (v === "Sí")}
                          onChange={() => set("seasonal", v === "Sí")} />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
                {form.seasonal && (
                  <div style={fieldGroup}>
                    <div style={fieldLabel}>Meses de operación</div>
                    <input value={form.monthsOperation} onChange={e => set("monthsOperation", e.target.value)}
                      placeholder="Ej: marzo a octubre" style={inputStyle} />
                  </div>
                )}
              </div>

              <div style={fieldGroup}>
                <div style={fieldLabel}>Notas internas (solo equipo FastForward)</div>
                <textarea value={form.internalNotes} onChange={e => set("internalNotes", e.target.value)}
                  placeholder="Algún detalle relevante para operaciones..." rows={3}
                  style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }} />
              </div>
            </div>
          )}

          {/* PASO 5 — Confirmar */}
          {step === 4 && (
            <div>
              <div style={titleStyle}>Revisión final</div>
              <div style={subtitleStyle}>Verificá los datos antes de crear el expediente.</div>

              {/* Summary cards */}
              {[
                { label: "DUNS", items: [
                  form.dunsStatus === "has" ? `Número: ${form.dunsNumber}` :
                  form.dunsStatus === "pending" ? `En trámite desde ${form.dunsRequestedAt}` :
                  "Sin DUNS — expediente en espera"
                ]},
                { label: "EMPRESA", items: [
                  form.companyName, form.address, `${form.country}${form.state ? ` · ${form.state}` : ""}`,
                  form.phone, form.ownerEmail,
                ].filter(Boolean) },
                { label: "RESPONSABLE", items: [
                  form.ownerName && `${form.ownerName} (${form.ownerRole})`,
                  form.authorizerName && `Autorizante: ${form.authorizerName}`,
                ].filter(Boolean) },
                { label: "ACTIVIDAD", items: [
                  form.activityTypes.length ? `Actividades: ${form.activityTypes.join(", ")}` : null,
                  form.foodCategories.length ? `Categorías: ${form.foodCategories.join(", ")}` : null,
                  form.seasonal ? `Estacional: ${form.monthsOperation}` : null,
                ].filter(Boolean) },
              ].map(section => (
                <div key={section.label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                    {section.label}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: "12px 14px" }}>
                    {(section.items as string[]).map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Confirm alert */}
              <div style={{ background: "#edfaf3", border: "1.5px solid #a8e6c3", borderRadius: 10, padding: "16px 18px", marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a7a4a", marginBottom: 8 }}>
                  Al confirmar, el sistema hace esto automáticamente:
                </div>
                <div style={{ fontSize: 13, color: "#1a7a4a", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div>✓ Crea la cuenta del cliente con email <strong>{form.ownerEmail}</strong></div>
                  <div>✓ Envía email de bienvenida con link para setear contraseña</div>
                  <div>✓ El cliente ve su trámite en tiempo real desde el portal</div>
                </div>
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, fontSize: 13, color: "#856404", fontWeight: 500 }}>
                  ⚠ SOLO CONFIRMAR CON PAGO ACREDITADO
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div style={{ borderTop: "1px solid #ebebeb", background: "#fff", padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e5e5",
            background: "#fff", fontSize: 13, cursor: "pointer", color: "#666",
          }}>
            ← {step === 0 ? "Volver" : "Anterior"}
          </button>

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: "#111", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={submit} disabled={saving} style={{
              padding: "8px 24px", borderRadius: 8, border: "none",
              background: saving ? "#aaa" : "#1a7a4a", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Creando expediente…" : "Confirmar y crear expediente ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }
const subtitleStyle: React.CSSProperties = { fontSize: 13, color: "#999", marginBottom: 24 }
const fieldGroup: React.CSSProperties = { display: "flex", flexDirection: "column" }
const fieldLabel: React.CSSProperties = { fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }
const inputStyle: React.CSSProperties = {
  width: "100%", height: 36, fontSize: 13, padding: "0 12px",
  borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff",
  color: "#111", fontFamily: "Inter, sans-serif", outline: "none",
}
