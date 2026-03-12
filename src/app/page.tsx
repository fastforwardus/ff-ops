import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function RootPage() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session) redirect("/login")
  if (role === "admin")  redirect("/admin/dashboard")
  if (role === "vendor") redirect("/vendor/dashboard")
  if (role === "ops")    redirect("/ops/queue")
  if (role === "client") redirect("/portal")
  redirect("/login")
}
