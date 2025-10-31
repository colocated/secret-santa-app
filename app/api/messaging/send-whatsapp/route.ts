import { type NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { sendWhatsAppMessage, formatPhoneNumber } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, countryCode, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    const formattedNumber = formatPhoneNumber(countryCode || "+1", to)
    const success = await sendWhatsAppMessage(formattedNumber, message)

    if (!success) {
      return NextResponse.json({ error: "Failed to send WhatsApp message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send WhatsApp API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
