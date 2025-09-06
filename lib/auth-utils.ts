import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateToken(payload: { userId: string; phone: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" })
}

export function verifyToken(token: string): { userId: string; phone: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; phone: string }
  } catch (error) {
    return null
  }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  // In production, integrate with SMS service like Twilio
  // For now, this is a placeholder
  console.log(`SMS to ${phone}: ${message}`)

  // Example Twilio integration:
  // const client = twilio(accountSid, authToken)
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: `+${phone}`
  // })
}
