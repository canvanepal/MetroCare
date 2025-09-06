import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        statusUpdates: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Get report error:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status, message } = await request.json()

    // Check if user is admin or report owner
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      select: { reporterId: true },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR"
    const isOwner = report.reporterId === payload.userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: { status, updatedAt: new Date() },
      include: {
        reporter: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
    })

    // Create status update record
    if (status && message) {
      await prisma.statusUpdate.create({
        data: {
          reportId: params.id,
          status,
          message,
          updatedBy: payload.userId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
    })
  } catch (error) {
    console.error("Update report error:", error)
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
  }
}
