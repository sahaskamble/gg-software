"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roleColors = {
  SuperAdmin: "bg-red-500 cursor-pointer",
  Admin: "bg-blue-500 cursor-pointer",
  StoreManager: "bg-green-500 cursor-pointer",
  Staff: "bg-orange-500 cursor-pointer",
};

export function StaffTable({ users, currentUserRole, onRoleUpdate }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    // Fetch branch data if necessary
  }, []);

  const handleRoleChange = async (userId, newRole, oldRole) => {
    // Ask for confirmation before changing role
    if (!confirm(`Are you sure you want to change this user's role from ${oldRole} to ${newRole}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      toast({
        title: "Success",
        description: `Staff role successfully updated from ${oldRole} to ${newRole}`
      });
      onRoleUpdate?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error updating role"
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canEditRole = currentUserRole === "SuperAdmin";

  return (
    <div className="space-y-4">
      {canEditRole && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As a SuperAdmin, you can change staff roles by clicking on their role badge and selecting a new role from the dropdown.
            Note: SuperAdmin roles cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Username</TableHead>
              <TableHead className="w-[120px]">Current Role</TableHead>
              <TableHead className="min-w-[200px]">Branch</TableHead>
              <TableHead className="w-[150px]">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  {canEditRole && user.role !== "SuperAdmin" ? (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(newRole) => handleRoleChange(user._id, newRole, user.role)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge className={roleColors[user.role]}>
                            {user.role}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="StoreManager">Store Manager</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={roleColors[user.role]}>
                      {user.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="truncate max-w-[200px]">
                  {user.branchName?.join(", ") || "No branch assigned"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
