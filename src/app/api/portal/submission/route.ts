import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { submissions, clients, services } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

async function getClientFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("portal_token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { clientId: string; email: string }
  } catch { return null }
}

export async function GET() {
  const payload = await getClientFromToken()
  if (!payload) return NextResponse.json(null, { status: 401 })

  const [client] = await db.select().from(clients).where(eq(clients.id, payload.clientId))
  if (!client) return NextResponse.json(null, { status: 401 })

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

  return NextResponse.json(rows[0] ?? null)
}
