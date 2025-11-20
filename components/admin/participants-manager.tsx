"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Plus, Trash2, MessageCircle, Mail } from "lucide-react"
import { toast } from "sonner"

interface Participant {
  id: string
  name: string
  email: string | null
  phone_number?: string | null
  country_code?: string | null
  unique_link: string
}

interface ParticipantsManagerProps {
  eventId: string
  participants: Participant[]
}

export function ParticipantsManager({ eventId, participants }: ParticipantsManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    countryCode: "+1",
  })

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      const response = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: newParticipant.name,
          email: newParticipant.email || null,
          phoneNumber: newParticipant.phoneNumber || null,
          countryCode: newParticipant.countryCode,
        }),
      })

      if (!response.ok) throw new Error("Failed to add participant")

      toast.success("Participant added successfully!")
      setNewParticipant({ name: "", email: "", phoneNumber: "", countryCode: "+1" })
      router.refresh()
    } catch (error) {
      console.error("Error adding participant:", error)
      toast.error("Failed to add participant")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm("Are you sure you want to delete this participant?")) return

    try {
      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete participant")

      toast.success("Participant deleted successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error deleting participant:", error)
      toast.error("Failed to delete participant")
    }
  }

  const handleSendLink = async (participant: Participant, method: "email" | "whatsapp") => {
    return toast.error(`Link sending via ${method} is currently disabled.`)
    // setIsSending(participant.id)

    // try {
    //   const response = await fetch("/api/messaging/send-participant-links", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       eventId,
    //       participantIds: [participant.id],
    //     }),
    //   })

    //   if (!response.ok) throw new Error("Failed to send link")

    //   const result = await response.json()
    //   if (result.results[0].success) {
    //     toast.success(`Link sent to ${participant.name}!`)
    //   } else {
    //     toast.error(`Failed to send link: ${result.results[0].error}`)
    //   }
    // } catch (error) {
    //   console.error("Error sending link:", error)
    //   toast.error("Failed to send link")
    // } finally {
    //   setIsSending(null)
    // }
  }

  const copyLink = (link: string) => {
    const fullUrl = `${window.location.origin}/pairing/${link}`
    navigator.clipboard.writeText(fullUrl)
    toast.success("Link copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Participant</CardTitle>
          <CardDescription>Add a new person to this Secret Santa event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddParticipant} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number (for WhatsApp)</Label>
                <div className="flex gap-2">
                  <Select
                    value={newParticipant.countryCode}
                    onValueChange={(value) => setNewParticipant({ ...newParticipant, countryCode: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+34">+34 (ES)</SelectItem>
                      <SelectItem value="+52">+52 (MX)</SelectItem>
                      <SelectItem value="+54">+54 (AR)</SelectItem>
                      <SelectItem value="+55">+55 (BR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="1234567890"
                    value={newParticipant.phoneNumber}
                    onChange={(e) => setNewParticipant({ ...newParticipant, phoneNumber: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isAdding} className="bg-christmas-green hover:bg-christmas-green/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
          <CardDescription>Manage participants and send them their unique links</CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No participants yet. Add some to get started!</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Unique Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email || "-"}</TableCell>
                      <TableCell>
                        {participant.phone_number ? `${participant.country_code}${participant.phone_number}` : "-"}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">{participant.unique_link}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(participant.email) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendLink(participant, "email")}
                              disabled={isSending === participant.id}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {(participant.phone_number) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendLink(participant, "whatsapp")}
                              disabled={isSending === participant.id}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => copyLink(participant.unique_link)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
