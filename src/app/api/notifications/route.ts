import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json([], { status: 401 })
  const myId = (session.user as any).id

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, myId))
    .orderBy(desc(notifications.createdAt))
    .limit(30)

  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const myId = (session.user as any).id
  const { id } = await req.json()

  if (id === "all") {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, myId))
  } else {
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, myId)))
  }
  return NextResponse.json({ ok: true })
}
