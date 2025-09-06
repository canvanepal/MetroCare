import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const adminUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { role, isVerified } = await request.json()

    // Prevent non-admins from creating admins
    if (role === "ADMIN" && adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create admin users" }, { status: 403 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(typeof isVerified === "boolean" && { isVerified }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
