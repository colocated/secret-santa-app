"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shuffle, AlertCircle, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface Participant {
  id: string
  name: string
}

interface Pairing {
  id: string
  giver: { id: string; name: string }
  receiver: { id: string; name: string }
  revealed: boolean
}

interface PairingsManagerProps {
  eventId: string
  participants: Participant[]
  pairings: Pairing[]
  hidePairingsFromAdmins: boolean
}

export function PairingsManager({ eventId, participants, pairings, hidePairingsFromAdmins }: PairingsManagerProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePairings = async () => {
    if (participants.length < 3) {
      toast.error("You need at least 3 participants to generate pairings")
      return
    }

    if (pairings.length > 0) {
      if (!confirm("This will delete existing pairings. Are you sure?")) return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/admin/pairings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) throw new Error("Failed to generate pairings")

      toast.success("Pairings generated successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error generating pairings:", error)
      toast.error("Failed to generate pairings")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Pairings</CardTitle>
          <CardDescription>Automatically create Secret Santa pairings for all participants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {participants.length < 3 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You need at least 3 participants to generate pairings.</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleGeneratePairings}
            disabled={isGenerating || participants.length < 3}
            className="bg-christmas-green hover:bg-christmas-green/90"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {pairings.length > 0 ? "Regenerate Pairings" : "Generate Pairings"}
          </Button>
          {pairings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Warning: Regenerating will delete all existing pairings and create new ones.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Pairings ({pairings.length})</CardTitle>
          <CardDescription>
            {hidePairingsFromAdmins ? "Pairings are hidden for privacy" : "View who is giving to whom"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hidePairingsFromAdmins ? (
            <div className="space-y-4 py-8 text-center">
              <EyeOff className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Pairings are hidden</p>
                <p className="text-sm text-muted-foreground">
                  Privacy mode is enabled. Pairings are hidden to maintain the surprise. You can still send links to
                  participants via WhatsApp or email.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                To view pairings, disable "Hide Pairings from Admins" in Event Settings.
              </p>
            </div>
          ) : pairings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No pairings yet. Generate pairings to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giver</TableHead>
                  <TableHead>→</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairings.map((pairing) => (
                  <TableRow key={pairing.id}>
                    <TableCell className="font-medium">{pairing.giver.name}</TableCell>
                    <TableCell className="text-center">🎁</TableCell>
                    <TableCell className="font-medium">{pairing.receiver.name}</TableCell>
                    <TableCell>
                      <Badge variant={pairing.revealed ? "default" : "secondary"}>
                        {pairing.revealed ? "Revealed" : "Not Revealed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
