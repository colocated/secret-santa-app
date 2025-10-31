"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Sparkles } from "lucide-react"
import Link from "next/link"
import { Snowfall } from "@/components/snowfall"

interface PresentationModeProps {
  event: {
    id: string
    title: string
    description: string | null
  }
  participants: Array<{
    id: string
    name: string
  }>
  pairings: Array<{
    id: string
    giver: {
      id: string
      name: string
    }
    receiver: {
      id: string
      name: string
    }
  }>
}

const giftEmojis = ["🎁", "🎀", "🧸", "🎮", "📚", "🎨", "⚽", "🎸", "🎭", "🪀", "🎺", "🎻", "🎪", "🎯", "🎲", "🧩"]

export function PresentationMode({ event, participants, pairings }: PresentationModeProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealedPairing, setRevealedPairing] = useState<string | null>(null)
  const [currentEmoji, setCurrentEmoji] = useState("🎁")

  const handleSelectParticipant = (participantId: string) => {
    if (isRevealing) return

    setSelectedParticipant(participantId)
    setIsRevealing(true)
    setRevealedPairing(null)

    // Find the pairing
    const pairing = pairings.find((p) => p.receiver.id === participantId)
    if (!pairing) {
      setIsRevealing(false)
      return
    }

    // Roulette animation
    let cycleCount = 0
    const maxCycles = 40
    let interval = 50

    const cycleEmojis = () => {
      if (cycleCount < maxCycles) {
        setCurrentEmoji(giftEmojis[Math.floor(Math.random() * giftEmojis.length)])
        cycleCount++

        if (cycleCount > 30) {
          interval += 40
        }

        setTimeout(cycleEmojis, interval)
      } else {
        setTimeout(() => {
          setRevealedPairing(pairing.giver.name)
          setIsRevealing(false)
        }, 500)
      }
    }

    cycleEmojis()
  }

  const handleReset = () => {
    setSelectedParticipant(null)
    setRevealedPairing(null)
    setCurrentEmoji("🎁")
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-christmas-red/10 via-white to-christmas-green/10">
      <Snowfall />

      {/* Exit button */}
      <Link href={`/admin/events/${event.id}`} className="fixed left-4 top-4 z-50">
        <Button variant="outline" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </Link>

      {/* Main content */}
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        {!selectedParticipant ? (
          // Participant selection grid
          <div className="w-full max-w-6xl space-y-8">
            <div className="text-center">
              <h1 className="mb-2 font-(family-name:--font-christmas) text-5xl font-bold text-christmas-red md:text-7xl">
                {event.title}
              </h1>
              {event.description && <p className="text-xl text-foreground/80 md:text-2xl">{event.description}</p>}
              <p className="mt-4 text-lg text-muted-foreground">Click a name to reveal their Secret Santa pairing</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  className="cursor-pointer border-2 border-christmas-green/30 bg-white/90 p-6 text-center transition-all hover:scale-105 hover:border-christmas-green hover:shadow-lg"
                  onClick={() => handleSelectParticipant(participant.id)}
                >
                  <p className="text-xl font-semibold text-foreground">{participant.name}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Reveal animation
          <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <h2 className="mb-4 font-(family-name:--font-christmas) text-4xl font-bold text-christmas-green md:text-6xl">
                {participants.find((p) => p.id === selectedParticipant)?.name}'s
              </h2>
              <p className="text-2xl text-foreground/80 md:text-3xl">Secret Santa was...</p>
            </div>

            {!revealedPairing ? (
              <div className="flex flex-col items-center gap-6">
                <div className={`text-9xl transition-transform md:text-[12rem] ${isRevealing ? "animate-spin" : ""}`}>
                  {currentEmoji}
                </div>
                <Sparkles className="h-12 w-12 animate-pulse text-christmas-gold" />
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-1000 space-y-6 text-center">
                <div className="text-8xl md:text-9xl">🎁</div>
                <p className="font-(family-name:--font-christmas) text-6xl font-bold text-christmas-red md:text-8xl">
                  {revealedPairing}
                </p>
                <div className="mt-8 flex items-center justify-center gap-4 text-5xl">
                  <span>🎄</span>
                  <span>⭐</span>
                  <span>🎅</span>
                  <span>⭐</span>
                  <span>🎄</span>
                </div>
                <Button onClick={handleReset} size="lg" className="mt-8">
                  Next Participant
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
