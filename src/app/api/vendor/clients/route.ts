import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients, submissions, services, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const myId = (session?.user as any)?.id
  if (!session || !["admin","vendor"].includes(role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const myClients = await db.select().from(clients)
    .where(role === "admin" ? undefined as any : eq(clients.vendorId, myId))
    .orderBy(clients.createdAt)

  const allUsers = await db.select({ id: users.id, name: users.name }).from(users)
  const userMap  = Object.fromEntries(allUsers.map(u => [u.id, u.name]))

  const result = await Promise.all(myClients.map(async client => {
    const subs = await db
      .select({
        id:           submissions.id,
        status:       submissions.status,
        urgency:      submissions.urgency,
        assignedToId: submissions.assignedToId,
        serviceLabel: services.labelEs,
      })
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
      submissions: subs.map(s => ({
        ...s,
        assignedToName: s.assignedToId ? (userMap[s.assignedToId] ?? null) : null,
      })),
    }
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const myId = (session?.user as any)?.id
  if (!session || !["admin","vendor"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { selectedServices, facilityData, ...clientData } = body

  const [client] = await db.insert(clients).values({
    ...clientData,
    vendorId: myId,
  }).returning()

  if (selectedServices?.length) {
    for (const serviceId of selectedServices) {
      await db.insert(submissions).values({
        clientId:  client.id,
        serviceId,
        status:    "pending_review",
        urgency:   "normal",
      })
    }
  }

  return NextResponse.json({ ok: true, clientId: client.id })
}
