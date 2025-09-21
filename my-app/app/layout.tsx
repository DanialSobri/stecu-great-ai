import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { NavigationDrawer } from "@/components/navigation-drawer"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Autonomous Claim Solution",
  description: "Agentic AI empowered seamless claim resolution",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationDrawer />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
