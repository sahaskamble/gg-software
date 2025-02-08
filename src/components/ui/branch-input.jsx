import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function BranchInput({ value, onChange }) {
  const [inputValue, setInputValue] = React.useState("")

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      // Add the new branch if it's not already in the array
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()])
      }
      setInputValue("")
    }
  }

  const removeBranch = (branchToRemove) => {
    onChange(value.filter(branch => branch !== branchToRemove))
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type branch name and press Enter"
      />
      <div className="flex flex-wrap gap-2">
        {value.map((branch) => (
          <Badge
            variant="secondary"
            key={branch}
            className="px-2 py-1"
          >
            {branch}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removeBranch(branch)}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
