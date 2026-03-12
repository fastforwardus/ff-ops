"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SidebarWrapper from "@/components/SidebarWrapper"
import { useSession } from "next-auth/react"

const STEPS = ["Servicios", "DUNS", "Empresa", "Responsable", "Confirmar"]

type Form = {
  selectedServices: string[]
  dunsStatus: string; dunsNumber: string; companyName: string; tradeNames: string
  country: string; address: string; state: string; postalCode: string
  phone: string; emergencyPhone: string; ownerEmail: string
  parentCompanyName: string; parentCompanyCountry: string
}

const INIT: Form = {
  selectedServices: [], dunsStatus: "", dunsNumber: "", companyName: "", tradeNames: "",
  country: "", address: "", state: "", postalCode: "", phone: "", emergencyPhone: "",
  ownerEmail: "", parentCompanyName: "", parentCompanyCountry: "",
}

function validate(step: number, form: Form): string[] {
  const errors: string[] = []
  if (step === 0 && form.selectedServices.length === 0) errors.push("Seleccioná al menos un servicio.")
  if (step === 1 && !form.dunsStatus) errors.push("Indicá el estado del DUNS.")
  if (step === 2) {
    if (!form.companyName) errors.push("Nombre de empresa requerido.")
    if (!form.country)     errors.push("País requerido.")
    if (!form.address)     errors.push("Dirección requerida.")
    if (!form.phone)       errors.push("Teléfono requerido.")
  }
  if (step === 3) {
    if (!form.ownerEmail) errors.push("Email del responsable requerido.")
    if (form.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) errors.push("Email inválido.")
  }
  return errors
}

const inp: React.CSSProperties = { width:"100%", height:38, fontSize:13, padding:"0 12px", borderRadius:8, border:"1px solid var(--input-border)", background:"var(--input-bg)", color:"var(--text-primary)", fontFamily:"Inter,sans-serif", outline:"none" }
const lbl: React.CSSProperties = { fontSize:12, color:"var(--text-third)", fontWeight:500, marginBottom:5, display:"block" }

