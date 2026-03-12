import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { ne } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { createHash, randomBytes } from "crypto"

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const all = await db.select({
    id: users.id, name: users.name, email: users.email,
    role: users.role, createdAt: users.createdAt,
  }).from(users).where(ne(users.role, "client"))
  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, email, role } = await req.json()
  if (!name || !email || !role)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const tempPassword = randomBytes(4).toString("hex").toUpperCase() + "!" + randomBytes(2).toString("hex")
  const passwordHash = "$seed$" + createHash("sha256").update(tempPassword).digest("hex")
  await db.insert(users).values({ name, email, role, passwordHash })
  return NextResponse.json({ ok: true, tempPassword })
}
