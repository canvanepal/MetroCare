"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ISSUE_CATEGORIES, PRIORITY_LEVELS } from "@/lib/constants"

interface MyReport {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  address: string
  images: string[]
  createdAt: string
  updatedAt: string
  _count: {
    votes: number
  }
}

export default function MyReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<MyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.append("status", statusFilter)
        params.append("userId", user?.id || "")

        const response = await fetch(`/api/reports/my-reports?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports)
        }
      } catch (error) {
        console.error("Failed to fetch my reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchMyReports()
    }
  }, [user, statusFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "IN_PROGRESS":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your reports</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Reports</h1>
              <p className="text-sm text-muted-foreground">Track your submitted issues</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {reports.filter((r) => r.status === "PENDING").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter((r) => r.status === "RESOLVED").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{reports.reduce((sum, r) => sum + r._count.votes, 0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground mb-4">
                {reports.length === 0
                  ? "You haven't submitted any reports yet. Start by reporting your first issue!"
                  : "No reports match your current filters. Try adjusting your search criteria."}
              </p>
              {reports.length === 0 && (
                <Button asChild>
                  <Link href="/report">
                    <MapPin className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg leading-tight">{report.title}</h3>
                    <div className="flex items-center gap-1">{getStatusIcon(report.status)}</div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{report.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {ISSUE_CATEGORIES[report.category as keyof typeof ISSUE_CATEGORIES]?.label || report.category}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    <Badge
                      variant="outline"
                      className={PRIORITY_LEVELS[report.priority as keyof typeof PRIORITY_LEVELS]?.color}
                    >
                      {PRIORITY_LEVELS[report.priority as keyof typeof PRIORITY_LEVELS]?.label || report.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{report.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{report._count.votes} votes</span>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/reports/${report.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
