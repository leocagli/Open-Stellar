import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Moltbot City - Agent Simulation",
  description: "Interactive pixel city for monitoring and simulating Moltbot autonomous agents",
}

export const viewport: Viewport = {
  themeColor: "#0a0e17",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
