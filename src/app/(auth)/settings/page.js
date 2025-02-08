"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pricing, setPricing] = useState({
    singlePlayerPrice: "",
    multiPlayerPrice: "",
  });
  const [editValues, setEditValues] = useState({
    singlePlayerPrice: "",
    multiPlayerPrice: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing/fetch");
        if (!response.ok) throw new Error("Failed to fetch pricing");
        const data = await response.json();
        if (data && data[0]) {
          const prices = {
            singlePlayerPrice: data[0].singlePlayerPrice.toString(),
            multiPlayerPrice: data[0].multiPlayerPrice.toString(),
          };
          setPricing(prices);
          setEditValues(prices);
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load pricing settings",
        });
      }
    };
    fetchPricing();
  }, [toast]);

  const handleOpenDialog = () => {
    setEditValues(pricing);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePrices = () => {
    const singlePrice = parseFloat(editValues.singlePlayerPrice);
    const multiPrice = parseFloat(editValues.multiPlayerPrice);

    if (isNaN(singlePrice) || isNaN(multiPrice)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid numbers for both prices",
      });
      return false;
    }

    if (singlePrice < 0 || multiPrice < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Prices cannot be negative",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validatePrices()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/pricing/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          singlePlayerPrice: parseFloat(editValues.singlePlayerPrice),
          multiPlayerPrice: parseFloat(editValues.multiPlayerPrice),
        }),
      });

      if (!response.ok) throw new Error("Failed to update pricing");

      setPricing(editValues);
      handleCloseDialog();

      toast({
        title: "Success",
        description: "Prices updated successfully",
      });
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update pricing",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg md:text-xl">Pricing Settings</CardTitle>
            <Button variant="outline" size="icon" onClick={handleOpenDialog}>
              <Settings2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-medium">Single Player Price</h3>
                <p className="text-sm text-muted-foreground">Price per hour for single player</p>
                <p className="mt-1 text-xl md:text-2xl font-bold">₹{pricing.singlePlayerPrice}</p>
              </div>
              <div className="md:text-right">
                <h3 className="font-medium">Multi Player Price</h3>
                <p className="text-sm text-muted-foreground">Price per person per hour</p>
                <p className="mt-1 text-xl md:text-2xl font-bold">₹{pricing.multiPlayerPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Pricing</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Single Player Price (per hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  name="singlePlayerPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={editValues.singlePlayerPrice}
                  onChange={handleChange}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Multi Player Price (per person/hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  name="multiPlayerPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={editValues.multiPlayerPrice}
                  onChange={handleChange}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
