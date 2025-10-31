import { type NextRequest, NextResponse } from "next/server"
import { getDiscordAuthUrl } from "@/lib/discord-auth"

export async function GET(request: NextRequest) {
  try {
    const redirectUri = request.nextUrl.searchParams.get("redirect_uri")

    if (!redirectUri) {
      return NextResponse.json({ error: "Missing redirect_uri" }, { status: 400 })
    }

    const authUrl = getDiscordAuthUrl(redirectUri)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error in Discord auth route:", error)
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent("Failed to initiate Discord login")}`, request.url),
    )
  }
}
