import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { submissions, clients, emailLog } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !["admin","ops"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { submissionId, body, lang } = await req.json()

  const [sub] = await db.select().from(submissions).where(eq(submissions.id, submissionId))
  const [client] = await db.select().from(clients).where(eq(clients.id, sub.clientId))

  const subject = lang === "es"
    ? "Tu asesor de FastForward te envió un mensaje"
    : "Your FastForward advisor sent you a message"

  // Log the email (Resend key not configured yet — just log it)
  await db.insert(emailLog).values({
    submissionId,
    clientId:  client.id,
    toEmail:   client.ownerEmail,
    type:      "info_request",
    status:    "pending",
  })

  // TODO: replace with actual Resend call once key is configured
  console.log(`[EMAIL] To: ${client.ownerEmail} | Lang: ${lang} | Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)

  return NextResponse.json({ ok: true })
}
