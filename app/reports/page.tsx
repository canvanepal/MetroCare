"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, Search, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { ISSUE_CATEGORIES, PRIORITY_LEVELS, REPORT_STATUSES } from "@/lib/constants"

interface Report {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  address: string
  upvotes: number
  createdAt: string
  reporter: {
    id: string
    name?: string
    phone: string
  }
  _count: {
    votes: number
  }
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [categoryFilter, statusFilter, priorityFilter])

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)

      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS]?.color || "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    return REPORT_STATUSES[status as keyof typeof REPORT_STATUSES]?.color || "bg-gray-500"
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
                <h1 className="text-xl font-bold text-foreground">Community Reports</h1>
                <p className="text-sm text-muted-foreground">Track civic issues in your area</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/report">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ISSUE_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(REPORT_STATUSES).map(([key, status]) => (
                    <SelectItem key={key} value={key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                    <SelectItem key={key} value={key}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Reports List */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No reports found</p>
            <Button asChild>
              <Link href="/report">Report First Issue</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          <Link href={`/reports/${report.id}`} className="hover:text-primary">
                            {report.title}
                          </Link>
                        </h3>
                        <Badge variant="secondary" className={`${getPriorityColor(report.priority)} text-white`}>
                          {PRIORITY_LEVELS[report.priority as keyof typeof PRIORITY_LEVELS]?.label}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2">{report.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {report.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(report.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {report.upvotes} upvotes
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={`${getStatusColor(report.status)} text-white border-0`}>
                        {REPORT_STATUSES[report.status as keyof typeof REPORT_STATUSES]?.label}
                      </Badge>
                      <Badge variant="secondary">
                        {ISSUE_CATEGORIES[report.category as keyof typeof ISSUE_CATEGORIES]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
