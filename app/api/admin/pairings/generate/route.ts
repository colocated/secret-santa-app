import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/admin-auth"

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch all participants for this event
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("id, name")
      .eq("event_id", eventId)

    if (participantsError || !participants || participants.length < 3) {
      return NextResponse.json({ error: "Need at least 3 participants to generate pairings" }, { status: 400 })
    }

    // Delete existing pairings
    await supabase.from("pairings").delete().eq("event_id", eventId)

    // Create a shuffled copy for receivers
    const receivers = shuffle(participants)

    // Ensure no one is paired with themselves
    for (let i = 0; i < participants.length; i++) {
      if (participants[i].id === receivers[i].id) {
        // Swap with next person (wrapping around if needed)
        const nextIndex = (i + 1) % participants.length
        ;[receivers[i], receivers[nextIndex]] = [receivers[nextIndex], receivers[i]]
      }
    }

    // Create pairings
    const pairings = participants.map((giver, index) => ({
      event_id: eventId,
      giver_id: giver.id,
      receiver_id: receivers[index].id,
      revealed: false,
    }))

    const { error: pairingsError } = await supabase.from("pairings").insert(pairings)

    if (pairingsError) {
      console.error("Error creating pairings:", pairingsError)
      return NextResponse.json({ error: "Failed to create pairings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: pairings.length })
  } catch (error) {
    console.error("Error in generate pairings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
