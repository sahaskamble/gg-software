"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StaffTable } from "@/components/staff/staff-table";
import AddStaffDialog from "@/components/add-staff-dialog";

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/fetch");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load staff data",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.branch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="mt-6 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentUserRole = session?.user?.role || "Staff";

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Staff Management</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage staff roles and permissions
            </p>
          </div>
          <Button 
            onClick={() => setIsAddStaffOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Staff
          </Button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No staff found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? "Try adjusting your search" : "Get started by adding new staff members"}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Button onClick={() => setIsAddStaffOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Staff
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffTable 
              users={filteredUsers}
              currentUserRole={currentUserRole}
              onRoleUpdate={fetchUsers}
            />
          </CardContent>
        </Card>
      )}

      <AddStaffDialog
        open={isAddStaffOpen}
        onOpenChange={setIsAddStaffOpen}
        onSuccess={() => {
          setIsAddStaffOpen(false);
          fetchUsers();
        }}
      />

      <Toaster />
    </div>
  );
}
