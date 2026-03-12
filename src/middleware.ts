import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const role = (token as any)?.role

  if (pathname === "/login") {
    if (token) return NextResponse.redirect(new URL(dashboardFor(role), req.url))
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(dashboardFor(role), req.url))
  }
  if (pathname.startsWith("/vendor") && !["admin", "vendor"].includes(role)) {
    return NextResponse.redirect(new URL(dashboardFor(role), req.url))
  }
  if (pathname.startsWith("/ops") && !["admin", "ops"].includes(role)) {
    return NextResponse.redirect(new URL(dashboardFor(role), req.url))
  }
  if (pathname.startsWith("/portal") && role !== "client") {
    return NextResponse.redirect(new URL(dashboardFor(role), req.url))
  }

  return NextResponse.next()
}

function dashboardFor(role?: string) {
  switch (role) {
    case "admin":  return "/admin/dashboard"
    case "vendor": return "/vendor/dashboard"
    case "ops":    return "/ops/queue"
    case "client": return "/portal"
    default:       return "/login"
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
