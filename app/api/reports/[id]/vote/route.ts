import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_reportId: {
          userId: payload.userId,
          reportId: params.id,
        },
      },
    })

    if (existingVote) {
      // Remove vote (toggle)
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })

      // Update report upvotes count
      await prisma.report.update({
        where: { id: params.id },
        data: { upvotes: { decrement: 1 } },
      })

      return NextResponse.json({
        success: true,
        voted: false,
        message: "Vote removed",
      })
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId: payload.userId,
          reportId: params.id,
        },
      })

      // Update report upvotes count
      await prisma.report.update({
        where: { id: params.id },
        data: { upvotes: { increment: 1 } },
      })

      return NextResponse.json({
        success: true,
        voted: true,
        message: "Vote added",
      })
    }
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 })
  }
}
