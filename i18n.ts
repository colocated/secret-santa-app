import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

export default getRequestConfig(async () => {
  // Get locale from cookie or detect from browser
  const cookieStore = await cookies();
  let locale = cookieStore.get('locale')?.value;

  // If no cookie, try to detect from Accept-Language header
  if (!locale) {
    const accept = (await headers()).get('Accept-Language') || '';
    const detected = accept.split(',')[0]?.split('-')[0];

    if (detected) locale = detected;
    else          locale = "en"; // Default to English
  }

  // Validate locale
  const TRANSLATABLE_LANGUAGES = ["en", "es"];
  if (!TRANSLATABLE_LANGUAGES.includes(locale)) locale = "en";

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }

});
