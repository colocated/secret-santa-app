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
    const { moodboard } = await request.json()
    const supabase = await createClient()

    const mb = Array.isArray(moodboard) ? moodboard : (moodboard ? [String(moodboard)] : [])

    const { data, error } = await supabase.from("participants").update({ moodboard: mb }).eq("id", id).select().single()

    if (error) {
      console.error("Error updating participant moodboard:", error)
      return NextResponse.json({ error: "Failed to update moodboard" }, { status: 500 })
    }

    return NextResponse.json({ participant: data })
  } catch (error) {
    console.error("Error in update moodboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
