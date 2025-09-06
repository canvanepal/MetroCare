import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "MetroCare - Civic Issue Reporting",
  description:
    "Report and track municipal issues in your community. Help improve your city by reporting potholes, broken streetlights, and other civic concerns.",
  generator: "MetroCare",
  keywords: ["civic", "municipal", "issue reporting", "311", "city services", "community"],
  authors: [{ name: "MetroCare Team" }],
  openGraph: {
    title: "MetroCare - Civic Issue Reporting",
    description: "Report and track municipal issues in your community",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#2563eb",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
