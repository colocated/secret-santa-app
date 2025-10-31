import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/admin-auth"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, name, email, phoneNumber, countryCode } = await request.json()

    if (!eventId || !name) {
      return NextResponse.json({ error: "Event ID and name are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Generate unique link
    const uniqueLink = nanoid(12)

    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        event_id: eventId,
        name,
        email: email || null,
        phone_number: phoneNumber || null,
        country_code: countryCode || null,
        unique_link: uniqueLink,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating participant:", error)
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
    }

    return NextResponse.json({ participant })
  } catch (error) {
    console.error("Error in create participant API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
