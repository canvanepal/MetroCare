"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/notification-center"
import { MapPin, Plus, TrendingUp, User, LogOut, List, Shield } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MetroCare</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">+{user.phone}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <NotificationCenter />
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back{user.name ? `, ${user.name}` : ""}!</h2>
          <p className="text-muted-foreground">
            Ready to help improve your community? Report issues or check on existing reports.
          </p>
        </div>

        {(user.role === "ADMIN" || user.role === "MODERATOR") && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                Administrative Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You have {user.role.toLowerCase()} privileges. Access the admin dashboard to manage reports, users, and
                system settings.
              </p>
              <Button asChild>
                <Link href="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Open Admin Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Report New Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Found a pothole, broken streetlight, or other civic issue? Report it here.
              </p>
              <Button asChild className="w-full">
                <Link href="/report">
                  <MapPin className="h-4 w-4 mr-2" />
                  Start Report
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-accent" />
                Browse Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View all community reports and see what issues are being addressed.
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/reports">View All Reports</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-3" />
                My Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track the status of your submitted reports and see community impact.
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/my-reports">View My Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity. Start by reporting your first issue!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
