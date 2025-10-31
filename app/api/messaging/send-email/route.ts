import { type NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, subject, html, text } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "To, subject, and html are required" }, { status: 400 })
    }

    const success = await sendEmail({ to, subject, html, text })

    if (!success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in send email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
