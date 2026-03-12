import { NextResponse } from "next/server"

export async function GET() {
  const res = NextResponse.redirect(new URL("/portal/login", process.env.NEXT_PUBLIC_APP_URL))
  res.cookies.delete("portal_token")
  return res
}
