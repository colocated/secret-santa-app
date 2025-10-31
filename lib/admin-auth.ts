import { cookies } from "next/headers"
import type { DiscordUser } from "./discord-auth"

export async function getAdminSession(): Promise<DiscordUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function requireAdminSession(): Promise<DiscordUser> {
  const session = await getAdminSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return session
}
