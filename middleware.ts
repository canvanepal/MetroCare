import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

// Define protected routes
const protectedRoutes = ["/dashboard", "/report", "/profile"]
const authRoutes = ["/auth/login", "/auth/verify-otp"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if route is auth-related
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected route without valid token
  if (isProtectedRoute) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token && verifyToken(token)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
