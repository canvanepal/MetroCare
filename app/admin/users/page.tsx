"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Filter, Edit, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface AdminUser {
  id: string
  phone: string
  name?: string
  email?: string
  role: string
  isVerified: boolean
  createdAt: string
  _count: {
    reports: number
  }
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams()
        if (roleFilter !== "all") params.append("role", roleFilter)

        const response = await fetch(`/api/admin/users?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === "ADMIN" || user?.role === "MODERATOR") {
      fetchUsers()
    }
  }, [user, roleFilter])

  const handleUpdateUser = async (userId: string, updates: { role?: string; isVerified?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        // Refresh users list
        const params = new URLSearchParams()
        if (roleFilter !== "all") params.append("role", roleFilter)

        const refreshResponse = await fetch(`/api/admin/users?${params.toString()}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setUsers(data.users)
        }
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "MODERATOR":
        return "bg-blue-100 text-blue-800"
      case "CITIZEN":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.phone.includes(searchTerm) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-4">You don't have permission to access this page</p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
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
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="CITIZEN">Citizen</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setRoleFilter("all")
                }}
                className="bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.phone}</TableCell>
                      <TableCell>{u.name || "-"}</TableCell>
                      <TableCell>{u.email || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{u.isVerified ? "Verified" : "Unverified"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{u._count.reports}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={isEditDialogOpen && selectedUser?.id === u.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Phone</Label>
                                <Input value={selectedUser?.phone || ""} disabled />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Select
                                  value={selectedUser?.role || ""}
                                  onValueChange={(value) =>
                                    setSelectedUser((prev) => (prev ? { ...prev, role: value } : null))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CITIZEN">Citizen</SelectItem>
                                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                                    {user.role === "ADMIN" && <SelectItem value="ADMIN">Admin</SelectItem>}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    selectedUser && handleUpdateUser(selectedUser.id, { role: selectedUser.role })
                                  }
                                  className="flex-1"
                                >
                                  Update Role
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    selectedUser &&
                                    handleUpdateUser(selectedUser.id, { isVerified: !selectedUser.isVerified })
                                  }
                                  className="flex-1 bg-transparent"
                                >
                                  {selectedUser?.isVerified ? "Unverify" : "Verify"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
