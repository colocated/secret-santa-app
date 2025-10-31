import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAuthCodeExpired } from "@/lib/auth-code"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { code, participantId } = await request.json()

    if (!code || !participantId) {
      return NextResponse.json({ error: "Code and participant ID are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the auth code
    const { data: authCode, error: authCodeError } = await supabase
      .from("auth_codes")
      .select("*")
      .eq("participant_id", participantId)
      .eq("code", code)
      .eq("verified", false)
      .single()

    if (authCodeError || !authCode) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    // Check if expired
    if (isAuthCodeExpired(authCode.expires_at)) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 })
    }

    // Mark as verified
    await supabase
      .from("auth_codes")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", authCode.id)

    // Set a cookie to remember verification
    const cookieStore = await cookies()
    cookieStore.set(`auth_verified_${participantId}`, "true", {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in verify auth code API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
