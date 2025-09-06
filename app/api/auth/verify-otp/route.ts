import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 })
    }

    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark OTP as verified
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    })

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true,
          role: "CITIZEN",
        },
      })
    } else {
      // Update verification status
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, phone: user.phone })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}
