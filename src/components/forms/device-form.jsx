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

export function DeviceForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      screenNumber: "",
      numberOfControllers: "",
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
      const response = await fetch("/api/device/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add device");
      }

      toast({
        title: "Success",
        description: "Device added successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error adding device",
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
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter device name" {...field} />
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
          name="screenNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Screen Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter screen number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfControllers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Controllers</FormLabel>
              <FormControl>
                <Input placeholder="Enter number of controllers" {...field} />
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
                <select {...field} className="input">
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Device"}
        </Button>
      </form>
    </Form>
  );
}
