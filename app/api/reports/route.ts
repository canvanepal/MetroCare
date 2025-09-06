import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const subCategory = formData.get("subCategory") as string
    const priority = formData.get("priority") as string
    const latitude = Number.parseFloat(formData.get("latitude") as string)
    const longitude = Number.parseFloat(formData.get("longitude") as string)
    const address = formData.get("address") as string
    const landmark = formData.get("landmark") as string
    const imageUrls = formData.get("imageUrls") as string

    // Validation
    if (!title || !description || !category || isNaN(latitude) || isNaN(longitude) || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedImageUrls: string[] = imageUrls ? JSON.parse(imageUrls) : []

    let imageEmbedding: number[] = []
    let similarReportIds: string[] = []

    if (parsedImageUrls.length > 0) {
      try {
        // Generate embedding for the first image
        const embeddingResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-embedding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: parsedImageUrls[0] }),
        })

        if (embeddingResponse.ok) {
          const embeddingResult = await embeddingResponse.json()
          imageEmbedding = embeddingResult.embedding

          // Find similar reports
          const similarResponse = await fetch(`${request.nextUrl.origin}/api/reports/similar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embedding: imageEmbedding,
              threshold: 0.7,
              limit: 3,
            }),
          })

          if (similarResponse.ok) {
            const similarResult = await similarResponse.json()
            similarReportIds = similarResult.similarReports.map((r: any) => r.id)
          }
        }
      } catch (error) {
        console.error("AI processing error:", error)
        // Continue without AI features if they fail
      }
    }

    // Create report in database
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category: category as any,
        subCategory: subCategory || null,
        priority: priority as any,
        latitude,
        longitude,
        address,
        landmark: landmark || null,
        images: parsedImageUrls,
        reporterId: payload.userId,
        imageEmbedding: imageEmbedding.length > 0 ? imageEmbedding : null,
        similarReports: similarReportIds,
      },
      include: {
        reporter: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      report,
      similarReportsFound: similarReportIds.length,
    })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status
    if (priority) where.priority = priority

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: {
              id: true,
              phone: true,
              name: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
