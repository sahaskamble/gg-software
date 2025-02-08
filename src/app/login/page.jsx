'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [branches, setBranches] = useState([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      branch: "",
    }
  })

  const username = form.watch("username")

  // Fetch branches when username changes
  useEffect(() => {
    async function fetchBranches() {
      if (!username) {
        setBranches([])
        return
      }

      setIsLoadingBranches(true)
      try {
        const response = await fetch(`/api/branches?username=${encodeURIComponent(username)}`)
        if (response.ok) {
          const data = await response.json()
          console.log(data)
          setBranches(data.branches)
          // If there's only one branch, auto-select it
          if (data.branches.length === 1) {
            form.setValue("branch", data.branches[0].branchId)
          }
        }
      } catch (error) {
        console.error("Error fetching branches:", error)
      } finally {
        setIsLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [username, form])

  async function onSubmit(values) {
    setError("")

    if (!values.branch) {
      setError("Please select a branch")
      return
    }

    try {
      const res = await signIn("credentials", {
        username: values.username,
        password: values.password,
        branch: values.branch,
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid credentials")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Game Gaming</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch"
                rules={{ required: "Branch selection is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      disabled={!username || isLoadingBranches}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingBranches
                                ? "Loading branches..."
                                : username
                                  ? "Select branch"
                                  : "Enter username first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.branchId}
                            value={branch.branchId}
                          >
                            {branch.branchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
