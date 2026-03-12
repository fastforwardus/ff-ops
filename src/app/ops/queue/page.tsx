"use client"
import { useEffect, useState } from "react"
import SidebarWrapper from "@/components/SidebarWrapper"
import { useSession } from "next-auth/react"

type Submission = {
  id: string; status: string; urgency: string; createdAt: string
  serviceLabel: string; clientName: string; clientEmail: string
  vendorName: string; fdaRegNumber: string | null; internalNotes: string | null
  etaStep2: string | null; etaStep3: string | null; etaStep4: string | null
  assignedToId: string | null; assignedToName: string | null
}
type OpsUser = { id: string; name: string }

const STATUS_LABEL: Record<string, string> = {
  waiting_duns:"Esperando DUNS", pending_review:"Pendiente revisión",
  under_review:"En revisión", ready_to_submit:"Listo para submitir",
  submitted:"Submitted", confirmed:"Confirmado", problem:"Hay un problema",
}
const STATUS_COLOR: Record<string, { bg:string; color:string }> = {
  waiting_duns:   {bg:"#f0f0ff",color:"#5555cc"},
  pending_review: {bg:"#fff8ec",color:"#c8900a"},
  under_review:   {bg:"#e8f4ff",color:"#1a5fa0"},
  ready_to_submit:{bg:"#f0fff4",color:"#1a7a4a"},
  submitted:      {bg:"#edfaf3",color:"#1a7a4a"},
  confirmed:      {bg:"#edfaf3",color:"#1a7a4a"},
  problem:        {bg:"#fff0f0",color:"#cc2020"},
}
const URGENCY_COLOR: Record<string, string> = { critical:"#cc2020", high:"#c8900a", normal:"#ccc" }

