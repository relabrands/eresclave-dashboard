import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "eresclave - Red de Mentoría Social",
  description: "Conectamos voluntarios con jóvenes, madres solteras, desempleados y emprendedores",
  metadataBase: new URL("https://app.eresclave.org"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://app.eresclave.org",
    title: "eresclave - Red de Mentoría Social",
    description: "Conectamos voluntarios con jóvenes, madres solteras, desempleados y emprendedores",
    siteName: "eresclave",
  },
  twitter: {
    card: "summary_  desempleados y emprendedores",
    siteName: "eresclave",
  },
  twitter: {
    card: "summary_large_image",
    title: "eresclave - Red de Mentoría Social",
    description: "Conectamos voluntarios con jóvenes, madres solteras, desempleados y emprendedores",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#4a6b6b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
