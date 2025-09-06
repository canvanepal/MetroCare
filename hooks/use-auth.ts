"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  phone: string
  name?: string
  email?: string
  role: string
  isVerified: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phone: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (phone: string) => {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to send OTP")
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
  }
}

export { AuthContext }
