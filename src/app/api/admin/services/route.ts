import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { services, priceHistory } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  // Vendor y ops también pueden ver servicios
  if (!session || !["admin","vendor","ops"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db.select().from(services).orderBy(services.sortOrder)
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { edits } = await req.json()
  for (const [id, changes] of Object.entries(edits as Record<string, any>)) {
    const current = await db.select().from(services).where(eq(services.id, id))
    if (current[0] && changes.priceUsd !== undefined && changes.priceUsd !== current[0].priceUsd) {
      await db.insert(priceHistory).values({
        serviceId:   id,
        oldPriceUsd: current[0].priceUsd,
        newPriceUsd: changes.priceUsd,
        changedById: (session.user as any).id,
      })
    }
    await db.update(services).set(changes).where(eq(services.id, id))
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { labelEs, labelEn, priceUsd, category } = await req.json()
  const key = labelEs.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  await db.insert(services).values({ key, labelEs, labelEn: labelEn || labelEs, priceUsd: parseInt(priceUsd) || 0, category, active: true, sortOrder: 99 })
  return NextResponse.json({ ok: true })
}
