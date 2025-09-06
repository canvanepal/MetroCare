"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { MapPin, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const router = useRouter()

  useEffect(() => {
    // Get phone from session storage
    const storedPhone = sessionStorage.getItem("auth_phone")
    if (!storedPhone) {
      router.push("/auth/login")
      return
    }
    setPhone(storedPhone)

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem("auth_phone")
        // Redirect to dashboard or home
        router.push("/dashboard")
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setTimeLeft(600) // Reset timer
        setOtp("") // Clear current OTP
      } else {
        const data = await response.json()
        setError(data.error || "Failed to resend code")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MetroCare</h1>
              <p className="text-sm text-muted-foreground">Civic Issue Reporting</p>
            </div>
          </div>
        </div>

        {/* OTP Verification Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Your Phone</CardTitle>
            <CardDescription>Enter the 6-digit code sent to {phone ? `+${phone}` : "your phone"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleVerify} className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center space-y-2">
              {timeLeft > 0 ? (
                <p className="text-sm text-muted-foreground">Code expires in {formatTime(timeLeft)}</p>
              ) : (
                <p className="text-sm text-destructive">Code has expired</p>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={isResending || timeLeft > 540} // Allow resend after 1 minute
                className="text-accent hover:text-accent-foreground"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
