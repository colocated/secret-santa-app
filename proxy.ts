import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  let locale = cookieStore.get("NEXT_LOCALE")?.value

  // Detect from Accept-Language header if no cookie
  if (!locale) {
    const acceptLanguage = request.headers.get("accept-language")
    if (acceptLanguage?.includes("es")) {
      locale = "es"
    } else {
      locale = "en"
    }
    // Set the detected locale in response
    const response = NextResponse.next()
    response.cookies.set("NEXT_LOCALE", locale, { maxAge: 31536000 })
  }

  // Handle Supabase session
  const response = await updateSession(request)

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check if user is authenticated admin
    const adminCookie = request.cookies.get("admin_session")

    if (!adminCookie && !request.nextUrl.pathname.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
