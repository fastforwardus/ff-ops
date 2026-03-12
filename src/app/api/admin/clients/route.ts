import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients, submissions, services, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const allClients = await db.select().from(clients).orderBy(clients.createdAt)
  const allUsers   = await db.select({ id:users.id, name:users.name }).from(users)
  const userMap    = Object.fromEntries(allUsers.map(u => [u.id, u.name]))

  const result = await Promise.all(allClients.map(async client => {
    const subs = await db
      .select({ id:submissions.id, status:submissions.status, urgency:submissions.urgency, assignedToId:submissions.assignedToId, serviceLabel:services.labelEs })
      .from(submissions)
      .innerJoin(services, eq(submissions.serviceId, services.id))
      .where(eq(submissions.clientId, client.id))

    return {
      id:          client.id,
      companyName: client.companyName,
      country:     client.country,
      ownerEmail:  client.ownerEmail,
      phone:       client.phone,
      dunsStatus:  client.dunsStatus,
      createdAt:   client.createdAt,
      vendorName:  userMap[client.vendorId] ?? "—",
      submissions: subs.map(s => ({
        ...s,
        assignedToName: s.assignedToId ? (userMap[s.assignedToId] ?? null) : null,
      })),
    }
  }))

  return NextResponse.json(result)
}
