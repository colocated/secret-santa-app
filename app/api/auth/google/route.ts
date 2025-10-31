import { type NextRequest, NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  try {
    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`
    const authUrl = getGoogleAuthUrl(redirectUri)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("[v0] Error in Google auth:", error)
    return NextResponse.redirect(new URL("/admin/login?error=google_auth_failed", request.url))
  }
}
