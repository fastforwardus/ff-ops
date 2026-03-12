import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { password } = await req.json()
  if (!password || password.length < 8) return NextResponse.json({ error: "Contraseña muy corta" }, { status: 400 })
  const hash = await bcrypt.hash(password, 10)
  await db.update(users).set({ passwordHash: hash }).where(eq(users.email, session.user.email))
  return NextResponse.json({ ok: true })
}
