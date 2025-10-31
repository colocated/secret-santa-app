import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { PairingReveal } from "@/components/pairing-reveal"
import { AuthCodeVerification } from "@/components/auth-code-verification"
import { Snowfall } from "@/components/snowfall"
import { ChristmasDecorations } from "@/components/christmas-decorations"

interface PairingPageProps {
  params: Promise<{
    link: string
  }>
}

export default async function PairingPage({ params }: PairingPageProps) {
  const { link } = await params
  const supabase = await createClient()

  // Fetch participant by unique link
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("*")
    .eq("unique_link", link)
    .single()

  if (participantError || !participant) {
    notFound()
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", participant.event_id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  const cookieStore = await cookies()
  const verifiedCookie = cookieStore.get(`verified_${participant.id}`)
  const isVerified = verifiedCookie?.value === "true"

  // If auth codes are required and user is not verified, show verification
  if (event.require_auth_codes && !isVerified) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
        <Snowfall />
        <ChristmasDecorations />
        <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <AuthCodeVerification
            participantId={participant.id}
            participantName={participant.name}
            eventTitle={event.title}
          />
        </main>
      </div>
    )
  }

  // Check if event is closed
  if (event.status === "closed") {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
        <Snowfall />
        <ChristmasDecorations />
        <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="text-center">
            <h1 className="mb-4 font-(family-name:--font-christmas) text-6xl font-bold text-christmas-red">
              Event Closed
            </h1>
            <p className="text-xl text-foreground/80">
              {event.closure_message || "This Secret Santa event has ended. Thank you for participating!"}
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Fetch pairing
  const { data: pairing, error: pairingError } = await supabase
    .from("pairings")
    .select(`
      *,
      receiver:receiver_id (
        id,
        name,
        email
      )
    `)
    .eq("giver_id", participant.id)
    .single()

  if (pairingError || !pairing) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
        <Snowfall />
        <ChristmasDecorations />
        <main className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="text-center">
            <h1 className="mb-4 font-(family-name:--font-christmas) text-6xl font-bold text-christmas-red">
              No Pairing Yet
            </h1>
            <p className="text-xl text-foreground/80">
              Your Secret Santa pairing hasn't been assigned yet. Please check back later!
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
      <Snowfall />
      <ChristmasDecorations />
      <PairingReveal event={event} participant={participant} pairing={pairing} link={link} />
    </div>
  )
}
