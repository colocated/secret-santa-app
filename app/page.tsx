"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Snowfall } from "@/components/snowfall"
import { ChristmasDecorations } from "@/components/christmas-decorations"
import { LanguageSwitcher } from "@/components/language-switcher"
import Cookies from "js-cookie"

export default function HomePage() {
  const router = useRouter()
  const t = useTranslations("landing")

  useEffect(() => {
    // Check if user has visited a pairing page before
    const lastVisitedLink = Cookies.get("last_pairing_link")
    if (lastVisitedLink) {
      router.push(`/pairing/${lastVisitedLink}`)
    }
  }, [router])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Snowfall />
      <ChristmasDecorations />

      <div className="fixed right-2 top-16 z-50 sm:right-4 sm:top-4">
        <LanguageSwitcher />
      </div>

      <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-4 font-[family-name:var(--font-christmas)] text-5xl font-bold text-christmas-red sm:text-6xl md:text-8xl">
            {t("title")}
          </h1>
          <p className="text-xl text-christmas-green sm:text-2xl md:text-3xl">{t("subtitle")}</p>
        </div>

        <Card className="w-full max-w-2xl border-4 border-christmas-red/20 bg-white/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto text-5xl sm:text-7xl">🎅</div>
            <CardTitle className="font-[family-name:var(--font-christmas)] text-3xl text-christmas-red sm:text-4xl">
              {t("welcome")}
            </CardTitle>
            <CardDescription className="text-base text-foreground/80 sm:text-lg">{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <span className="text-3xl sm:text-4xl">🎁</span>
                <p className="text-base sm:text-lg">
                  <strong className="text-christmas-green">Step 1:</strong> {t("step1")}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <span className="text-3xl sm:text-4xl">🎄</span>
                <p className="text-base sm:text-lg">
                  <strong className="text-christmas-green">Step 2:</strong> {t("step2")}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <span className="text-3xl sm:text-4xl">⭐</span>
                <p className="text-base sm:text-lg">
                  <strong className="text-christmas-green">Step 3:</strong> {t("step3")}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border-2 border-christmas-gold/30 bg-christmas-gold/10 p-4 sm:p-6">
              <p className="text-center text-base font-medium text-foreground/90 sm:text-lg">{t("followLink")}</p>
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
              <p>{t("autoRedirect")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center gap-3 text-3xl sm:mt-12 sm:gap-4 sm:text-4xl">
          <span>🔔</span>
          <span>🎀</span>
          <span>🕯️</span>
          <span>🎊</span>
          <span>🌟</span>
        </div>
      </main>
    </div>
  )
}
