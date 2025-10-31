"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface RulesManagerProps {
  eventId: string
  rules: string[]
}

export function RulesManager({ eventId, rules: initialRules }: RulesManagerProps) {
  const router = useRouter()
  const [rules, setRules] = useState<string[]>(initialRules || [])
  const [newRule, setNewRule] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAddRule = () => {
    if (!newRule.trim()) return
    setRules([...rules, newRule.trim()])
    setNewRule("")
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleSaveRules = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      })

      if (!response.ok) throw new Error("Failed to save rules")

      toast.success("Rules saved successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error saving rules:", error)
      toast.error("Failed to save rules")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Rules</CardTitle>
        <CardDescription>Set rules and guidelines for participants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new rule..."
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
          />
          <Button onClick={handleAddRule} className="bg-christmas-green hover:bg-christmas-green/90">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No rules set yet. Add some guidelines!</div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <span className="flex-1">{rule}</span>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveRule(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSaveRules} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Rules"}
        </Button>
      </CardContent>
    </Card>
  )
}
