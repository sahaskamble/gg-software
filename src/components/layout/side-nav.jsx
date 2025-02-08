'use client'

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Gamepad2,
  Dice1,
  Clock,
  Coffee,
  Users,
  Settings,
  LogOut,
  Menu
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Games",
    href: "/games",
    icon: Dice1
  },
  {
    title: "Sessions",
    href: "/booking",
    icon: Clock
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Coffee
  },
  {
    title: "Staff",
    href: "/staff",
    icon: Users
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="sticky top-0 z-50 w-full flex items-center h-16 px-4 border-b bg-background lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80%] sm:w-[300px]">
            <SheetHeader className="border-b p-4">
              <SheetTitle>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6" />
                  <span className="font-semibold">Game Ground</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <NavFooter />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            <span className="font-semibold">Game Ground</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 z-40 flex-col h-full w-[250px] border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            <span className="font-semibold">Game Ground</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <NavFooter />
        </div>
      </div>
      {/* Mobile Navigation */}
      {/* <div className="sticky top-0 z-40 flex items-center h-16 px-4 border-b bg-background lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[300px]">
            <nav className="flex flex-col h-full">
              <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <Gamepad2 className="h-6 w-6" />
                  <span>Game Ground</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 py-2">
                <div className="space-y-1 p-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                        pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </ScrollArea>
              <NavFooter />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex items-center justify-between px-4">
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 font-semibold">
            <Gamepad2 className="h-6 w-6" />
            <span>Game Ground</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex fixed top-0 left-0 z-40 flex-col h-full w-[250px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Gamepad2 className="h-6 w-6" />
            <span>Game Ground</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <NavFooter />
      </div>
    </>
  )
}

function NavFooter() {
  const { data: session } = useSession()

  return (
    <div className="mt-auto border-t">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {session?.user?.username?.charAt(0) || session?.user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {session?.user?.username || session?.user?.username || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {session?.user?.role || ''}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </div>
  )
}
