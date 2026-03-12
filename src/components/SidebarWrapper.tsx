"use client"
import Sidebar from "./Sidebar"

export default function SidebarWrapper({
  role, userName, children
}: {
  role: string; userName: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar role={role} userName={userName} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
