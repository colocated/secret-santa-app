import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update the pairing to mark it as revealed
    const { error } = await supabase
      .from("pairings")
      .update({
        revealed: true,
        revealed_at: new Date().toISOString(),
      })
      .eq("giver_id", participantId)

    if (error) {
      console.error("[v0] Error updating pairing:", error)
      return NextResponse.json({ error: "Failed to update pairing" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in reveal-pairing API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
