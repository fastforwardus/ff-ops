import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients, submissions, services, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

async function getUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  const [user] = await db.select().from(users).where(eq(users.email, session.user.email))
  return user ?? null
}

export async function GET() {
  const user = await getUser()
  if (!user || !["admin","vendor","ops"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const myClients = user.role === "admin"
    ? await db.select().from(clients).orderBy(clients.createdAt)
    : await db.select().from(clients).where(eq(clients.vendorId, user.id)).orderBy(clients.createdAt)

  const allUsers = await db.select({ id: users.id, name: users.name }).from(users)
  const userMap  = Object.fromEntries(allUsers.map(u => [u.id, u.name]))

  const result = await Promise.all(myClients.map(async client => {
    const subs = await db
      .select({ id:submissions.id, status:submissions.status, urgency:submissions.urgency, assignedToId:submissions.assignedToId, serviceLabel:services.labelEs })
      .from(submissions)
      .innerJoin(services, eq(submissions.serviceId, services.id))
      .where(eq(submissions.clientId, client.id))
    return {
      id: client.id, companyName: client.companyName, country: client.country,
      ownerEmail: client.ownerEmail, phone: client.phone, dunsStatus: client.dunsStatus,
      createdAt: client.createdAt,
      submissions: subs.map(s => ({ ...s, assignedToName: s.assignedToId ? (userMap[s.assignedToId] ?? null) : null })),
    }
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user || !["admin","vendor","ops"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { selectedServices, ...clientData } = body

    const [client] = await db.insert(clients).values({
      vendorId:           user.id,
      portalEmail:        clientData.ownerEmail,
      portalPasswordHash: "pending",
      companyName:        clientData.companyName   ?? "",
      country:            clientData.country        ?? "",
      address:            clientData.address        ?? "",
      phone:              clientData.phone           ?? "",
      ownerEmail:         clientData.ownerEmail     ?? "",
      dunsStatus:         clientData.dunsStatus     ?? "needed",
      dunsNumber:         clientData.dunsNumber     || null,
      tradeNames:         clientData.tradeNames     || null,
      state:              clientData.state          || null,
      postalCode:         clientData.postalCode     || null,
      emergencyPhone:     clientData.emergencyPhone || null,
      parentCompanyName:  clientData.parentCompanyName  || null,
      parentCompanyCountry: clientData.parentCompanyCountry || null,
    }).returning()

    if (selectedServices?.length) {
      for (const serviceId of selectedServices) {
        await db.insert(submissions).values({ clientId: client.id, serviceId, status: "pending_review", urgency: "normal" })
      }
    }

    return NextResponse.json({ ok: true, clientId: client.id })
  } catch (e: any) {
    console.error("[POST /api/vendor/clients]", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
