"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Users } from "lucide-react";

export function ExtendSessionDialog({
  session,
  isOpen,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [extraDuration, setExtraDuration] = useState("0");
  const [additionalPlayers, setAdditionalPlayers] = useState("0");
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

  // Initialize total amount with current session amount
  useEffect(() => {
    if (session) {
      setTotalAmount(session.totalAmount);
    }
  }, [session]);

  // Calculate new total whenever duration or players change
  useEffect(() => {
    const calculateTotal = async () => {
      if (!session) return;

      try {
        setCalculating(true);

        // Fetch pricing configuration
        const pricingResponse = await fetch("/api/pricing/fetch");
        if (!pricingResponse.ok) throw new Error("Failed to fetch pricing");
        const pricing = await pricingResponse.json();
        const currentPricing = pricing[0];

        const extraDurationHours = parseInt(extraDuration) / 60;
        const additionalPlayersCount = parseInt(additionalPlayers);
        const newTotalPlayers = session.numberOfPlayers + additionalPlayersCount;

        let newTotal = session.totalAmount;

        // Calculate cost for extra duration
        if (extraDurationHours > 0) {
          const pricePerHour = newTotalPlayers > 1 ? currentPricing.multiPlayerPrice : currentPricing.singlePlayerPrice;
          newTotal += pricePerHour * session.numberOfPlayers * extraDurationHours;
        }

        // Calculate cost for additional players for remaining duration
        if (additionalPlayersCount > 0) {
          const remainingHours = (new Date(session.sessionEnd) - new Date()) / (1000 * 60 * 60);
          const totalHours = Math.max(0, remainingHours + extraDurationHours); // Ensure non-negative total hours
          newTotal += currentPricing.multiPlayerPrice * additionalPlayersCount * totalHours;
        }

        setTotalAmount(newTotal);
      } catch (error) {
        console.error("Error calculating total:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to calculate new total",
        });
      } finally {
        setCalculating(false);
      }
    };


    calculateTotal();
  }, [extraDuration, additionalPlayers, session, toast]);

  const handleExtend = async () => {
    try {
      setLoading(true);

      const duration = parseInt(extraDuration);
      const newPlayers = parseInt(additionalPlayers);

      if ((duration === 0 && newPlayers === 0) || isNaN(duration) || isNaN(newPlayers)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter valid duration or number of players",
        });
        return;
      }

      // Calculate new end time
      const currentEnd = new Date(session.sessionEnd);
      const newEndTime = new Date(currentEnd.getTime() + duration * 60 * 1000);

      // Update session details
      const response = await fetch("/api/sessions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session._id,
          duration: session.duration + duration,
          numberOfPlayers: session.numberOfPlayers + newPlayers,
          sessionEnd: newEndTime.toISOString(),
          totalAmount,
          sessionStatus: "Extended",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extend session");
      }

      // Update device status
      const deviceStatusResponse = await fetch("/api/device/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: session.deviceId,
          status: "Extended",
        }),
      });

      if (!deviceStatusResponse.ok) {
        const deviceError = await deviceStatusResponse.json();
        throw new Error(deviceError.error || "Failed to update device status");
      }

      toast({
        title: "Success",
        description: "Session and device status updated successfully",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating session or device status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update session or device status",
      });
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate new end time for display
  const newEndTime = session && parseInt(extraDuration) > 0
    ? new Date(new Date(session.sessionEnd).getTime() + (parseInt(extraDuration) * 60 * 1000))
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Current Session Info</Label>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {session ? `${formatTime(session?.sessionStart)} - ${formatTime(session?.sessionEnd)}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {session ? `${session?.numberOfPlayers} player${session?.numberOfPlayers > 1 ? 's' : ''}` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extraDuration">Extend Duration (minutes)</Label>
            <Input
              id="extraDuration"
              type="number"
              min="0"
              step="30"
              value={extraDuration}
              onChange={(e) => setExtraDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalPlayers">Add Players</Label>
            <Input
              id="additionalPlayers"
              type="number"
              min="0"
              value={additionalPlayers}
              onChange={(e) => setAdditionalPlayers(e.target.value)}
            />
          </div>

          {(newEndTime || parseInt(additionalPlayers) > 0) && (
            <div className="space-y-2">
              <Label>New Session Details</Label>
              <div className="flex flex-col gap-2 text-sm">
                {newEndTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Ends at {formatTime(newEndTime)}</span>
                  </div>
                )}
                {parseInt(additionalPlayers) > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      New total: {session.numberOfPlayers + parseInt(additionalPlayers)} players
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Current Amount</Label>
                <span className="font-medium">₹{session?.totalAmount.toFixed(2)}</span>
              </div>
              {(parseInt(extraDuration) > 0 || parseInt(additionalPlayers) > 0) && (
                <div className="flex items-center justify-between">
                  <Label>New Total Amount</Label>
                  <div className="flex items-center gap-2">
                    {calculating && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span className="text-lg font-bold">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExtend}
            disabled={loading || calculating || (parseInt(extraDuration) === 0 && parseInt(additionalPlayers) === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