export default function NewClientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step,     setStep]     = useState(0)
  const [form,     setForm]     = useState<Form>(INIT)
  const [services, setServices] = useState<any[]>([])
  const [errors,   setErrors]   = useState<string[]>([])
  const [saving,   setSaving]   = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [serverError, setServerError] = useState("")

  if (!loaded) {
    setLoaded(true)
    fetch("/api/admin/services").then(r => r.json()).then(setServices)
  }

  function set(field: keyof Form, value: any) { setForm(prev => ({ ...prev, [field]: value })); setErrors([]) }

  function toggleService(id: string) {
    setForm(prev => ({ ...prev, selectedServices: prev.selectedServices.includes(id) ? prev.selectedServices.filter(s => s !== id) : [...prev.selectedServices, id] }))
    setErrors([])
  }

  function next() {
    const errs = validate(step, form)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setStep(s => s + 1)
  }

  async function submit() {
    setSaving(true)
    setServerError("")
    try {
      const res = await fetch("/api/vendor/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { setServerError("Respuesta inválida: " + text.slice(0, 200)); setSaving(false); return }
      if (data.ok) router.push("/vendor/clients")
      else setServerError("Error del servidor: " + (data.error ?? JSON.stringify(data)))
    } catch(e: any) {
      setServerError("Error de red: " + e.message)
    }
    setSaving(false)
  }

  const role = (session?.user as any)?.role ?? "vendor"
  const CATEGORIES: Record<string,string> = { food:"Alimentos", alcohol:"Bebidas alcohólicas", cosmetics:"Cosméticos", pharma:"Farmacéuticos", devices:"Dispositivos médicos", usda:"USDA/NOAA", business:"Empresa", recurring:"Recurrentes" }
  const grouped = services.filter(s => s.active).reduce((acc:any, s:any) => { if (!acc[s.category]) acc[s.category]=[]; acc[s.category].push(s); return acc }, {})
  const selectedSvcs = services.filter(s => form.selectedServices.includes(s.id))
  const total = selectedSvcs.reduce((sum, s) => sum + (s.priceUsd ?? 0), 0)

  return (
    <SidebarWrapper role={role} userName={(session?.user as any)?.name ?? ""}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.03em", color:"var(--text-primary)", marginBottom:4 }}>Nuevo cliente</div>
          <div style={{ fontSize:13, color:"var(--text-second)" }}>Paso {step+1} de {STEPS.length} — {STEPS[step]}</div>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:28 }}>
          {STEPS.map((_,i) => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=step?"var(--text-primary)":"var(--border)" }} />)}
        </div>

        {errors.length > 0 && (
          <div style={{ background:"#fff0f0", border:"1px solid #fcc", borderRadius:8, padding:"10px 14px", marginBottom:20 }}>
            {errors.map((e,i) => <div key={i} style={{ fontSize:13, color:"#cc2020" }}>• {e}</div>)}
          </div>
        )}

        {/* Error del servidor visible en pantalla */}
        {serverError && (
          <div style={{ background:"#fff0f0", border:"2px solid #cc2020", borderRadius:8, padding:"12px 14px", marginBottom:20, fontFamily:"monospace", fontSize:12, color:"#cc2020", wordBreak:"break-all" }}>
            {serverError}
          </div>
        )}

        {step === 0 && (
          <div>
            {Object.entries(grouped).map(([cat, svcs]:any) => (
              <div key={cat} style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-third)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{CATEGORIES[cat]??cat}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {svcs.map((svc:any) => {
                    const sel = form.selectedServices.includes(svc.id)
                    return (
                      <div key={svc.id} onClick={() => toggleService(svc.id)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1px solid ${sel?"var(--text-primary)":"var(--border)"}`, background:sel?"var(--bg-subtle)":"var(--bg-card)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${sel?"var(--text-primary)":"var(--border)"}`, background:sel?"var(--text-primary)":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {sel && <span style={{ color:"var(--bg)", fontSize:11, fontWeight:700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize:13, color:"var(--text-primary)", fontWeight:sel?500:400 }}>{svc.labelEs}</span>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--text-second)", fontFamily:"monospace" }}>${svc.priceUsd?.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {form.selectedServices.length > 0 && (
              <div style={{ position:"sticky", bottom:0, background:"var(--bg)", borderTop:"1px solid var(--border)", padding:"14px 0" }}>
                <div style={{ fontSize:13, color:"var(--text-second)" }}>{form.selectedServices.length} servicio(s) · <strong>${total.toLocaleString()} USD</strong> est.</div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={lbl}>Estado DUNS <span style={{ color:"#cc2020" }}>*</span></label>
              <select value={form.dunsStatus} onChange={e => set("dunsStatus", e.target.value)} style={inp}>
                <option value="">Seleccioná...</option>
                <option value="has">Tiene DUNS</option>
                <option value="requested">Lo está tramitando</option>
                <option value="needed">Necesita tramitarlo</option>
                <option value="exempt">Exento</option>
              </select>
            </div>
            {form.dunsStatus === "has" && (
              <div>
                <label style={lbl}>Número DUNS</label>
                <input value={form.dunsNumber} onChange={e => set("dunsNumber", e.target.value)} placeholder="123456789" style={inp} />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>Nombre de empresa <span style={{ color:"#cc2020" }}>*</span></label><input value={form.companyName} onChange={e => set("companyName",e.target.value)} placeholder="Empresa S.A." style={inp}/></div>
            <div><label style={lbl}>Nombres comerciales</label><input value={form.tradeNames} onChange={e => set("tradeNames",e.target.value)} placeholder="Marca 1, Marca 2..." style={inp}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><label style={lbl}>País <span style={{ color:"#cc2020" }}>*</span></label><input value={form.country} onChange={e => set("country",e.target.value)} placeholder="Argentina" style={inp}/></div>
              <div><label style={lbl}>Estado / Provincia</label><input value={form.state} onChange={e => set("state",e.target.value)} placeholder="Buenos Aires" style={inp}/></div>
            </div>
            <div><label style={lbl}>Dirección <span style={{ color:"#cc2020" }}>*</span></label><input value={form.address} onChange={e => set("address",e.target.value)} placeholder="Av. Ejemplo 1234" style={inp}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><label style={lbl}>Código postal</label><input value={form.postalCode} onChange={e => set("postalCode",e.target.value)} placeholder="1234" style={inp}/></div>
              <div><label style={lbl}>Teléfono <span style={{ color:"#cc2020" }}>*</span></label><input value={form.phone} onChange={e => set("phone",e.target.value)} placeholder="+54 11 1234 5678" style={inp}/></div>
            </div>
            <div><label style={lbl}>Teléfono de emergencia</label><input value={form.emergencyPhone} onChange={e => set("emergencyPhone",e.target.value)} placeholder="+54 9 8765 4321" style={inp}/></div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={lbl}>Email del responsable <span style={{ color:"#cc2020" }}>*</span></label>
              <input type="email" value={form.ownerEmail} onChange={e => set("ownerEmail",e.target.value)} placeholder="owner@empresa.com" style={inp}/>
              <div style={{ fontSize:11, color:"var(--text-third)", marginTop:5 }}>Este email se usa para el portal del cliente.</div>
            </div>
            <div><label style={lbl}>Empresa matriz</label><input value={form.parentCompanyName} onChange={e => set("parentCompanyName",e.target.value)} placeholder="Nombre empresa matriz" style={inp}/></div>
            <div><label style={lbl}>País empresa matriz</label><input value={form.parentCompanyCountry} onChange={e => set("parentCompanyCountry",e.target.value)} placeholder="USA" style={inp}/></div>
          </div>
        )}

        {step === 4 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:14 }}>Resumen</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, fontSize:13 }}>
              {[["Empresa",form.companyName],["País",form.country],["Email responsable",form.ownerEmail],["DUNS",{has:"Tiene DUNS",requested:"En trámite",needed:"Necesita tramitar",exempt:"Exento"}[form.dunsStatus]??form.dunsStatus]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"var(--text-third)" }}>{k}</span>
                  <span style={{ fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:10, marginTop:4 }}>
                <div style={{ color:"var(--text-third)", marginBottom:8 }}>Servicios</div>
                {selectedSvcs.map(s => (
                  <div key={s.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span>{s.labelEs}</span>
                    <span style={{ fontFamily:"monospace", fontWeight:500 }}>${s.priceUsd?.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, borderTop:"1px solid var(--border)", paddingTop:8, marginTop:4 }}>
                  <span>Total estimado</span>
                  <span style={{ fontFamily:"monospace" }}>${total.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, paddingTop:20, borderTop:"1px solid var(--border)" }}>
          <button onClick={() => step===0 ? router.push("/vendor/clients") : setStep(s=>s-1)}
            style={{ padding:"9px 18px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>
            {step===0?"Cancelar":"← Atrás"}
          </button>
          {step < 4 ? (
            <button onClick={next} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:"var(--text-primary)", color:"var(--bg)", fontSize:13, fontWeight:500, cursor:"pointer" }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={submit} disabled={saving} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:"#1a7a4a", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", opacity:saving?0.6:1 }}>
              {saving?"Creando…":"Crear cliente ✓"}
            </button>
          )}
        </div>
      </div>
    </SidebarWrapper>
  )
}
