"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Camera, Upload, Loader2 } from "lucide-react"
import { APP_CONFIG } from "@/lib/constants"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  onImageUploaded?: (url: string, file: File) => void
  uploadedUrls?: string[]
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = APP_CONFIG.maxImageUploads,
  onImageUploaded,
  uploadedUrls = [],
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      // Check file type
      if (!APP_CONFIG.supportedImageTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }

      // Check file size
      if (file.size > APP_CONFIG.maxImageSize) {
        errors.push(`${file.name}: File size too large (max ${APP_CONFIG.maxImageSize / 1024 / 1024}MB)`)
        return
      }

      validFiles.push(file)
    })

    // Check total count
    const newImages = [...images, ...validFiles].slice(0, maxImages)
    onImagesChange(newImages)

    if (onImageUploaded) {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const fileIndex = images.length + i

        setUploading((prev) => new Set(prev).add(fileIndex))

        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            onImageUploaded(result.url, file)
          }
        } catch (error) {
          console.error("Upload failed:", error)
        } finally {
          setUploading((prev) => {
            const newSet = new Set(prev)
            newSet.delete(fileIndex)
            return newSet
          })
        }
      }
    }

    if (errors.length > 0) {
      alert("Some files were not added:\n" + errors.join("\n"))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Add Photos</h3>
            <p className="text-muted-foreground mb-4">Drag and drop images here, or click to select files</p>
            <Button type="button" variant="outline" onClick={openFileDialog}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxImages} images, up to {APP_CONFIG.maxImageSize / 1024 / 1024}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={APP_CONFIG.supportedImageTypes.join(",")}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {uploading.has(index) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
