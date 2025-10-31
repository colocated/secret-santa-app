import { redirect } from "next/navigation"
import { requireAdminSession } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { EventsList } from "@/components/admin/events-list"
import { Snowfall } from "@/components/snowfall"

export default async function AdminPage() {
  try {
    const session = await requireAdminSession()
    const supabase = await createClient()

    // Fetch all events
    const { data: events, error } = await supabase
      .from("events")
      .select("*, participants:participants(count)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
    }

    return (
      <div className="relative min-h-screen bg-linear-to-b from-blue-50 to-white">
        <Snowfall />
        <AdminHeader user={session} />
        <main className="container relative z-10 mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 font-(family-name:--font-christmas) text-4xl font-bold text-christmas-red">
              Secret Santa Admin Panel
            </h1>
            <p className="text-lg text-foreground/80">Manage your Secret Santa events and participants</p>
          </div>
          <EventsList events={events || []} />
        </main>
      </div>
    )
  } catch {
    redirect("/admin/login")
  }
}
