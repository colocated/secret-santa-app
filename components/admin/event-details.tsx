"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantsManager } from "./participants-manager"
import { RulesManager } from "./rules-manager"
import { PairingsManager } from "./pairings-manager"
import { EventSettings } from "./event-settings"

interface EventDetailsProps {
  event: {
    id: string
    title: string
    description: string | null
    rules: string[]
    status: "active" | "closed"
    closure_message: string | null
    hide_pairings_from_admins: boolean
  }
  participants: Array<{
    id: string
    name: string
    email: string | null
    phone_number?: string | null
    country_code?: string | null
    moodboard?: string[] | null
    unique_link: string
  }>
  pairings: Array<{
    id: string
    giver: { id: string; name: string }
    receiver: { id: string; name: string }
    revealed: boolean
  }>
  hidePairingsFromAdmins: boolean
}

export function EventDetails({ event, participants, pairings, hidePairingsFromAdmins }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState("participants")

  return (
    <div className="space-y-6">
      <Card className="border-4 border-christmas-red/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-(family-name:--font-christmas) text-3xl text-christmas-red">
                {event.title}
              </CardTitle>
              {event.description && <CardDescription className="mt-2 text-base">{event.description}</CardDescription>}
            </div>
            <Badge variant={event.status === "active" ? "secondary" : "default"} className="text-base">
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span className="font-medium">{participants.length} Participants</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <span className="font-medium">{pairings.length} Pairings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👀</span>
              <span className="font-medium">{pairings.filter((p) => p.revealed).length} Revealed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="pairings">Pairings</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="participants">
          <ParticipantsManager eventId={event.id} participants={participants} />
        </TabsContent>
        <TabsContent value="pairings">
          <PairingsManager eventId={event.id} participants={participants} pairings={pairings} hidePairingsFromAdmins={hidePairingsFromAdmins} />
        </TabsContent>
        <TabsContent value="rules">
          <RulesManager eventId={event.id} rules={event.rules} />
        </TabsContent>
        <TabsContent value="settings">
          <EventSettings event={event} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
