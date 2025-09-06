import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export async function POST(request: NextRequest) {
  try {
    const { embedding, threshold = 0.8, limit = 5 } = await request.json()

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json({ error: "Valid embedding array is required" }, { status: 400 })
    }

    // Get all reports with embeddings
    const reports = await prisma.report.findMany({
      where: {
        imageEmbedding: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    // Calculate similarities
    const similarities = reports
      .map((report) => {
        if (!report.imageEmbedding) return null

        const similarity = cosineSimilarity(embedding, report.imageEmbedding as number[])
        return {
          ...report,
          similarity,
        }
      })
      .filter((item) => item !== null && item.similarity >= threshold)
      .sort((a, b) => b!.similarity - a!.similarity)
      .slice(0, limit)

    return NextResponse.json({
      similarReports: similarities,
      count: similarities.length,
    })
  } catch (error) {
    console.error("Similar reports error:", error)
    return NextResponse.json({ error: "Failed to find similar reports" }, { status: 500 })
  }
}
