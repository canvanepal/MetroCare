"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MapPin, Camera, ArrowLeft, Send, MapIcon, AlertTriangle, Eye } from "lucide-react"
import Link from "next/link"
import { ISSUE_CATEGORIES, PRIORITY_LEVELS } from "@/lib/constants"
import { MapLocationPicker } from "@/components/map-location-picker"
import { ImageUpload } from "@/components/image-upload"

interface LocationData {
  latitude: number
  longitude: number
  address: string
  landmark?: string
}

interface SimilarReport {
  id: string
  title: string
  category: string
  status: string
  similarity: number
  createdAt: string
  upvotes: number
}

export default function ReportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    priority: "MEDIUM" as keyof typeof PRIORITY_LEVELS,
  })

  const [location, setLocation] = useState<LocationData | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [similarReports, setSimilarReports] = useState<SimilarReport[]>([])
  const [showingSimilar, setShowingSimilar] = useState(false)

  const handleLocationSelect = useCallback((locationData: LocationData) => {
    setLocation(locationData)
  }, [])

  const handleImageUploaded = useCallback(async (url: string, file: File) => {
    setUploadedImageUrls((prev) => [...prev, url])

    // Generate embedding and find similar reports
    try {
      const embeddingResponse = await fetch("/api/ai/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (embeddingResponse.ok) {
        const embeddingResult = await embeddingResponse.json()

        const similarResponse = await fetch("/api/reports/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embedding: embeddingResult.embedding,
            threshold: 0.7,
            limit: 3,
          }),
        })

        if (similarResponse.ok) {
          const similarResult = await similarResponse.json()
          if (similarResult.similarReports.length > 0) {
            setSimilarReports(similarResult.similarReports)
            setShowingSimilar(true)
          }
        }
      }
    } catch (error) {
      console.error("Error finding similar reports:", error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError("")

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.category) {
      setError("Category is required")
      setIsSubmitting(false)
      return
    }

    if (!location) {
      setError("Location is required")
      setIsSubmitting(false)
      return
    }

    try {
      // Create FormData for submission
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("subCategory", formData.subCategory)
      submitData.append("priority", formData.priority)
      submitData.append("latitude", location.latitude.toString())
      submitData.append("longitude", location.longitude.toString())
      submitData.append("address", location.address)
      if (location.landmark) {
        submitData.append("landmark", location.landmark)
      }

      submitData.append("imageUrls", JSON.stringify(uploadedImageUrls))

      const response = await fetch("/api/reports", {
        method: "POST",
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/reports/${data.report.id}`)
        }, 2000)
      } else {
        setError(data.error || "Failed to submit report")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to report an issue</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Report Submitted!</h2>
            <p className="text-sm text-muted-foreground">
              Your report has been submitted successfully. You'll be redirected to view it shortly.
            </p>
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
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Report an Issue</h1>
              <p className="text-sm text-muted-foreground">Help improve your community</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, category: value, subCategory: "" }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ISSUE_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subCategory: value }))}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category &&
                        ISSUE_CATEGORIES[formData.category as keyof typeof ISSUE_CATEGORIES]?.subcategories.map(
                          (sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value as keyof typeof PRIORITY_LEVELS }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                          {priority.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Location *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapLocationPicker onLocationSelect={handleLocationSelect} />
              {location && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Location:</p>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                  {location.landmark && <p className="text-sm text-muted-foreground">Near: {location.landmark}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photos (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                onImageUploaded={handleImageUploaded}
                uploadedUrls={uploadedImageUrls}
              />
            </CardContent>
          </Card>

          {showingSimilar && similarReports.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Similar Reports Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 mb-4">
                  We found {similarReports.length} similar report(s). Please check if your issue has already been
                  reported:
                </p>
                <div className="space-y-3">
                  {similarReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {ISSUE_CATEGORIES[report.category as keyof typeof ISSUE_CATEGORIES]?.label ||
                              report.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(report.similarity * 100)}% similar
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reports/${report.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-transparent"
                  onClick={() => setShowingSimilar(false)}
                >
                  Continue with New Report
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
