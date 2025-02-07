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
  const [pricingSettings, setPricingSettings] = useState({
    singlePlayerPrice: 0,
    multiPlayerPrice: 0
  });
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    gameId: "",
    numberOfPlayers: "1",
    duration: "60",
    snacks: [], // Array of { snackId, quantity }
    discountRate: "0",
    discountAmount: "0",
    rewardPointsUsed: "0",
    totalAmount: "0",
    pricePerPlayer: "0"
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, snacksResponse, pricingResponse] = await Promise.all([
          fetch("/api/games/fetch"),
          fetch("/api/snacks/fetch"),
          fetch("/api/pricing/fetch")
        ]);

        if (!gamesResponse.ok || !snacksResponse.ok || !pricingResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [gamesData, snacksData, pricingData] = await Promise.all([
          gamesResponse.json(),
          snacksResponse.json(),
          pricingResponse.json()
        ]);

        setGames(gamesData.filter(game => game.isAvailable));
        setSnacks(snacksData);
        setPricingSettings(pricingData);
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

  useEffect(() => {
    calculateSessionTimes();
  }, [formData.duration]);

  useEffect(() => {
    if (pricingSettings?.singlePlayerPrice && 
        pricingSettings?.multiPlayerPrice && 
        formData.gameId) { 
      console.log('Calculating total with:', {
        gameId: formData.gameId,
        players: formData.numberOfPlayers,
        duration: formData.duration,
        pricing: pricingSettings
      });
      calculateTotalAmount();
    }
  }, [
    formData.gameId, 
    formData.numberOfPlayers,
    formData.duration,
    formData.snacks,
    formData.discountRate,
    formData.rewardPointsUsed,
    pricingSettings
  ]);

  const calculateSessionTimes = () => {
    const start = new Date();
    const end = new Date(start.getTime() + parseInt(formData.duration) * 60000);
    setSessionTimes({ start, end });
  };

  const handleGameChange = (value) => {
    console.log('Game selected:', value);
    setFormData(prev => ({
      ...prev,
      gameId: value
    }));
  };

  const calculateTotalAmount = () => {
    if (!pricingSettings?.singlePlayerPrice || 
        !pricingSettings?.multiPlayerPrice || 
        !formData.gameId) { 
      console.log('Missing required data:', {
        singlePlayerPrice: pricingSettings?.singlePlayerPrice,
        multiPlayerPrice: pricingSettings?.multiPlayerPrice,
        gameId: formData.gameId
      });
      return;
    }

    try {
      const numberOfPlayers = parseInt(formData.numberOfPlayers) || 1;
      const durationInHours = (parseInt(formData.duration) || 0) / 60;

      const pricePerPlayer = numberOfPlayers === 1 
        ? (pricingSettings.singlePlayerPrice || 0)
        : (pricingSettings.multiPlayerPrice || 0);

      let baseAmount = pricePerPlayer * numberOfPlayers * durationInHours;

      const snacksCost = formData.snacks.reduce((total, item) => {
        const snack = snacks.find((s) => s._id === item.snackId);
        return total + (snack ? snack.price * (parseInt(item.quantity) || 0) : 0);
      }, 0);

      baseAmount += snacksCost;

      const discountRate = parseFloat(formData.discountRate) || 0;
      const discountAmount = (baseAmount * discountRate) / 100;

      const rewardPointsDiscount = Math.min(
        parseFloat(formData.rewardPointsUsed) || 0,
        baseAmount - discountAmount
      );

      console.log('Calculation results:', {
        pricePerPlayer,
        baseAmount,
        snacksCost,
        discountAmount,
        rewardPointsDiscount,
        final: baseAmount - discountAmount - rewardPointsDiscount
      });

      setFormData(prev => ({
        ...prev,
        pricePerPlayer: (pricePerPlayer || 0).toFixed(2),
        discountAmount: (discountAmount || 0).toFixed(2),
        totalAmount: ((baseAmount - discountAmount - rewardPointsDiscount) || 0).toFixed(2)
      }));
    } catch (error) {
      console.error('Error calculating total amount:', error);
      setFormData(prev => ({
        ...prev,
        pricePerPlayer: "0.00",
        discountAmount: "0.00",
        totalAmount: "0.00"
      }));
    }
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

    const discountRate = parseFloat(formData.discountRate);
    if (isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
      newErrors.discountRate = "Discount rate must be between 0 and 100.";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSnackChange = (snackId, quantity) => {
    setFormData((prev) => {
      const updatedSnacks = [...prev.snacks];
      const existingIndex = updatedSnacks.findIndex(
        (item) => item.snackId === snackId
      );

      if (existingIndex !== -1) {
        if (quantity === "0") {
          updatedSnacks.splice(existingIndex, 1);
        } else {
          updatedSnacks[existingIndex].quantity = quantity;
        }
      } else if (quantity !== "0") {
        updatedSnacks.push({ snackId, quantity });
      }

      return {
        ...prev,
        snacks: updatedSnacks,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const sessionStart = new Date();
      const durationInMs = parseInt(formData.duration) * 60000;
      const sessionEnd = new Date(sessionStart.getTime() + durationInMs);

      const duration = parseInt(formData.duration);
      const numberOfPlayers = parseInt(formData.numberOfPlayers);
      const totalAmount = parseFloat(formData.totalAmount);
      const discountRate = parseFloat(formData.discountRate);
      const discountAmount = parseFloat(formData.discountAmount);
      const rewardPointsUsed = parseFloat(formData.rewardPointsUsed) || 0;

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
        discountRate,
        discountAmount,
        rewardPointsUsed,
        totalAmount,
        sessionStatus: "Active"
      };

      const sessionResponse = await fetch("/api/sessions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || "Failed to create session");
      }

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

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Details Section */}
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="Enter customer name"
          required
        />
        {errors.customerName && (
          <p className="text-sm text-red-500">{errors.customerName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="Enter contact number"
          required
        />
        {errors.contactNumber && (
          <p className="text-sm text-red-500">{errors.contactNumber}</p>
        )}
      </div>

      {/* Game Details Section */}
      <div>
        <Label>Game</Label>
        <Select
          value={formData.gameId}
          onValueChange={handleGameChange}
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

      <div>
        <Label htmlFor="numberOfPlayers">Number of Players</Label>
        <Input
          id="numberOfPlayers"
          name="numberOfPlayers"
          type="number"
          min="1"
          value={formData.numberOfPlayers}
          onChange={handleChange}
          required
        />
        {errors.numberOfPlayers && (
          <p className="text-sm text-red-500">{errors.numberOfPlayers}</p>
        )}
      </div>

      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Select
          value={formData.duration}
          onValueChange={(value) =>
            handleChange({ target: { name: "duration", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
        {errors.duration && (
          <p className="text-sm text-red-500">{errors.duration}</p>
        )}
      </div>

      {sessionTimes.start && sessionTimes.end && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(sessionTimes.start)} - {formatTime(sessionTimes.end)}
          </span>
        </div>
      )}

      {/* Snacks Section */}
      <div>
        <Label>Snacks</Label>
        <div className="space-y-2">
          {snacks.map((snack) => (
            <div key={snack._id} className="flex items-center gap-2">
              <span className="flex-1">
                {snack.name} - ₹{snack.price}
              </span>
              <Select
                value={
                  formData.snacks.find((item) => item.snackId === snack._id)
                    ?.quantity || "0"
                }
                onValueChange={(value) => handleSnackChange(snack._id, value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price per Player</Label>
            <Input
              value={`₹${parseFloat(formData.pricePerPlayer || 0).toFixed(2)}`}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label>Base Amount</Label>
            <Input
              value={`₹${((parseFloat(formData.pricePerPlayer || 0) * (parseInt(formData.numberOfPlayers) || 1) * ((parseInt(formData.duration) || 0) / 60)) || 0).toFixed(2)}`}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountRate">Discount Rate (%)</Label>
            <Input
              id="discountRate"
              name="discountRate"
              type="number"
              min="0"
              max="100"
              value={formData.discountRate}
              onChange={(e) => {
                const value = Math.min(Math.max(0, parseFloat(e.target.value) || 0), 100);
                handleChange({
                  target: {
                    name: "discountRate",
                    value: value.toString()
                  }
                });
              }}
              placeholder="Enter discount rate"
            />
            {errors.discountRate && (
              <p className="text-sm text-red-500">{errors.discountRate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="discountAmount">Discount Amount</Label>
            <Input
              id="discountAmount"
              name="discountAmount"
              type="number"
              value={formData.discountAmount}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div>
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

        <div>
          <Label>Total Amount</Label>
          <Input
            value={`₹${formData.totalAmount}`}
            readOnly
            className="bg-muted font-semibold text-lg"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Session
      </Button>
    </form>
  );
}
