import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the stored system owner code
    const { data: setting, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "system_owner_code")
      .single()

    if (settingError || !setting || setting.value !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    // Get pending user from cookie
    const cookieStore = await cookies()
    const pendingUserCookie = cookieStore.get("pending_google_user") || cookieStore.get("pending_discord_user")

    if (!pendingUserCookie) {
      return NextResponse.json({ error: "No pending user found" }, { status: 400 })
    }

    const pendingUser = JSON.parse(pendingUserCookie.value)

    // Create the system owner admin user
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .insert({
        google_email: pendingUser.email,
        google_id: pendingUser.id,
        discord_username: pendingUser.name || pendingUser.email,
        auth_provider: "google",
        is_system_owner: true,
      })
      .select()
      .single()

    if (adminError) {
      console.error("[v0] Error creating system owner:", adminError)
      return NextResponse.json({ error: "Failed to create system owner" }, { status: 500 })
    }

    // Delete the system owner code
    await supabase.from("system_settings").delete().eq("key", "system_owner_code")

    // Create session
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin.id,
        email: pendingUser.email,
        name: pendingUser.name,
        provider: "google",
      }),
      {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    )

    // Clear pending user cookie
    cookieStore.delete("pending_google_user")
    cookieStore.delete("pending_discord_user")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in claim ownership API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
