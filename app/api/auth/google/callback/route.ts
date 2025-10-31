import { type NextRequest, NextResponse } from "next/server"
import { exchangeGoogleCode, getGoogleUser } from "@/lib/google-auth"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { generateSystemOwnerCode, logSystemOwnerCode } from "@/lib/system-owner"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error || !code) {
      return NextResponse.redirect(new URL("/admin/login?error=google_auth_failed", request.url))
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`
    const accessToken = await exchangeGoogleCode(code, redirectUri)
    const googleUser = await getGoogleUser(accessToken)

    const supabase = await createClient()

    // Check if this is the first admin (system owner setup)
    const { data: existingAdmins, error: countError } = await supabase.from("admin_users").select("id").limit(1)

    if (countError) {
      console.error("[v0] Error checking admin count:", countError)
      return NextResponse.redirect(new URL("/admin/login?error=database_error", request.url))
    }

    const isFirstAdmin = !existingAdmins || existingAdmins.length === 0

    if (isFirstAdmin) {
      // Generate system owner code and show in console
      const ownerCode = generateSystemOwnerCode()
      logSystemOwnerCode(ownerCode)

      // Store the code in system settings
      await supabase.from("system_settings").upsert({
        key: "system_owner_code",
        value: ownerCode,
      })

      // Redirect to system owner setup page
      const cookieStore = await cookies()
      cookieStore.set("pending_google_user", JSON.stringify(googleUser), {
        maxAge: 600, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })

      return NextResponse.redirect(new URL("/admin/setup-owner", request.url))
    }

    // Check if user is an approved admin
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("google_email", googleUser.email)
      .single()

    if (adminError || !admin) {
      return NextResponse.redirect(new URL("/admin/login?error=not_authorized", request.url))
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
    console.error("[v0] Error in Google callback:", error)
    return NextResponse.redirect(new URL("/admin/login?error=google_auth_failed", request.url))
  }
}
