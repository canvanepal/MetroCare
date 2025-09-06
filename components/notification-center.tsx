"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, TrendingUp, AlertTriangle, X } from "lucide-react"
import { useRealtimeUpdates } from "@/hooks/use-real-time-updates"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export function NotificationCenter() {
  const { user } = useAuth()
  const { updates, isConnected, clearUpdates } = useRealtimeUpdates(user?.id)
  const [isOpen, setIsOpen] = useState(false)

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "report_status_change":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "vote_update":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
    }
  }

  const getUpdateMessage = (update: any) => {
    switch (update.type) {
      case "report_status_change":
        return `Your report "${update.data.title}" status changed to ${update.data.newStatus}`
      case "vote_update":
        return `Someone ${update.data.action} your report "${update.data.title}"`
      default:
        return "New update available"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {updates.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {updates.length > 9 ? "9+" : updates.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                {updates.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearUpdates}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {updates.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {updates.map((update, index) => (
                    <Link key={index} href={`/reports/${update.reportId}`} onClick={() => setIsOpen(false)}>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        {getUpdateIcon(update.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{getUpdateMessage(update)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(update.timestamp)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
