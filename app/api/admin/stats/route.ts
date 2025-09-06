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

    // Get statistics
    const [totalReports, pendingReports, resolvedReports, totalUsers] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.user.count(),
    ])

    // Get recent activity (last 10 reports)
    const recentReports = await prisma.report.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        reporter: {
          select: {
            phone: true,
          },
        },
      },
    })

    const recentActivity = recentReports.map((report) => ({
      id: report.id,
      type: "report",
      description: `New report: ${report.title}`,
      timestamp: report.createdAt.toISOString(),
    }))

    return NextResponse.json({
      totalReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      recentActivity,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
