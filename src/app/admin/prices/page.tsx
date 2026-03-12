"use client"
import { useEffect, useState } from "react"
import SidebarWrapper from "@/components/SidebarWrapper"

const CATEGORIES: Record<string, string> = {
  food:"Alimentos y bebidas", alcohol:"Bebidas alcohólicas", cosmetics:"Cosméticos",
  pharma:"Farmacéuticos", devices:"Dispositivos médicos", usda:"USDA / NOAA / USFWS",
  business:"Empresa y marca", recurring:"Servicios recurrentes",
}

type Service = { id:string; key:string; labelEs:string; labelEn:string; priceUsd:number; category:string; active:boolean; sortOrder:number }

export default function PricesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [edits,    setEdits]    = useState<Record<string,Partial<Service>>>({})
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [showNew,  setShowNew]  = useState(false)
  const [newSvc,   setNewSvc]   = useState({ labelEs:"", labelEn:"", priceUsd:"", category:"food" })

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    setLoading(true)
    const res = await fetch("/api/admin/services")
    setServices(await res.json())
    setLoading(false)
  }

  function edit(id:string, field:keyof Service, value:any) {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    setSaved(false)
  }

  function getValue(svc:Service, field:keyof Service) {
    return edits[svc.id]?.[field] !== undefined ? edits[svc.id][field] : svc[field]
  }

  const hasChanges = Object.keys(edits).length > 0

  async function saveAll() {
    setSaving(true)
    await fetch("/api/admin/services", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ edits }) })
    setSaving(false); setSaved(true); setEdits({})
    fetchServices()
  }

  async function toggleActive(svc:Service) {
    await fetch("/api/admin/services", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ edits:{ [svc.id]:{ active:!svc.active } } }) })
    fetchServices()
  }

  async function addService() {
    if (!newSvc.labelEs || !newSvc.priceUsd) return
    await fetch("/api/admin/services", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newSvc) })
    setNewSvc({ labelEs:"", labelEn:"", priceUsd:"", category:"food" })
    setShowNew(false); fetchServices()
  }

  const grouped = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = []
    acc[svc.category].push(svc)
    return acc
  }, {} as Record<string,Service[]>)

  const inp: React.CSSProperties = { width:"100%", height:34, fontSize:13, padding:"0 10px", borderRadius:7, border:"1px solid var(--input-border)", background:"var(--input-bg)", color:"var(--text-primary)", fontFamily:"Inter,sans-serif", outline:"none" }
  const inl: React.CSSProperties = { width:"95%", height:30, fontSize:13, padding:"0 8px", borderRadius:6, border:"1px solid transparent", background:"transparent", color:"var(--text-primary)", fontFamily:"Inter,sans-serif", outline:"none" }

  return (
    <SidebarWrapper role="admin" userName="Admin">
      <div style={{ padding:"32px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4, color:"var(--text-primary)" }}>Precios</div>
            <div style={{ fontSize:13, color:"var(--text-second)" }}>Editá cualquier precio directamente. Los cambios quedan guardados con historial.</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {hasChanges && <>
              <div style={{ fontSize:12, color:"#c8900a", background:"#fff8ec", border:"1px solid #f5d88a", borderRadius:6, padding:"5px 10px" }}>Cambios sin guardar</div>
              <button onClick={() => { setEdits({}); setSaved(false) }} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>Descartar</button>
              <button onClick={saveAll} disabled={saving} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"var(--text-primary)", color:"var(--bg)", fontSize:13, fontWeight:500, cursor:"pointer", opacity:saving?0.6:1 }}>{saving?"Guardando…":"Guardar todo"}</button>
            </>}
            {saved && !hasChanges && <div style={{ fontSize:12, color:"#1a7a4a", background:"#edfaf3", border:"1px solid #a8e6c3", borderRadius:6, padding:"5px 10px" }}>✓ Guardado</div>}
            <button onClick={() => setShowNew(true)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:13, cursor:"pointer", color:"var(--text-primary)", fontWeight:500 }}>+ Agregar servicio</button>
          </div>
        </div>

        {showNew && (
          <div style={{ background:"var(--bg-card)", border:"1.5px solid var(--text-primary)", borderRadius:12, padding:20, marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"var(--text-primary)" }}>Nuevo servicio</div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr", gap:12, marginBottom:16 }}>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Nombre en español</div><input value={newSvc.labelEs} onChange={e => setNewSvc(p=>({...p,labelEs:e.target.value}))} placeholder="Registro FDA..." style={inp}/></div>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Nombre en inglés</div><input value={newSvc.labelEn} onChange={e => setNewSvc(p=>({...p,labelEn:e.target.value}))} placeholder="FDA Registration..." style={inp}/></div>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Precio (USD)</div><input type="number" value={newSvc.priceUsd} onChange={e => setNewSvc(p=>({...p,priceUsd:e.target.value}))} placeholder="0" style={inp}/></div>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Categoría</div>
                <select value={newSvc.category} onChange={e => setNewSvc(p=>({...p,category:e.target.value}))} style={inp}>
                  {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addService} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"var(--text-primary)", color:"var(--bg)", fontSize:13, fontWeight:500, cursor:"pointer" }}>Agregar</button>
              <button onClick={() => setShowNew(false)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>Cancelar</button>
            </div>
          </div>
        )}

        {loading && <div style={{ fontSize:13, color:"var(--text-third)", padding:20 }}>Cargando servicios…</div>}

        {!loading && Object.entries(grouped).map(([cat, svcs]) => (
          <div key={cat} style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--text-third)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>
              {CATEGORIES[cat] ?? cat}
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 140px 80px 100px", padding:"8px 16px", borderBottom:"1px solid var(--border)", fontSize:11, color:"var(--text-third)", fontWeight:500, letterSpacing:"0.04em" }}>
                <div>SERVICIO (ES)</div><div>SERVICIO (EN)</div><div>PRECIO USD</div><div>ESTADO</div><div></div>
              </div>
              {svcs.map((svc,i) => {
                const changed = !!edits[svc.id]
                const active = getValue(svc,"active") as boolean
                return (
                  <div key={svc.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 140px 80px 100px", alignItems:"center", padding:"10px 16px", borderBottom:i<svcs.length-1?"1px solid var(--border)":"none", background:changed?"#fffdf0":"transparent" }}>
                    <input value={getValue(svc,"labelEs") as string} onChange={e => edit(svc.id,"labelEs",e.target.value)} style={{...inl,fontWeight:500}}/>
                    <input value={getValue(svc,"labelEn") as string} onChange={e => edit(svc.id,"labelEn",e.target.value)} style={{...inl,color:"var(--text-second)"}}/>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ fontSize:13, color:"var(--text-third)" }}>$</span>
                      <input type="number" value={getValue(svc,"priceUsd") as number} onChange={e => edit(svc.id,"priceUsd",parseInt(e.target.value)||0)} style={{...inl,fontWeight:600,width:90,fontFamily:"monospace",fontSize:14}}/>
                    </div>
                    <div><span style={{ fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:20, background:active?"#edfaf3":"var(--bg-subtle)", color:active?"#1a7a4a":"var(--text-third)" }}>{active?"Activo":"Inactivo"}</span></div>
                    <div style={{ display:"flex", justifyContent:"flex-end" }}>
                      <button onClick={() => toggleActive(svc)} style={{ padding:"3px 8px", borderRadius:6, border:"1px solid var(--border)", background:"transparent", fontSize:11, cursor:"pointer", color:"var(--text-second)" }}>{active?"Desactivar":"Activar"}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </SidebarWrapper>
  )
}
