import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Faltan datos" }, { status: 400 })

  const [client] = await db.select().from(clients).where(eq(clients.portalEmail, email))
  if (!client) return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 })

  const hash = client.portalPasswordHash ?? ""
  let valid = false
  if (hash.startsWith("$seed$")) {
    const expected = "$seed$" + createHash("sha256").update(password).digest("hex")
    valid = hash === expected
  } else {
    valid = await bcrypt.compare(password, hash)
  }

  if (!valid) return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 })

  const token = await new SignJWT({ clientId: client.id, email: client.portalEmail })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const res = NextResponse.json({ ok: true })
  res.cookies.set("portal_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" })
  return res
}
