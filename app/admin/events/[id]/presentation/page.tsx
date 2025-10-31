import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PresentationMode } from "@/components/admin/presentation-mode"

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch event with participants and pairings
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      *,
      participants (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Fetch pairings
  const { data: pairings } = await supabase
    .from("pairings")
    .select(
      `
      id,
      giver:giver_id (
        id,
        name
      ),
      receiver:receiver_id (
        id,
        name
      )
    `,
    )
    .eq("event_id", id)

  return (
    <PresentationMode
      event={{
        id: event.id,
        title: event.title,
        description: event.description,
      }}
      participants={event.participants || []}
      pairings={pairings || []}
    />
  )
}
