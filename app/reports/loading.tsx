import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-6 w-6 bg-muted rounded"></div>
                </div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4 w-2/3"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-14"></div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded flex-1"></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
