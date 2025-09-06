import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lastCheck = searchParams.get("lastCheck")
    const lastCheckDate = lastCheck ? new Date(Number.parseInt(lastCheck)) : new Date(Date.now() - 300000) // 5 minutes ago

    // Get recent status updates for user's reports
    const statusUpdates = await prisma.statusUpdate.findMany({
      where: {
        createdAt: {
          gte: lastCheckDate,
        },
        report: {
          reporterId: payload.userId,
        },
      },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Get recent votes on user's reports
    const recentVotes = await prisma.vote.findMany({
      where: {
        createdAt: {
          gte: lastCheckDate,
        },
        report: {
          reporterId: payload.userId,
        },
      },
      include: {
        report: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Format updates
    const updates = [
      ...statusUpdates.map((update) => ({
        type: "report_status_change" as const,
        reportId: update.report.id,
        data: {
          title: update.report.title,
          oldStatus: update.report.status,
          newStatus: update.status,
          message: update.message,
        },
        timestamp: update.createdAt.toISOString(),
      })),
      ...recentVotes.map((vote) => ({
        type: "vote_update" as const,
        reportId: vote.report.id,
        data: {
          title: vote.report.title,
          action: "upvoted",
        },
        timestamp: vote.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      updates,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Poll updates error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
