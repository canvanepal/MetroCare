"use client"

import { useEffect, useState, useCallback } from "react"

interface RealtimeUpdate {
  type: "report_status_change" | "new_report" | "vote_update"
  reportId: string
  data: any
  timestamp: string
}

export function useRealtimeUpdates(userId?: string) {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const addUpdate = useCallback((update: RealtimeUpdate) => {
    setUpdates((prev) => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
  }, [])

  useEffect(() => {
    if (!userId) return

    // Simulate real-time updates with polling for now
    // In production, this would use WebSockets or Server-Sent Events
    const pollForUpdates = async () => {
      try {
        const response = await fetch(`/api/updates/poll?userId=${userId}&lastCheck=${Date.now() - 30000}`)
        if (response.ok) {
          const data = await response.json()
          data.updates?.forEach((update: RealtimeUpdate) => {
            addUpdate(update)
          })
        }
        setIsConnected(true)
      } catch (error) {
        console.error("Failed to poll for updates:", error)
        setIsConnected(false)
      }
    }

    // Poll every 30 seconds
    const interval = setInterval(pollForUpdates, 30000)
    pollForUpdates() // Initial poll

    return () => clearInterval(interval)
  }, [userId, addUpdate])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  return {
    updates,
    isConnected,
    clearUpdates,
  }
}
