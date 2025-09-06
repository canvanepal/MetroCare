import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, TrendingUp, AlertTriangle, Lightbulb, Car, TreePine } from "lucide-react"

export default function HomePage() {
  const issueTypes = [
    { icon: AlertTriangle, name: "Potholes", count: 24, color: "bg-destructive" },
    { icon: Lightbulb, name: "Street Lights", count: 12, color: "bg-chart-4" },
    { icon: Car, name: "Traffic Issues", count: 8, color: "bg-chart-2" },
    { icon: TreePine, name: "Parks & Trees", count: 15, color: "bg-chart-3" },
  ]

  const recentReports = [
    { id: "MC-2024-001", type: "Pothole", location: "Main St & 5th Ave", status: "In Progress", priority: "High" },
    { id: "MC-2024-002", type: "Street Light", location: "Park Avenue", status: "Resolved", priority: "Medium" },
    { id: "MC-2024-003", type: "Graffiti", location: "City Hall", status: "Pending", priority: "Low" },
  ]

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
                <p className="text-sm text-muted-foreground">Civic Issue Reporting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Help Improve Your Community</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Report municipal issues like potholes, broken streetlights, and other civic concerns. Track progress and
            help make your city better for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <MapPin className="h-5 w-5 mr-2" />
              Report an Issue
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Reports
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {issueTypes.map((issue, index) => {
              const Icon = issue.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div
                      className={`w-12 h-12 rounded-full ${issue.color} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">{issue.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">{issue.count}</p>
                    <p className="text-sm text-muted-foreground">Active Reports</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Recent Reports</h3>
              <p className="text-muted-foreground">Latest community issue reports</p>
            </div>
            <Button variant="outline">View All Reports</Button>
          </div>

          <div className="grid gap-4">
            {recentReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{report.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.type} • {report.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          report.status === "Resolved"
                            ? "default"
                            : report.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {report.status}
                      </Badge>
                      <Badge
                        variant={
                          report.priority === "High"
                            ? "destructive"
                            : report.priority === "Medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {report.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">MetroCare</p>
                <p className="text-sm text-muted-foreground">Making cities better together</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
