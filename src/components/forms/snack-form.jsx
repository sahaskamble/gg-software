"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SnackForm({ snack, onSuccessAction }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  console.log(snack);

  const form = useForm({
    defaultValues: {
      name: snack?.name || "",
      category: snack?.category || "Eatables",
      price: snack?.price || 0,
      stock: snack?.stock || 0,
      lowStockThreshold: snack?.lowStockThreshold || 5,
      description: snack?.description || "",
    },
  });

  const onSubmit = async (data) => {
    console.log(data);
    try {
      setLoading(true);

      if (!snack) {
        const response = await fetch("/api/snacks/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to edit snack");
        }

        toast({
          title: "Success",
          description: "Snack Updated successfully"
        });
        onSuccessAction?.();
      } else {
        const response = await fetch("/api/snacks/edit", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: snack._id, data }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create snack");
        }

        toast({
          title: "Success",
          description: "Snack added successfully"
        });
        onSuccessAction?.();
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Error creating snack")
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Eatables">Eatables</SelectItem>
                  <SelectItem value="Drinks">Drinks</SelectItem>
                </SelectContent>
              </Select>
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
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Enter price"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter stock quantity"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter low stock threshold"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                You will be notified when stock falls below this quantity
              </FormDescription>
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
                <Textarea
                  placeholder="Enter snack description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Snack"}
        </Button>
      </form>
    </Form>
  );
}
