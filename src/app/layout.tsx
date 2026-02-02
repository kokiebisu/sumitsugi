import type React from "react"
import type { Metadata, Viewport } from "next"
// Temporarily disabled due to network issues
// import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

// const notoSansJP = Noto_Sans_JP({
//   subsets: ["latin"],
//   weight: ["400", "500", "700"],
//   variable: "--font-noto-sans",
// })

// const notoSerifJP = Noto_Serif_JP({
//   subsets: ["latin"],
//   weight: ["400", "500"],
//   variable: "--font-noto-serif",
// })

export const metadata: Metadata = {
  title: "Tsumugi | 暮らしの引き継ぎ",
  description: "家具も、空間も、ストーリーも。大切にしてきた暮らしを、次の人へ引き継ぐサービスです。",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#FF5A5F",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
