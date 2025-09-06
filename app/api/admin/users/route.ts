import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const verified = searchParams.get("verified")

    // Build where clause
    const where: any = {}
    if (role && role !== "all") where.role = role
    if (verified !== null) where.isVerified = verified === "true"

    // Get users with report counts
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
