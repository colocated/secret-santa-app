import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { rules } = await request.json()

    const supabase = await createClient()

    const { data: event, error } = await supabase.from("events").update({ rules }).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error updating rules:", error)
      return NextResponse.json({ error: "Failed to update rules" }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("[v0] Error in update rules API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
