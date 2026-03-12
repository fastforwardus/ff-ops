"use client"
import { useEffect, useState } from "react"
import SidebarWrapper from "@/components/SidebarWrapper"

type User = { id:string; name:string; email:string; role:string; createdAt:string }
const ROLE_LABELS: Record<string,string> = { admin:"Admin", vendor:"Vendedor", ops:"Operaciones" }
const ROLE_COLORS: Record<string,{bg:string;color:string}> = {
  admin:{bg:"#f0f0ff",color:"#5555cc"}, vendor:{bg:"#edfaf3",color:"#1a7a4a"}, ops:{bg:"#fff8ec",color:"#c8900a"}
}

export default function TeamPage() {
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form,    setForm]    = useState({ name:"", email:"", role:"vendor" })
  const [saving,  setSaving]  = useState(false)
  const [created, setCreated] = useState<{email:string;tempPassword:string}|null>(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch("/api/admin/team")
    setUsers(await res.json())
    setLoading(false)
  }

  async function createUser() {
    if (!form.name || !form.email) return
    setSaving(true)
    const res = await fetch("/api/admin/team", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (data.tempPassword) { setCreated({ email:form.email, tempPassword:data.tempPassword }); setForm({ name:"", email:"", role:"vendor" }); setShowNew(false); fetchUsers() }
  }

  const inp: React.CSSProperties = { width:"100%", height:34, fontSize:13, padding:"0 10px", borderRadius:7, border:"1px solid var(--input-border)", background:"var(--input-bg)", color:"var(--text-primary)", fontFamily:"Inter,sans-serif", outline:"none" }

  return (
    <SidebarWrapper role="admin" userName="Admin">
      <div style={{ padding:"32px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4, color:"var(--text-primary)" }}>Equipo</div>
            <div style={{ fontSize:13, color:"var(--text-second)" }}>Creá y gestioná los usuarios internos del sistema.</div>
          </div>
          <button onClick={() => { setShowNew(true); setCreated(null) }} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"var(--text-primary)", color:"var(--bg)", fontSize:13, fontWeight:500, cursor:"pointer" }}>
            + Nuevo usuario
          </button>
        </div>

        {created && (
          <div style={{ background:"#edfaf3", border:"1px solid #a8e6c3", borderRadius:12, padding:20, marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#1a7a4a", marginBottom:8 }}>✓ Usuario creado</div>
            <div style={{ fontSize:13, color:"#1a7a4a", marginBottom:12 }}>Mandá estas credenciales al usuario para que pueda entrar por primera vez.</div>
            <div style={{ background:"#fff", borderRadius:8, padding:"12px 16px", fontFamily:"monospace", fontSize:13, border:"1px solid #c3e6d0" }}>
              <div>Email:      <strong>{created.email}</strong></div>
              <div>Contraseña: <strong>{created.tempPassword}</strong></div>
            </div>
            <div style={{ fontSize:12, color:"#888", marginTop:10 }}>⚠ Guardá esta contraseña ahora — no se puede recuperar después.</div>
            <button onClick={() => setCreated(null)} style={{ marginTop:12, padding:"5px 12px", borderRadius:6, border:"1px solid #c3e6d0", background:"transparent", fontSize:12, cursor:"pointer", color:"#1a7a4a" }}>Entendido, ya la guardé</button>
          </div>
        )}

        {showNew && (
          <div style={{ background:"var(--bg-card)", border:"1.5px solid var(--text-primary)", borderRadius:12, padding:20, marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"var(--text-primary)" }}>Nuevo usuario</div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr", gap:12, marginBottom:16 }}>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Nombre completo</div><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="María García" style={inp}/></div>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Email</div><input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="maria@fastfwdus.com" style={inp}/></div>
              <div><div style={{ fontSize:11, color:"var(--text-third)", marginBottom:4 }}>Rol</div>
                <select value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))} style={inp}>
                  <option value="vendor">Vendedor</option>
                  <option value="ops">Operaciones</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ fontSize:12, color:"var(--text-third)", marginBottom:16, background:"var(--bg-subtle)", borderRadius:8, padding:"10px 12px" }}>
              💡 El sistema genera una contraseña temporal. Copiala y mandásela al usuario.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={createUser} disabled={saving} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"var(--text-primary)", color:"var(--bg)", fontSize:13, fontWeight:500, cursor:"pointer", opacity:saving?0.6:1 }}>{saving?"Creando…":"Crear usuario"}</button>
              <button onClick={() => setShowNew(false)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", fontSize:13, cursor:"pointer", color:"var(--text-second)" }}>Cancelar</button>
            </div>
          </div>
        )}

        {loading && <div style={{ fontSize:13, color:"var(--text-third)", padding:20 }}>Cargando…</div>}
        {!loading && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 120px 140px", padding:"8px 20px", borderBottom:"1px solid var(--border)", fontSize:11, color:"var(--text-third)", fontWeight:500, letterSpacing:"0.04em" }}>
              <div>NOMBRE</div><div>EMAIL</div><div>ROL</div><div>CREADO</div>
            </div>
            {users.filter(u => u.role !== "client").map((user,i) => {
              const roleStyle = ROLE_COLORS[user.role] ?? { bg:"var(--bg-subtle)", color:"var(--text-third)" }
              return (
                <div key={user.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 120px 140px", alignItems:"center", padding:"12px 20px", borderBottom:i<users.length-1?"1px solid var(--border)":"none" }}>
                  <div style={{ fontSize:14, fontWeight:500, color:"var(--text-primary)" }}>{user.name}</div>
                  <div style={{ fontSize:13, color:"var(--text-second)" }}>{user.email}</div>
                  <div><span style={{ fontSize:11, fontWeight:500, padding:"3px 9px", borderRadius:20, background:roleStyle.bg, color:roleStyle.color }}>{ROLE_LABELS[user.role] ?? user.role}</span></div>
                  <div style={{ fontSize:12, color:"var(--text-third)" }}>{new Date(user.createdAt).toLocaleDateString("es-AR",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SidebarWrapper>
  )
}
