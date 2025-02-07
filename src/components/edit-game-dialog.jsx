"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function EditGameDialog({ open, onOpenChange, onSuccess, game }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    numberOfPlayers: "",
    description: "",
    isAvailable: true
  });

  const { toast } = useToast();

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title,
        numberOfPlayers: game.numberOfPlayers.toString(),
        description: game.description || "",
        isAvailable: game.isAvailable
      });
    }
  }, [game]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  const validateForm = () => {
    if (!formData.title || !formData.numberOfPlayers) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/games/edit', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: game._id,
          ...formData,
          numberOfPlayers: parseInt(formData.numberOfPlayers),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update game");
      }

      toast({
        title: "Success",
        description: "Game updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update game",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this game?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/games/${game._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete game");
      }

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete game",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Game Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter game title"
                required
              />
            </div>
            <div>
              <Label htmlFor="numberOfPlayers">Number of Players</Label>
              <Input
                id="numberOfPlayers"
                name="numberOfPlayers"
                type="number"
                min="1"
                value={formData.numberOfPlayers}
                onChange={handleChange}
                placeholder="Enter number of players"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter game description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isAvailable">Game is available</Label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Game
            </Button>
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
