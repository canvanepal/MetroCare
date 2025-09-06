import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOtp, sendSms } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        phone,
        code: otp,
        expiresAt,
        verified: false,
      },
    })

    // In production, send SMS via service like Twilio
    // For development, log the OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`)
    } else {
      // Send SMS in production
      await sendSms(phone, `Your MetroCare verification code is: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
