"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock } from "lucide-react";

export function SessionForm({ deviceId, onSuccess }) {
  const [games, setGames] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionTimes, setSessionTimes] = useState({ start: null, end: null });
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    gameId: "",
    numberOfPlayers: "1",
    duration: "60",
    snacks: [], // Array of { snackId, quantity }
    discount: "0",
    rewardPointsUsed: "0",
    totalAmount: "0",
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    // Fetch available games and snacks
    const fetchData = async () => {
      try {
        const [gamesResponse, snacksResponse] = await Promise.all([
          fetch("/api/games/fetch"),
          fetch("/api/snacks/fetch")
        ]);

        if (!gamesResponse.ok || !snacksResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [gamesData, snacksData] = await Promise.all([
          gamesResponse.json(),
          snacksResponse.json()
        ]);

        setGames(gamesData.filter(game => game.isAvailable));
        setSnacks(snacksData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load required data"
        });
      }
    };
    fetchData();
  }, [toast]);

  // Calculate total amount whenever relevant fields change
  useEffect(() => {
    const calculateTotal = async () => {
      try {
        setCalculating(true);
        const selectedGame = games.find(g => g._id === formData.gameId);
        if (!selectedGame) return;

        // Get pricing
        const pricingResponse = await fetch("/api/pricing/fetch");
        if (!pricingResponse.ok) throw new Error("Failed to fetch pricing");
        const pricing = await pricingResponse.json();
        const currentPricing = pricing[0]; // Get the latest pricing

        // Calculate game cost
        const isMultiplayer = parseInt(formData.numberOfPlayers) > 1;
        const pricePerHour = isMultiplayer ? currentPricing.multiPlayerPrice : currentPricing.singlePlayerPrice;
        let gameCost;
        
        if (isMultiplayer) {
          // For multiplayer: price per hour per person * number of players * duration in hours
          gameCost = (pricePerHour * parseInt(formData.numberOfPlayers) * (parseInt(formData.duration) / 60));
        } else {
          // For single player: price per hour * duration in hours
          gameCost = (pricePerHour * (parseInt(formData.duration) / 60));
        }

        // Calculate snacks cost
        const snacksCost = formData.snacks.reduce((total, item) => {
          const snack = snacks.find(s => s._id === item.snackId);
          return total + (snack ? snack.price * item.quantity : 0);
        }, 0);

        // Calculate total
        const subtotal = gameCost + snacksCost;
        const discount = parseFloat(formData.discount) || 0;
        const rewardPoints = parseFloat(formData.rewardPointsUsed) || 0;
        const total = Math.max(0, subtotal - discount - rewardPoints);

        setFormData(prev => ({
          ...prev,
          totalAmount: total.toFixed(2)
        }));
      } catch (error) {
        console.error("Error calculating total:", error);
      } finally {
        setCalculating(false);
      }
    };

    if (formData.gameId && formData.duration && formData.numberOfPlayers) {
      calculateTotal();
    }
  }, [formData.gameId, formData.duration, formData.numberOfPlayers, formData.snacks, formData.discount, formData.rewardPointsUsed, games, snacks]);

  // Update session times whenever duration changes
  useEffect(() => {
    const start = new Date();
    const durationInMs = parseInt(formData.duration) * 60 * 1000;
    const end = new Date(start.getTime() + durationInMs);
    setSessionTimes({ start, end });
  }, [formData.duration]);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName || formData.customerName.length < 2) {
      newErrors.customerName = "Name must be at least 2 characters.";
    }

    if (!formData.contactNumber || formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Contact number must be at least 10 digits.";
    }

    if (!formData.gameId) {
      newErrors.gameId = "Please select a game.";
    }

    const players = parseInt(formData.numberOfPlayers);
    if (isNaN(players) || players < 1) {
      newErrors.numberOfPlayers = "At least 1 player is required.";
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 30) {
      newErrors.duration = "Minimum duration is 30 minutes.";
    }

    const discount = parseFloat(formData.discount);
    if (isNaN(discount) || discount < 0) {
      newErrors.discount = "Discount cannot be negative.";
    }

    const rewardPoints = parseFloat(formData.rewardPointsUsed);
    if (isNaN(rewardPoints) || rewardPoints < 0) {
      newErrors.rewardPointsUsed = "Reward points cannot be negative.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSnackChange = (snackId, quantity) => {
    setFormData(prev => {
      const newSnacks = [...prev.snacks];
      const index = newSnacks.findIndex(item => item.snackId === snackId);
      
      if (quantity === 0 && index !== -1) {
        newSnacks.splice(index, 1);
      } else if (index !== -1) {
        newSnacks[index].quantity = quantity;
      } else if (quantity > 0) {
        newSnacks.push({ snackId, quantity });
      }

      return {
        ...prev,
        snacks: newSnacks
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Calculate session times
      const sessionStart = new Date();
      const durationInMs = parseInt(formData.duration) * 60 * 1000;
      const sessionEnd = new Date(sessionStart.getTime() + durationInMs);

      // Parse numeric values
      const duration = parseInt(formData.duration);
      const numberOfPlayers = parseInt(formData.numberOfPlayers);
      const totalAmount = parseFloat(formData.totalAmount);
      const discount = parseFloat(formData.discount) || 0;
      const rewardPointsUsed = parseFloat(formData.rewardPointsUsed) || 0;

      // Validate total amount
      if (isNaN(totalAmount) || totalAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid total amount. Please try again.",
        });
        return;
      }

      const sessionData = {
        customer: {
          name: formData.customerName,
          contactNumber: formData.contactNumber,
        },
        game: formData.gameId,
        device: deviceId,
        sessionStart: sessionStart.toISOString(),
        sessionEnd: sessionEnd.toISOString(),
        duration,
        numberOfPlayers,
        snacks: formData.snacks,
        totalAmount,
        discount,
        rewardPointsUsed,
        sessionStatus: "Active"
      };

      // Create session
      const sessionResponse = await fetch("/api/sessions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      // Update device status
      const statusResponse = await fetch("/api/device/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          status: "Occupied"
        }),
      });

      if (!statusResponse.ok) {
        throw new Error("Failed to update device status");
      }

      toast({
        title: "Success",
        description: "Session created successfully"
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create session"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          name="customerName"
          placeholder="Enter customer name"
          value={formData.customerName}
          onChange={handleChange}
        />
        {errors.customerName && (
          <p className="text-sm text-red-500">{errors.customerName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          placeholder="Enter contact number"
          value={formData.contactNumber}
          onChange={handleChange}
        />
        {errors.contactNumber && (
          <p className="text-sm text-red-500">{errors.contactNumber}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Game</Label>
        <Select
          value={formData.gameId}
          onValueChange={(value) => handleSelectChange("gameId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a game" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game._id} value={game._id}>
                {game.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gameId && (
          <p className="text-sm text-red-500">{errors.gameId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfPlayers">Number of Players</Label>
        <Input
          id="numberOfPlayers"
          name="numberOfPlayers"
          type="number"
          min="1"
          value={formData.numberOfPlayers}
          onChange={handleChange}
        />
        {errors.numberOfPlayers && (
          <p className="text-sm text-red-500">{errors.numberOfPlayers}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min="30"
          step="30"
          value={formData.duration}
          onChange={handleChange}
        />
        {errors.duration && (
          <p className="text-sm text-red-500">{errors.duration}</p>
        )}
        {sessionTimes.start && sessionTimes.end && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(sessionTimes.start)} - {formatTime(sessionTimes.end)}
            </span>
          </div>
        )}
      </div>

      {snacks.length > 0 && (
        <div className="space-y-2">
          <Label>Snacks</Label>
          <div className="grid gap-2">
            {snacks.map((snack) => (
              <div key={snack._id} className="flex items-center justify-between">
                <span>{snack.name} (₹{snack.price})</span>
                <Input
                  type="number"
                  min="0"
                  className="w-20"
                  value={formData.snacks.find(s => s.snackId === snack._id)?.quantity || "0"}
                  onChange={(e) => handleSnackChange(snack._id, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="discount">Discount Amount</Label>
        <Input
          id="discount"
          name="discount"
          type="number"
          min="0"
          step="0.01"
          value={formData.discount}
          onChange={handleChange}
        />
        {errors.discount && (
          <p className="text-sm text-red-500">{errors.discount}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rewardPointsUsed">Reward Points Used</Label>
        <Input
          id="rewardPointsUsed"
          name="rewardPointsUsed"
          type="number"
          min="0"
          value={formData.rewardPointsUsed}
          onChange={handleChange}
        />
        {errors.rewardPointsUsed && (
          <p className="text-sm text-red-500">{errors.rewardPointsUsed}</p>
        )}
      </div>

      <div className="rounded-lg bg-muted p-3">
        <div className="flex items-center justify-between">
          <Label>Total Amount</Label>
          <div className="flex items-center gap-2">
            {calculating && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className="text-lg font-bold">
              ₹{formData.totalAmount}
            </span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || calculating}>
        {loading ? "Creating Session..." : "Start Session"}
      </Button>
    </form>
  );
}
