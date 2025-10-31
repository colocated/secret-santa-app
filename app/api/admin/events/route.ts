import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get admin user ID
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("discord_id", session.id).single()

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description: description || null,
        status: "active",
        created_by: adminUser?.id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating event:", error)
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("[v0] Error in create event API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
