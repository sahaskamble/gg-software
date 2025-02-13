"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, LogOut } from "lucide-react";

export default function Sidebar({ className }) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      title: "Logout",
      href: "/logout",
      icon: <LogOut className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Nav */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetTitle className="px-4 pt-1">Navigation</SheetTitle>
          <ScrollArea className="h-full py-6">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </Button>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Nav */}
      <nav
        className={cn(
          "hidden lg:block fixed top-0 left-0 h-full border-r w-[240px] py-6",
          className
        )}
      >
        <ScrollArea className="h-full px-3">
          <div className="space-y-4 py-4">
            <div className="py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Game Ground</h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>
      </nav>
    </>
  );
}
