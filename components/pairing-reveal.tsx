"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"

interface PairingRevealProps {
  event: {
    id: string
    title: string
    description: string | null
    rules: string[]
  }
  participant: {
    id: string
    name: string
  }
  pairing: {
    revealed: boolean
    receiver: {
      name: string
    }
  }
  link: string
}

const giftEmojis = ["🎁", "🎀", "🧸", "🎮", "📚", "🎨", "⚽", "🎸", "🎭", "🎪", "🎯", "🎲", "🧩", "🪀", "🎺", "🎻"]

export function PairingReveal({ event, participant, pairing, link }: PairingRevealProps) {
  const t = useTranslations("pairing")
  const [isRevealed, setIsRevealed] = useState(pairing.revealed)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentEmoji, setCurrentEmoji] = useState("🎁")
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    // Save the link to cookies for auto-redirect
    Cookies.set("last_pairing_link", link, { expires: 365 })
  }, [link])

  const handleReveal = async () => {
    if (isRevealed || isAnimating) return

    setIsAnimating(true)
    setIsSpinning(true)

    // Roulette-style emoji cycling
    let cycleCount = 0
    const maxCycles = 30
    let interval = 50

    const cycleEmojis = () => {
      if (cycleCount < maxCycles) {
        setCurrentEmoji(giftEmojis[Math.floor(Math.random() * giftEmojis.length)])
        cycleCount++

        // Slow down the cycling as we approach the end
        if (cycleCount > 20) {
          interval += 30
        }

        setTimeout(cycleEmojis, interval)
      } else {
        // Final reveal
        setIsSpinning(false)
        setTimeout(() => {
          setIsRevealed(true)
          setShowConfetti(true)
          setIsAnimating(false)

          // Update revealed status in database
          fetch("/api/reveal-pairing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantId: participant.id }),
          })

          // Hide confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000)
        }, 500)
      }
    }

    cycleEmojis()
  }

  return (
    <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {showConfetti && <Confetti />}

      <div className="mb-6 text-center sm:mb-8">
        <h1 className="mb-2 font-(family-name:--font-christmas) text-4xl font-bold text-christmas-red sm:text-5xl md:text-7xl">
          {event.title}
        </h1>
        {event.description && <p className="text-lg text-foreground/80 sm:text-xl md:text-2xl">{event.description}</p>}
      </div>

      <Card className="w-full max-w-2xl border-4 border-christmas-red/20 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="font-(family-name:--font-christmas) text-2xl text-christmas-green sm:text-3xl">
            {t("hello", { name: participant.name })}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {isRevealed ? t("yourAssignment") : t("clickToReveal")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            {!isRevealed ? (
              <Button
                onClick={handleReveal}
                disabled={isAnimating}
                className={`group relative h-40 w-40 rounded-3xl border-4 border-christmas-red bg-linear-to-br from-christmas-red to-christmas-red/80 p-0 shadow-2xl transition-all hover:scale-105 hover:shadow-christmas-red/50 sm:h-48 sm:w-48 animate-pulse`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-7xl transition-transform sm:text-8xl ${isSpinning ? "animate-spin" : ""}`}>
                    {currentEmoji}
                  </span>
                  {!isSpinning && <span className="text-base font-bold text-white sm:text-xl">{t("clickToOpen")}</span>}
                </div>
              </Button>
            ) : (
              <div className="animate-in fade-in zoom-in duration-1000 space-y-4 text-center">
                <div className="text-6xl sm:text-7xl">🎁</div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground/80 sm:text-2xl">{t("youAreSecretSantaFor")}</p>
                  <p className="font-(family-name:--font-christmas) text-4xl font-bold text-christmas-red sm:text-5xl">
                    {pairing.receiver.name}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-2xl sm:text-3xl">
                  <span>🎄</span>
                  <span>⭐</span>
                  <span>🎅</span>
                  <span>⭐</span>
                  <span>🎄</span>
                </div>
              </div>
            )}
          </div>

          {event.rules && event.rules.length > 0 && (
            <div className="rounded-lg border-2 border-christmas-green/30 bg-christmas-green-light p-4 sm:p-6">
              <h3 className="mb-4 font-(family-name:--font-christmas) text-xl font-bold text-christmas-green sm:text-2xl">
                {t("eventRules")}
              </h3>
              <ul className="space-y-2">
                {event.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-christmas-red">•</span>
                    <span className="text-sm text-foreground/80 sm:text-base">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isRevealed && (
            <div className="rounded-lg border-2 border-christmas-gold/30 bg-christmas-gold/10 p-3 text-center sm:p-4">
              <p className="text-xs font-medium text-foreground/80 sm:text-sm">{t("keepSecret")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function Confetti() {
  const confettiPieces = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    color: ["#DC2626", "#16A34A", "#EAB308", "#3B82F6", "#A855F7"][Math.floor(Math.random() * 5)],
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <div
            className="h-3 w-3 rotate-45"
            style={{
              backgroundColor: piece.color,
            }}
          />
        </div>
      ))}
    </div>
  )
}
