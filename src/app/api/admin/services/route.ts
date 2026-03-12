import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { services } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const all = await db.select().from(services).orderBy(services.sortOrder)
  return NextResponse.json(all)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { edits } = await req.json()
  for (const [id, fields] of Object.entries(edits as Record<string, any>)) {
    await db.update(services).set({ ...fields, updatedAt: new Date() }).where(eq(services.id, id))
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const key = body.labelEs.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60) + "_" + Date.now()
  await db.insert(services).values({
    key, labelEs: body.labelEs, labelEn: body.labelEn || body.labelEs,
    priceUsd: parseInt(body.priceUsd) || 0, category: body.category,
    active: true, sortOrder: 99,
  })
  return NextResponse.json({ ok: true })
}
