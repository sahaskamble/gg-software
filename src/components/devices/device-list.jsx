"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DeviceList({ onRefresh }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/device/fetch");
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      const response = await fetch(`/api/device/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      toast({
        title: "Success",
        description: "Device deleted successfully"
      });
      fetchDevices();
      onRefresh?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error deleting device"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No devices found. Add your first device using the button above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => (
        <Card key={device._id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{device.name}</CardTitle>
                <CardDescription>{device.category?.name}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(device._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Badge variant={device.isAvailable ? "secondary" : "destructive"}>
                  {device.isAvailable ? "Available" : "In Use"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Screen Number:</span>
                <span>{device.screenNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Controllers:</span>
                <span>{device.numberOfControllers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
