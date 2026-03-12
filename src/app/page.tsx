import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = (session.user as any).role
  if (role === "admin")  redirect("/admin/dashboard")
  if (role === "vendor") redirect("/vendor/dashboard")
  if (role === "ops")    redirect("/ops/queue")
  if (role === "client") redirect("/portal")
  redirect("/login")
}
