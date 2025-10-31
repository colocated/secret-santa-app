import type React from "react"
import type { Metadata } from "next"
import { Merriweather, Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import "./globals.css"

const christmasFont = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-christmas",
})

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Secret Santa - Holiday Gift Exchange",
  description: "Organize your Secret Santa gift exchange with ease",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html lang="en" className="light">
      <body className={`${geist.className} ${christmasFont.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
