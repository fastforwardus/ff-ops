import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  // Token is the portalEmail for now — in production use a signed token
  const [client] = await db.select().from(clients).where(eq(clients.portalEmail, token))
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 })

  const hash = await bcrypt.hash(password, 10)
  await db.update(clients).set({ portalPasswordHash: hash, firstLoginAt: new Date() }).where(eq(clients.id, client.id))

  return NextResponse.json({ ok: true })
}
