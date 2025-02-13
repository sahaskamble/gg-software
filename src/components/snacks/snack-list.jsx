"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SnackForm } from "@/components/forms/snack-form";

export function SnackList({ onRefresh }) {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSnack, setEditingSnack] = useState(null);
  const { toast } = useToast();

  const fetchSnacks = useCallback(async () => {
    try {
      const response = await fetch("/api/snacks/fetch");
      if (!response.ok) {
        throw new Error("Failed to fetch snacks");
      }
      const data = await response.json();
      setSnacks(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load snacks"
      });
      console.error("Error:", error);
      setSnacks([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSnacks();
  }, [fetchSnacks]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this snack?")) return;

    try {
      const response = await fetch(`/api/snacks/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete snack");
      }

      toast({
        title: "Success",
        description: "Snack deleted successfully"
      });
      fetchSnacks();
      onRefresh?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Error deleting snack")
      });
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (snacks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No snacks found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding some snacks to your inventory
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snacks.map((snack) => (
          <Card key={snack._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {snack.name}
                {snack.stock <= snack.lowStockThreshold && (
                  <Badge variant="destructive" className="ml-2">
                    Low Stock
                  </Badge>
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingSnack(snack)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(snack._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {snack.price.toFixed(2)}</div>
              <CardDescription>
                Stock: {snack.stock} | Min: {snack.lowStockThreshold}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingSnack} onOpenChange={(open) => !open && setEditingSnack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Snack</DialogTitle>
          </DialogHeader>
          <SnackForm
            snack={editingSnack}
            onSuccessAction={() => {
              setEditingSnack(null);
              fetchSnacks();
              onRefresh?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
