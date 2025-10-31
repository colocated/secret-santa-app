import { createClient } from "@/lib/supabase/server"
import { requireAdminSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { SystemHealthDashboard } from "@/components/admin/system-health-dashboard"
import { AdminHeader } from "@/components/admin/admin-header"
import { Snowfall } from "@/components/snowfall"

export default async function SystemHealthPage() {
  try {
    const session = await requireAdminSession()
    const supabase = await createClient()

    // Get audit logs
    const { data: auditLogs } = await supabase
      .from("audit_logs")
      .select("*, admin:admin_users(discord_username, google_email)")
      .order("created_at", { ascending: false })
      .limit(50)

    return (
      <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Snowfall />
        <AdminHeader user={session} />
        <main className="container relative z-10 mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-christmas)] text-4xl font-bold text-christmas-red">
              System Health
            </h1>
            <p className="text-muted-foreground mt-2">Test messaging integrations and view system audit logs</p>
          </div>
          <SystemHealthDashboard auditLogs={auditLogs || []} />
        </main>
      </div>
    )
  } catch {
    redirect("/admin/login")
  }
}