export default function QueuePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const myId = (session?.user as any)?.id

  const [items,      setItems]      = useState<Submission[]>([])
  const [opsUsers,   setOpsUsers]   = useState<OpsUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [updates,    setUpdates]    = useState<Record<string, any>>({})
  const [saving,     setSaving]     = useState<string | null>(null)
  const [msgOpen,    setMsgOpen]    = useState<string | null>(null)
  const [msgLang,    setMsgLang]    = useState<"es"|"en">("es")
  const [msgBody,    setMsgBody]    = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [msgSent,    setMsgSent]    = useState<string | null>(null)

  useEffect(() => { fetchQueue(); fetchOpsUsers() }, [role])

  async function fetchQueue() {
    setLoading(true)
    const res = await fetch("/api/ops/queue")
    setItems(await res.json())
    setLoading(false)
  }
  async function fetchOpsUsers() {
    const res = await fetch("/api/admin/team")
    const all = await res.json()
    setOpsUsers(all.filter((u: any) => u.role === "ops" || u.role === "admin"))
  }

  function setUpdate(id: string, field: string, value: any) {
    setUpdates(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }
  function getVal(item: Submission, field: string) {
    return updates[item.id]?.[field] !== undefined ? updates[item.id][field] : (item as any)[field]
  }

  async function save(id: string) {
    setSaving(id)
    await fetch("/api/ops/queue", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id, ...updates[id] }) })
    setSaving(null)
    setUpdates(prev => { const n = {...prev}; delete n[id]; return n })
    fetchQueue()
  }

  async function sendMessage(submissionId: string) {
    setSendingMsg(true)
    await fetch("/api/ops/message", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ submissionId, body:msgBody, lang:msgLang }) })
    setSendingMsg(false)
    setMsgOpen(null)
    setMsgBody("")
    setMsgSent(submissionId)
    setTimeout(() => setMsgSent(null), 4000)
  }

  const urgencyOrder = { critical:0, high:1, normal:2 }
  const sorted = [...items].sort((a,b) => (urgencyOrder[a.urgency as keyof typeof urgencyOrder]??2) - (urgencyOrder[b.urgency as keyof typeof urgencyOrder]??2))
  const isAdmin = role === "admin"

  const inp: React.CSSProperties = { height:32, fontSize:13, padding:"0 10px", borderRadius:7, border:"1px solid var(--input-border)", background:"var(--input-bg)", color:"var(--text-primary)", fontFamily:"Inter,sans-serif", outline:"none" }

  return (
    <SidebarWrapper role={role ?? "ops"} userName={(session?.user as any)?.name ?? ""}>
      <div style={{ padding:"32px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4, color:"var(--text-primary)" }}>
              {isAdmin ? "Cola de trabajo" : "Mis trámites asignados"}
            </div>
            <div style={{ fontSize:13, color:"var(--text-second)" }}>
              {items.length} trámite{items.length!==1?"s":""} {isAdmin ? "activos" : "asignados a vos"}
            </div>
          </div>
          <button onClick={fetchQueue} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:12, cursor:"pointer", color:"var(--text-second)" }}>↺ Actualizar</button>
        </div>

        {loading && <div style={{ fontSize:13, color:"var(--text-third)", padding:20 }}>Cargando…</div>}

        {!loading && sorted.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-third)", fontSize:14 }}>
            {isAdmin ? "No hay trámites activos 🎉" : "No tenés trámites asignados."}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sorted.map(item => {
            const isExpanded = expanded === item.id
            const hasChanges = !!updates[item.id]
            const urgColor   = URGENCY_COLOR[item.urgency] ?? "#ccc"
            const statusStyle = STATUS_COLOR[item.status] ?? {bg:"var(--bg-subtle)",color:"var(--text-second)"}
            const unassigned  = !item.assignedToId

            return (
              <div key={item.id} style={{
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:12, overflow:"hidden",
                borderLeft:`3px solid ${unassigned && isAdmin ? "#c8900a" : urgColor}`,
                opacity: !isAdmin && item.assignedToId !== myId ? 0.5 : 1,
              }}>
                {/* Row */}
                <div onClick={() => setExpanded(isExpanded ? null : item.id)}
                  style={{ display:"grid", gridTemplateColumns: isAdmin ? "2fr 2fr 1fr 130px 110px 130px 36px" : "2fr 2fr 1fr 130px 110px 36px", alignItems:"center", padding:"14px 18px", cursor:"pointer", gap:12 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:2 }}>{item.clientName}</div>
                    <div style={{ fontSize:12, color:"var(--text-third)" }}>{item.clientEmail}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, color:"var(--text-second)" }}>{item.serviceLabel}</div>
                    <div style={{ fontSize:11, color:"var(--text-third)", marginTop:2 }}>via {item.vendorName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize:11, fontWeight:500, padding:"3px 9px", borderRadius:20, background:statusStyle.bg, color:statusStyle.color }}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
                      background:item.urgency==="critical"?"#fff0f0":item.urgency==="high"?"#fff8ec":"var(--bg-subtle)", color:urgColor }}>
                      {item.urgency==="critical"?"⚡ Crítico":item.urgency==="high"?"↑ Alto":"Normal"}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text-third)" }}>
                    {new Date(item.createdAt).toLocaleDateString("es-AR",{day:"numeric",month:"short"})}
                  </div>
                  {/* Assignment col — admin only */}
                  {isAdmin && (
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={getVal(item,"assignedToId") ?? ""}
                        onChange={async e => {
                          const val = e.target.value || null
                          await fetch("/api/ops/queue", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id:item.id, assignedToId:val }) })
                          fetchQueue()
                        }}
                        style={{ ...inp, width:"100%", fontSize:12,
                          background: !item.assignedToId ? "#fff8ec" : "var(--input-bg)",
                          color: !item.assignedToId ? "#c8900a" : "var(--text-primary)",
                          borderColor: !item.assignedToId ? "#f5d88a" : "var(--input-border)",
                        }}>
                        <option value="">Sin asignar</option>
                        {opsUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ fontSize:16, color:"var(--text-third)", textAlign:"center", userSelect:"none" }}>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop:"1px solid var(--border)", padding:"18px 18px 20px", background:"var(--bg-subtle)" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>ESTADO</div>
                        <select value={getVal(item,"status")} onChange={e => setUpdate(item.id,"status",e.target.value)} style={{...inp,width:"100%"}}>
                          {Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>URGENCIA</div>
                        <select value={getVal(item,"urgency")} onChange={e => setUpdate(item.id,"urgency",e.target.value)} style={{...inp,width:"100%"}}>
                          <option value="normal">Normal</option>
                          <option value="high">Alto</option>
                          <option value="critical">Crítico</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>N° REGISTRO FDA</div>
                        <input value={getVal(item,"fdaRegNumber")??""}
                          onChange={e => setUpdate(item.id,"fdaRegNumber",e.target.value)}
                          placeholder="12345678" style={{...inp,width:"100%"}} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>ETA REVISIÓN</div>
                        <input value={getVal(item,"etaStep2")??""}
                          onChange={e => setUpdate(item.id,"etaStep2",e.target.value)}
                          placeholder="1–2 días hábiles" style={{...inp,width:"100%"}} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>ETA SUBMISSION</div>
                        <input value={getVal(item,"etaStep3")??""}
                          onChange={e => setUpdate(item.id,"etaStep3",e.target.value)}
                          placeholder="3–5 días hábiles" style={{...inp,width:"100%"}} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>ETA CONFIRMACIÓN</div>
                        <input value={getVal(item,"etaStep4")??""}
                          onChange={e => setUpdate(item.id,"etaStep4",e.target.value)}
                          placeholder="7–10 días hábiles" style={{...inp,width:"100%"}} />
                      </div>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:5, fontWeight:500 }}>NOTAS INTERNAS</div>
                      <textarea value={getVal(item,"internalNotes")??""}
                        onChange={e => setUpdate(item.id,"internalNotes",e.target.value)}
                        rows={2} placeholder="Notas para el equipo..."
                        style={{...inp,width:"100%",height:"auto",padding:"8px 10px",resize:"vertical"}} />
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      {hasChanges && (
                        <button onClick={() => save(item.id)} disabled={saving===item.id} style={{
                          padding:"7px 16px", borderRadius:8, border:"none",
                          background:"var(--text-primary)", color:"var(--bg)",
                          fontSize:13, fontWeight:500, cursor:"pointer",
                          opacity:saving===item.id?0.6:1,
                        }}>{saving===item.id?"Guardando…":"Guardar cambios"}</button>
                      )}
                      <button onClick={e => { e.stopPropagation(); setMsgOpen(item.id); setMsgBody(""); setMsgLang("es") }}
                        style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>
                        ✉ Pedir información al cliente
                      </button>
                      {msgSent === item.id && <span style={{ fontSize:12, color:"#1a7a4a" }}>✓ Mensaje enviado</span>}
                      {!hasChanges && !msgSent && <div style={{ fontSize:12, color:"var(--text-third)" }}>Sin cambios pendientes</div>}
                    </div>

                    {msgOpen === item.id && (
                      <div style={{ marginTop:16, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>Mensaje al cliente</div>
                          <div style={{ display:"flex", gap:4 }}>
                            {(["es","en"] as const).map(l => (
                              <button key={l} onClick={() => setMsgLang(l)} style={{
                                padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)",
                                background:msgLang===l?"var(--text-primary)":"transparent",
                                color:msgLang===l?"var(--bg)":"var(--text-second)",
                                fontSize:12, fontWeight:500, cursor:"pointer",
                              }}>{l.toUpperCase()}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-third)", marginBottom:6 }}>
                          El email le llegará al cliente en <strong>{msgLang==="es"?"español":"inglés"}</strong>
                        </div>
                        <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={4}
                          placeholder={msgLang==="es"?"Hola, necesitamos que nos envíes...":"Hi, we need you to send us..."}
                          style={{...inp,width:"100%",height:"auto",padding:"10px 12px",resize:"vertical",marginBottom:10}} />
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => sendMessage(item.id)} disabled={!msgBody||sendingMsg} style={{
                            padding:"7px 16px", borderRadius:8, border:"none",
                            background:"#1a5fa0", color:"#fff",
                            fontSize:13, fontWeight:500, cursor:"pointer",
                            opacity:(!msgBody||sendingMsg)?0.5:1,
                          }}>{sendingMsg?"Enviando…":"Enviar mensaje"}</button>
                          <button onClick={() => setMsgOpen(null)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>Cancelar</button>
                        </div>
                      </div>
                    )}
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
