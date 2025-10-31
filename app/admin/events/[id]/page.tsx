import { notFound, redirect } from "next/navigation"
import { requireAdminSession } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { EventDetails } from "@/components/admin/event-details"
import { Snowfall } from "@/components/snowfall"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const supabase = await createClient()

    // Fetch event with participants and pairings
    const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

    if (eventError || !event) {
      notFound()
    }

    const { data: participants } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", id)
      .order("name", { ascending: true })

    const { data: pairings } = await supabase
      .from("pairings")
      .select(
        `
        *,
        giver:giver_id(id, name),
        receiver:receiver_id(id, name)
      `,
      )
      .eq("event_id", id)

    const hidePairingsFromAdmins = event.hide_pairings_from_admins;

    return (
      <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
        <Snowfall />
        <AdminHeader user={session} />
        <main className="container relative z-10 mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <EventDetails event={event} participants={participants || []} pairings={pairings || []} hidePairingsFromAdmins={hidePairingsFromAdmins} />
        </main>
      </div>
    )
  } catch {
    redirect("/admin/login")
  }
}
