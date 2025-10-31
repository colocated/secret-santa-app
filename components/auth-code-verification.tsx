"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Shield } from "lucide-react"

interface AuthCodeVerificationProps {
  participantId: string
  participantName: string
  onVerified: () => void
}

export function AuthCodeVerification({ participantId, participantName, onVerified }: AuthCodeVerificationProps) {
  const t = useTranslations("pairing")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code")
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch("/api/auth-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, participantId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "Code has expired") {
          toast.error(t("codeExpired"))
        } else {
          toast.error(t("invalidCode"))
        }
        return
      }

      toast.success("Verified successfully!")
      router.refresh()
      onVerified()
    } catch (error) {
      console.error("[v0] Error verifying code:", error)
      toast.error("Failed to verify code")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRequestCode = async () => {
    setIsRequesting(true)

    try {
      const response = await fetch("/api/auth-code/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate code")
      }

      toast.success("A new code has been sent to your email/phone")
    } catch (error) {
      console.error("[v0] Error requesting code:", error)
      toast.error("Failed to send code")
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-4 border-christmas-red/20 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-christmas-green/10">
            <Shield className="h-8 w-8 text-christmas-green" />
          </div>
          <CardTitle className="font-[family-name:var(--font-christmas)] text-3xl text-christmas-red">
            {t("authRequired")}
          </CardTitle>
          <CardDescription className="text-base">
            Hello, {participantName}! {t("enterAuthCode")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("authCode")}</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button onClick={handleVerify} disabled={isVerifying || code.length !== 6} className="w-full">
            {isVerifying ? "Verifying..." : t("verify")}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={handleRequestCode} disabled={isRequesting} className="text-sm">
              {isRequesting ? "Sending..." : "Request a new code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
