import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("participants").delete().eq("id", id)

    if (error) {
      console.error("Error deleting participant:", error)
      return NextResponse.json({ error: "Failed to delete participant" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete participant API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
