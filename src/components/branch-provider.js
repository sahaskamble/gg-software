"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const BranchContext = createContext({
  currentBranch: null,
  availableBranches: [],
  isLoading: true,
  switchBranch: async () => {},
})

export function BranchProvider({ children }) {
  const { data: session, status, update: updateSession } = useSession()
  const [currentBranch, setCurrentBranch] = useState(session?.user?.branch ?? null)
  const [availableBranches, setAvailableBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  const switchBranch = async (branchId) => {
    try {
      const response = await fetch('/api/switch-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId }),
      })

      if (response.ok) {
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
