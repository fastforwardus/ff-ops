import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export async function createNotification({
  userId, type, title, body, link,
}: {
  userId: string; type: string; title: string; body?: string; link?: string
}) {
  await db.insert(notifications).values({ userId, type, title, body, link })
}
