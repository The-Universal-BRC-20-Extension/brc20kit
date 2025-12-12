import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"

import { Analytics } from "@vercel/analytics/next"
import { LaserEyesWalletProvider } from "@/lib/lasereyes-wallet-provider"
import { QueryProvider } from "@/lib/query-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RouteProgress } from "@/components/transitions/route-progress"
import "./globals.css"

import { Geist, Geist_Mono, Source_Serif_4, Fira_Code } from "next/font/google"

// Initialize fonts
const _geist = Geist({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const geistSans = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mono",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-code",
})

export const metadata: Metadata = {
  title: "BRC-20 Kit - The Universal BRC-20 Developer Kit",
  description: "The forkable SDK for minting, swapping, and managing your BRC-20 projects",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${firaCode.variable}`}
    >
      <body className={`${geistSans.className} antialiased`}>
        <ErrorBoundary>
          <LaserEyesWalletProvider>
            <QueryProvider>
              <Suspense fallback={null}>
                <RouteProgress />
              </Suspense>
              <Header />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
              <Toaster />
            </QueryProvider>
          </LaserEyesWalletProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
