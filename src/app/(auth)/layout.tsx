'use client'

import { SideNav } from "@/components/layout/side-nav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return null
  }

  return (
    // <div className="flex min-h-screen bg-background">
    <>
      <SideNav />
      <main className="flex-1 w-full lg:pl-[250px]">
        <div className="container p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  )
}
