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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "Game title is required").trim(),
  numberOfPlayers: z.number().min(1, "Number of players must be at least 1"),
  description: z.string().optional().default("No description provided"),
  isAvailable: z.boolean().default(true),
});

export function GameForm({ onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!initialData;
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      numberOfPlayers: initialData?.numberOfPlayers || 1,
      description: initialData?.description || "",
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const url = isEditing ? `/api/games/edit` : "/api/games/add";
      const method = isEditing ? "PUT" : "POST";
      
      if (isEditing) {
        data._id = initialData._id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} game`);
      }

      toast({
        title: "Success",
        description: `Game ${isEditing ? 'updated' : 'added'} successfully`
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Error ${isEditing ? 'updating' : 'creating'} game`
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
          name="title"
          render={({ field, error }) => (
            <FormItem>
              <FormLabel>Game Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter game title" {...field} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfPlayers"
          render={({ field, error }) => (
            <FormItem>
              <FormLabel>Number of Players</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter number of players"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
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
                  placeholder="Enter game description (optional)" 
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of the game
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Availability</FormLabel>
                <FormDescription>
                  Set whether this game is currently available
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Game" : "Add Game")}
        </Button>
      </form>
    </Form>
  );
}
