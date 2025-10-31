"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { DiscordUser } from "@/lib/discord-auth"

interface AdminHeaderProps {
  user: DiscordUser
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined

  return (
    <header className="christmas-stripe relative z-20 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-3xl">🎅</span>
            <h2 className="font-(family-name:--font-christmas) text-2xl font-bold text-christmas-red">
              Secret Santa Admin
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-2 ml-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Events</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/system-health">System Health</Link>
            </Button>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/admin">Events</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/system-health">System Health</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
