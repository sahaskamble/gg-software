"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBranch } from "./branch-provider"

export function BranchSwitcher() {
  const { currentBranch, availableBranches, switchBranch, isLoading } = useBranch()

  if (isLoading) {
    return <div>Loading branches...</div>
  }

  if (availableBranches.length === 0) {
    return null
  }

  return (
    <Select
      value={currentBranch || undefined}
      onValueChange={(value) => switchBranch(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {availableBranches.map((branch) => (
          <SelectItem key={branch.branchId} value={branch.branchId}>
            {branch.branchName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
