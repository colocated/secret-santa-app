"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CreateEventDialog } from "./create-event-dialog"

interface Event {
  id: string
  title: string
  description: string | null
  status: "active" | "closed"
  created_at: string
  participants?: { count: number }[]
}

interface EventsListProps {
  events: Event[]
}

export function EventsList({ events }: EventsListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Events</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-christmas-green hover:bg-christmas-green/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">🎄</div>
            <h3 className="mb-2 text-xl font-semibold">No events yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Create your first Secret Santa event to get started
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-christmas-green hover:bg-christmas-green/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="border-2 border-christmas-red/20 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant={event.status === "active" ? "secondary" : "default"} className="ml-2">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>
                {event.description && <CardDescription>{event.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>👥</span>
                  <span>{event.participants?.[0]?.count || 0} participants</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/admin/events/${event.id}`}>Manage Event</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEventDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
