import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { submissions, clients, users, services } from "@/lib/db/schema"
import { eq, ne } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { sendAssignmentEmail } from "@/lib/email"
import { createNotification } from "@/lib/notify"

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const myId = (session?.user as any)?.id
  if (!session || !["admin","ops"].includes(role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select({
      id:            submissions.id,
      status:        submissions.status,
      urgency:       submissions.urgency,
      createdAt:     submissions.createdAt,
      fdaRegNumber:  submissions.fdaRegNumber,
      internalNotes: submissions.internalNotes,
      etaStep2:      submissions.etaStep2,
      etaStep3:      submissions.etaStep3,
      etaStep4:      submissions.etaStep4,
      assignedToId:  submissions.assignedToId,
      serviceLabel:  services.labelEs,
      clientName:    clients.companyName,
      clientEmail:   clients.ownerEmail,
      dunsStatus:    clients.dunsStatus,
      vendorId:      clients.vendorId,
    })
    .from(submissions)
    .innerJoin(clients,  eq(submissions.clientId,  clients.id))
    .innerJoin(services, eq(submissions.serviceId, services.id))
    .where(ne(submissions.status, "confirmed"))

  const allUsers = await db.select({ id: users.id, name: users.name }).from(users)
  const userMap  = Object.fromEntries(allUsers.map(u => [u.id, u.name]))

  const result = rows.map(r => ({
    ...r,
    vendorName:     userMap[r.vendorId] ?? "—",
    assignedToName: r.assignedToId ? (userMap[r.assignedToId] ?? "—") : null,
  }))

  if (role === "ops") return NextResponse.json(result.filter(r => r.assignedToId === myId))
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session || !["admin","ops"].includes(role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, ...fields } = await req.json()

  if (fields.assignedToId !== undefined && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (fields.assignedToId) {
    try {
      const [sub]      = await db.select().from(submissions).where(eq(submissions.id, id))
      const [client]   = await db.select().from(clients).where(eq(clients.id, sub.clientId))
      const [svc]      = await db.select().from(services).where(eq(services.id, sub.serviceId))
      const [assignee] = await db.select().from(users).where(eq(users.id, fields.assignedToId))
      const urgencyLabel = sub.urgency === "critical" ? "⚡ Crítico" : sub.urgency === "high" ? "↑ Alto" : "Normal"

      if (assignee?.email) {
        await sendAssignmentEmail({
          toEmail:      assignee.email,
          toName:       assignee.name ?? "",
          clientName:   client.companyName,
          serviceLabel: svc.labelEs,
          urgency:      sub.urgency,
          submissionId: id,
        })
      }

      await createNotification({
        userId: fields.assignedToId,
        type:   "assignment",
        title:  `Nuevo trámite asignado — ${client.companyName}`,
        body:   `${svc.labelEs} · ${urgencyLabel}`,
        link:   "/ops/queue",
      })
    } catch (e) {
      console.error("[notify] assignment failed:", e)
    }
  }

  await db.update(submissions).set(fields as any).where(eq(submissions.id, id))
  return NextResponse.json({ ok: true })
}
