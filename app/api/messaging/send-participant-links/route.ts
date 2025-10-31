import { type NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, generatePairingEmail } from "@/lib/email"
import { sendWhatsAppMessage, formatPhoneNumber } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, method } = await request.json()

    if (!eventId || !method) {
      return NextResponse.json({ error: "Event ID and method are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get event details
    const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", eventId)

    if (participantsError || !participants) {
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const participant of participants) {
      const pairingLink = `${request.nextUrl.origin}/pairing/${participant.unique_link}`

      if (method === "email" && participant.email) {
        const emailMessage = generatePairingEmail(participant.name, event.title, pairingLink)
        emailMessage.to = participant.email

        const success = await sendEmail(emailMessage)
        if (success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`Failed to send email to ${participant.name}`)
        }
      } else if (method === "whatsapp" && participant.phone_number) {
        const message = `🎅 Hello ${participant.name}!\n\nYou've been invited to ${event.title}!\n\nView your Secret Santa pairing here:\n${pairingLink}\n\nRemember to keep it secret! 🤫`

        const formattedNumber = formatPhoneNumber(participant.country_code || "+1", participant.phone_number)
        const success = await sendWhatsAppMessage(formattedNumber, message)

        if (success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`Failed to send WhatsApp to ${participant.name}`)
        }
      } else {
        results.failed++
        results.errors.push(`${participant.name} has no ${method === "email" ? "email" : "phone number"}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Error in send participant links API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
