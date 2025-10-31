import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export default getRequestConfig(async () => {
  // Get locale from cookie or detect from browser
  const cookieStore = await cookies()
  let locale = cookieStore.get("NEXT_LOCALE")?.value

  // If no cookie, try to detect from Accept-Language header
  if (!locale) {
    locale = "en" // Default to English
  }

  // Validate locale
  if (!["en", "es"].includes(locale)) {
    locale = "en"
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
