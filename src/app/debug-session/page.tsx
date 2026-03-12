export default async function DebugSession() {
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <div id="out">Cargando...</div>
      <script dangerouslySetInnerHTML={{ __html: `
        fetch('/api/auth/session')
          .then(r => r.json())
          .then(d => document.getElementById('out').innerText = JSON.stringify(d, null, 2))
      `}} />
    </div>
  )
}
