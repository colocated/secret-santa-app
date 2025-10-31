import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateAuthCode } from "@/lib/auth-code"

export async function POST(request: NextRequest) {
  try {
    const { participantId, expiryHours } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("*, event:events(*)")
      .eq("id", participantId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    // Generate auth code
    const code = generateAuthCode()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (expiryHours || participant.event.auth_code_expiry_hours || 24))

    // Delete any existing unverified codes for this participant
    await supabase.from("auth_codes").delete().eq("participant_id", participantId).eq("verified", false)

    // Create new auth code
    const { data: authCode, error: authCodeError } = await supabase
      .from("auth_codes")
      .insert({
        participant_id: participantId,
        code,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (authCodeError) {
      console.error("Error creating auth code:", authCodeError)
      return NextResponse.json({ error: "Failed to create auth code" }, { status: 500 })
    }

    return NextResponse.json({ authCode, participant })
  } catch (error) {
    console.error("Error in generate auth code API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
