"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Crown } from "lucide-react"

export default function SetupOwnerPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleClaimOwnership = async () => {
    if (!code) {
      toast.error("Please enter the owner code")
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch("/api/admin/claim-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        toast.error(t("invalidOwnerCode"))
        return
      }

      toast.success("Ownership claimed successfully!")
      router.push("/admin")
    } catch (error) {
      console.error("Error claiming ownership:", error)
      toast.error("Failed to claim ownership")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md border-4 border-christmas-gold/30 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-christmas-gold/20">
            <Crown className="h-8 w-8 text-christmas-gold" />
          </div>
          <CardTitle className="font-[family-name:var(--font-christmas)] text-3xl text-christmas-red">
            {t("systemOwnerSetup")}
          </CardTitle>
          <CardDescription className="text-base">{t("enterOwnerCode")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("ownerCode")}</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter the code from server console"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          <Button onClick={handleClaimOwnership} disabled={isVerifying || !code} className="w-full">
            {isVerifying ? "Verifying..." : t("claimOwnership")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Check your server console for the system owner code. This code is only shown once when the first admin
            attempts to log in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
