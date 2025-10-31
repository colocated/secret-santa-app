"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Eye, EyeOff, Presentation } from "lucide-react"
import Link from "next/link"

interface EventSettingsProps {
  event: {
    id: string
    title: string
    description: string | null
    status: "active" | "closed"
    closure_message: string | null
    hide_pairings_from_admins: boolean
  }
}

export function EventSettings({ event }: EventSettingsProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    status: event.status,
    closureMessage: event.closure_message || "",
    hidePairingsFromAdmins: event.hide_pairings_from_admins || false,
  })

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          closure_message: formData.closureMessage || null,
          hide_pairings_from_admins: formData.hidePairingsFromAdmins,
        }),
      })

      if (!response.ok) throw new Error("Failed to update event")

      toast.success("Event updated successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error("Failed to update event")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete event")

      toast.success("Event deleted successfully!")
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Update event information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.hidePairingsFromAdmins ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            Privacy Settings
          </CardTitle>
          <CardDescription>Control who can see the Secret Santa pairings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hide Pairings from Admins</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, admins cannot see who is paired with whom. Perfect for maintaining the surprise when the
                host is also participating.
              </p>
            </div>
            <Switch
              checked={formData.hidePairingsFromAdmins}
              onCheckedChange={(checked) => setFormData({ ...formData, hidePairingsFromAdmins: checked })}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Update Privacy Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-christmas-green/30 bg-christmas-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Presentation Mode
          </CardTitle>
          <CardDescription>Display pairings on a TV or projector with a fun reveal animation</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/admin/events/${event.id}/presentation`}>
            <Button className="w-full bg-transparent" variant="outline">
              Open Presentation Mode
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Status</CardTitle>
          <CardDescription>Control whether participants can view their pairings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Event Status</Label>
              <p className="text-sm text-muted-foreground">
                {formData.status === "active" ? "Event is active" : "Event is closed"}
              </p>
            </div>
            <Switch
              checked={formData.status === "active"}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "closed" })}
            />
          </div>
          {formData.status === "closed" && (
            <div className="space-y-2">
              <Label htmlFor="closureMessage">Closure Message</Label>
              <Textarea
                id="closureMessage"
                placeholder="Thank you for participating in our Secret Santa event!"
                value={formData.closureMessage}
                onChange={(e) => setFormData({ ...formData, closureMessage: e.target.value })}
                rows={3}
              />
            </div>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this event and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} className="w-full">
            Delete Event
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
