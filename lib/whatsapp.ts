export interface WhatsAppMessage {
  to: string
  message: string
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL

    if (!apiKey || !apiUrl) {
      console.error("WhatsApp API credentials not configured")
      return false
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to,
        message,
      }),
    })

    if (!response.ok) {
      console.error("WhatsApp API error:", await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return false
  }
}

export function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "")
  const cleanCode = countryCode.replace(/\D/g, "")

  return `${cleanCode}${cleanNumber}`
}

export const countryCodes = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
]
