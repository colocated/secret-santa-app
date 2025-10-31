import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Snowfall } from "@/components/snowfall"
import { ChristmasDecorations } from "@/components/christmas-decorations"

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
      <Snowfall />
      <ChristmasDecorations />
      <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mb-6 text-8xl">🎅</div>
          <h1 className="mb-4 font-(family-name:--font-christmas) text-6xl font-bold text-christmas-red">404</h1>
          <p className="mb-8 text-2xl text-foreground/80">Oops! This page seems to have gotten lost in the snow.</p>
          <Button asChild size="lg" className="bg-christmas-red hover:bg-christmas-red/90">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
