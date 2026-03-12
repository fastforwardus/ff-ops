import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients, serviceRequests } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [client] = await db.select().from(clients).where(eq(clients.portalEmail, session.user?.email!))
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { note } = await req.json()
  await db.insert(serviceRequests).values({
    clientId: client.id,
    services: [],
    notes:    note,
    status:   "pending",
  })

  return NextResponse.json({ ok: true })
}
