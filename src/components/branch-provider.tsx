"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Branch {
  branchId: string;
  branchName: string;
}

interface BranchContextType {
  currentBranch: string | null;
  availableBranches: Branch[];
  isLoading: boolean;
  switchBranch: (branchId: string) => Promise<void>;
}

const BranchContext = createContext<BranchContextType>({
  currentBranch: null,
  availableBranches: [],
  isLoading: true,
  switchBranch: async () => {},
})

export function BranchProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status, update: updateSession } = useSession()
  const [currentBranch, setCurrentBranch] = useState<string | null>(session?.user?.branch ?? null)
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available branches for the user
  useEffect(() => {
    const fetchBranches = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user-branches/${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableBranches(data.branches)
          }
        } catch (error) {
          console.error('Error fetching branches:', error)
        }
      }
      setIsLoading(false)
    }

    fetchBranches()
  }, [session?.user?.id])

  // Switch branch function
  const switchBranch = async (branchId: string) => {
    try {
      const response = await fetch('/api/switch-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId }),
      })

      if (response.ok) {
        // Update the session with the new branch
        await updateSession({ branch: branchId })
        setCurrentBranch(branchId)
      }
    } catch (error) {
      console.error('Error switching branch:', error)
    }
  }

  const value = {
    currentBranch,
    availableBranches,
    isLoading: status === "loading" || isLoading,
    switchBranch,
  }

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  )
}

export const useBranch = () => useContext(BranchContext)
