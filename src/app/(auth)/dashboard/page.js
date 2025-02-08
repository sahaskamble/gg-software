'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import {
  Users,
  DollarSign,
  CreditCard,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export default function DashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, status])

  // Prepare data for charts
  const sessionAmountData = dashboardData?.recentSessions?.map(session => ({
    name: new Date(session.sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: session.totalAmount
  })).reverse() || []

  console.log('Session Amount Data:', sessionAmountData)

  const gameDistributionData = dashboardData?.recentSessions?.reduce((acc, session) => {
    const existingGame = acc.find(item => item.name === session?.game?.title)
    if (existingGame) {
      existingGame.sessions += 1
      existingGame.amount += session.totalAmount
    } else {
      acc.push({
        name: session?.game?.title,
        sessions: 1,
        amount: session?.totalAmount
      })
    }
    return acc
  }, []) || []

  console.log('Game Distribution Data:', gameDistributionData)
  console.log('Dashboard Data:', dashboardData)

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Unauthenticated User</div>
      </div>
    )
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-3 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome back! Here&apos;s your gaming center overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" className="w-full md:w-auto">Download Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{dashboardData?.stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  ₹{dashboardData?.stats?.totalSales?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue generated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  ₹{dashboardData?.stats?.todaySales?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue generated today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{dashboardData?.stats?.activeSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active gaming sessions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Session Revenue</CardTitle>
                <CardDescription>
                  Revenue from recent gaming sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] md:h-[300px] w-full">
                  {sessionAmountData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sessionAmountData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `₹${value}`}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(value) => [`₹${value}`, 'Amount']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            color: 'hsl(var(--foreground))',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--primary))"
                          fill="url(#colorAmount)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No session data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Game Distribution</CardTitle>
                <CardDescription>
                  Revenue distribution by game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] md:h-[300px] w-full">
                  {gameDistributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gameDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <XAxis
                          dataKey="name"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `₹${value}`}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(value) => [`₹${value}`, 'Amount']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            color: 'hsl(var(--foreground))',
                            fontSize: '12px'
                          }}
                        />
                        <Bar
                          dataKey="amount"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No game distribution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  Latest gaming sessions and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentSessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2 sm:gap-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{session.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {session?.game?.title} on {session?.device?.name}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">₹{session?.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session?.sessionStart).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Stats Overview</CardTitle>
                <CardDescription>
                  Summary of gaming center performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Total Sessions</p>
                  <span className="text-sm font-bold">{dashboardData?.stats?.totalSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Today &apos s Sessions</p>
                  <span className="text-sm font-bold">{dashboardData?.stats?.todaySessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Unique Customers</p>
                  <span className="text-sm font-bold">{dashboardData?.stats?.totalUniqueCustomers || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
