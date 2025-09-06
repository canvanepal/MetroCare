import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div>
              <div className="h-6 w-36 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-8 gap-4 pb-2 border-b">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
              {/* Table Rows */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4 py-2">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
