"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function SnackForm({ snack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: snack?.name || "",
      category: snack?.category || "Eatables",
      price: snack?.price || "",
      stock: snack?.stock || "",
      lowStockThreshold: snack?.lowStockThreshold || 5,
      description: snack?.description || "",
      branch: "",
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/branches");
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Error ${snack ? "updating" : "adding"} snack`,
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Snack Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter snack name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input placeholder="Enter stock" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Threshold</FormLabel>
              <FormControl>
                <Input placeholder="Enter low stock threshold" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input placeholder="Enter branch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Snack"}
        </Button>
      </form>
    </Form>
  );
}
