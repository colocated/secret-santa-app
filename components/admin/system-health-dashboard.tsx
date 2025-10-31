"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SystemHealthDashboardProps {
  auditLogs: Array<{
    id: string
    action: string
    resource_type: string
    resource_id: string | null
    details: any
    created_at: string
    admin: {
      discord_username: string | null
      google_email: string | null
    } | null
  }>
}

export function SystemHealthDashboard({ auditLogs }: SystemHealthDashboardProps) {
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false)
  const [emailTest, setEmailTest] = useState({ to: "", subject: "Test Email", message: "This is a test email." })
  const [whatsAppTest, setWhatsAppTest] = useState({ to: "", countryCode: "+1", message: "This is a test message." })

  const handleTestEmail = async () => {
    setIsTestingEmail(true)

    try {
      const response = await fetch("/api/messaging/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTest.to,
          subject: emailTest.subject,
          html: `<p>${emailTest.message}</p>`,
          text: emailTest.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send test email")
      }

      toast.success("Test email sent successfully!")
    } catch (error) {
      console.error("Error testing email:", error)
      toast.error("Failed to send test email")
    } finally {
      setIsTestingEmail(false)
    }
  }

  const handleTestWhatsApp = async () => {
    setIsTestingWhatsApp(true)

    try {
      const response = await fetch("/api/messaging/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: `${whatsAppTest.countryCode}${whatsAppTest.to}`,
          message: whatsAppTest.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send test WhatsApp message")
      }

      toast.success("Test WhatsApp message sent successfully!")
    } catch (error) {
      console.error("Error testing WhatsApp:", error)
      toast.error("Failed to send test WhatsApp message")
    } finally {
      setIsTestingWhatsApp(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Test Email</CardTitle>
            <CardDescription>Send a test email to verify SMTP configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To Email</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="test@example.com"
                value={emailTest.to}
                onChange={(e) => setEmailTest({ ...emailTest, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailTest.subject}
                onChange={(e) => setEmailTest({ ...emailTest, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailTest.message}
                onChange={(e) => setEmailTest({ ...emailTest, message: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleTestEmail} disabled={isTestingEmail || !emailTest.to} className="w-full">
              {isTestingEmail ? "Sending..." : "Send Test Email"}
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Test WhatsApp</CardTitle>
            <CardDescription>Send a test WhatsApp message to verify API configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-to">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={whatsAppTest.countryCode}
                  onValueChange={(value) => setWhatsAppTest({ ...whatsAppTest, countryCode: value })}
                >
                  <SelectTrigger className="w-24">
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
                  id="whatsapp-to"
                  type="tel"
                  placeholder="1234567890"
                  value={whatsAppTest.to}
                  onChange={(e) => setWhatsAppTest({ ...whatsAppTest, to: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Message</Label>
              <Textarea
                id="whatsapp-message"
                value={whatsAppTest.message}
                onChange={(e) => setWhatsAppTest({ ...whatsAppTest, message: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleTestWhatsApp} disabled={isTestingWhatsApp || !whatsAppTest.to} className="w-full">
              {isTestingWhatsApp ? "Sending..." : "Send Test WhatsApp"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
          <CardDescription>Track all admin actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No audit logs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>{log.admin?.discord_username || log.admin?.google_email || "System"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.resource_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{JSON.stringify(log.details)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
