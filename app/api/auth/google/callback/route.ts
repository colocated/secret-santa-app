import { type NextRequest, NextResponse } from "next/server"
import { exchangeGoogleCode, getGoogleUser } from "@/lib/google-auth"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error || !code) {
      return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent("Google authentication failed")}`, request.url))
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`
    const accessToken = await exchangeGoogleCode(code, redirectUri)
    const googleUser = await getGoogleUser(accessToken)

    const supabase = await createClient()

    // Check if user is an approved admin
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("google_email", googleUser.email)
      .single()

    if (adminError || !admin) {
      return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent("You are not an approved admin for this instance")}`, request.url))
    }

    // Store or update admin user in database
    const { error: dbError } = await supabase.from("admin_users").upsert(
      {
        google_email: googleUser.email,
        google_id: googleUser.id,
      },
      {
        onConflict: "google_email",
      },
    )

    if (dbError) {
      console.error("Error storing admin user:", dbError)
    }

    // Create session
    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin.id,
        email: googleUser.email,
        name: googleUser.name,
        provider: "google",
      }),
      {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    )

    return NextResponse.redirect(new URL("/admin", request.url))
  } catch (error) {
    console.error("Error in Google callback:", error)
    return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent("Google authentication failed")}`, request.url))
  }
}
