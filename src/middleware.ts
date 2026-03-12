import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  })

  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth") || pathname === "/change-password") return NextResponse.next()

  if (!token) {
    if (pathname === "/login") return NextResponse.next()
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role          = (token as any).role
  const needsPwChange = (token as any).needsPwChange

  // Solo redirige a change-password si ya está autenticado y no está en login
  if (needsPwChange && pathname !== "/login" && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url))
  }

  if (pathname === "/login") {
    if (needsPwChange) return NextResponse.redirect(new URL("/change-password", req.url))
    if (role === "admin")  return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    if (role === "vendor") return NextResponse.redirect(new URL("/vendor/dashboard", req.url))
    if (role === "ops")    return NextResponse.redirect(new URL("/ops/queue", req.url))
    if (role === "client") return NextResponse.redirect(new URL("/portal", req.url))
  }

  if (pathname.startsWith("/admin") && role !== "admin")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/vendor") && !["admin","vendor","ops"].includes(role))
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/ops") && !["admin","ops"].includes(role))
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/portal") && role !== "client")
    return NextResponse.redirect(new URL("/login", req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/change-password", "/admin/:path*", "/vendor/:path*", "/ops/:path*", "/portal/:path*"],
}
