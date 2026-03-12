import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { submissions, clients, services } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json(null, { status: 401 })
  const clientEmail = session.user?.email

  const [client] = await db.select().from(clients).where(eq(clients.portalEmail, clientEmail!))
  if (!client) return NextResponse.json(null)

  const rows = await db
    .select({
      id:             submissions.id,
      status:         submissions.status,
      fdaRegNumber:   submissions.fdaRegNumber,
      expiresAt:      submissions.expiresAt,
      etaStep2:       submissions.etaStep2,
      etaStep3:       submissions.etaStep3,
      etaStep4:       submissions.etaStep4,
      serviceLabel:   services.labelEs,
      serviceLabelEn: services.labelEn,
      clientName:     clients.companyName,
    })
    .from(submissions)
    .innerJoin(services, eq(submissions.serviceId, services.id))
    .innerJoin(clients,  eq(submissions.clientId,  clients.id))
    .where(eq(submissions.clientId, client.id))
    .limit(1)

  return NextResponse.json(rows[0] ?? null)
}
