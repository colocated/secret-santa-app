import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getDiscordUser, isApprovedAdmin } from "@/lib/discord-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const error = request.nextUrl.searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent("Discord authentication failed")}`, request.url),
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent("Missing authorization code")}`, request.url),
      )
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/discord/callback`
    const accessToken = await exchangeCodeForToken(code, redirectUri)

    if (!accessToken) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent("Failed to exchange authorization code")}`, request.url),
      )
    }

    const discordUser = await getDiscordUser(accessToken)

    if (!discordUser) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent("Failed to fetch Discord user")}`, request.url),
      )
    }

    // Check if user is approved admin
    if (!isApprovedAdmin(discordUser.id)) {
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=${encodeURIComponent("You are not authorized to access the admin panel")}`,
          request.url,
        ),
      )
    }

    // Store or update admin user in database
    const supabase = await createClient()
    const { error: dbError } = await supabase.from("admin_users").upsert(
      {
        discord_id: discordUser.id,
        discord_username: `${discordUser.username}#${discordUser.discriminator}`,
        discord_avatar: discordUser.avatar,
      },
      {
        onConflict: "discord_id",
      },
    )

    if (dbError) {
      console.error("[v0] Error storing admin user:", dbError)
    }

    // Create admin session
    const response = NextResponse.redirect(new URL("/admin", request.url))
    response.cookies.set("admin_session", JSON.stringify(discordUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Error in Discord callback:", error)
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent("An unexpected error occurred")}`, request.url),
    )
  }
}
