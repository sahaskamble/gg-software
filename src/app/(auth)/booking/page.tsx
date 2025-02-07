"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Timer, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionForm } from "@/components/forms/session-form";
import { ExtendSessionDialog } from "@/components/extend-session-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Device {
  _id: string;
  name: string;
  deviceStatus: 'Available' | 'Occupied' | 'Extended';
  screenNumber: number;
  numberOfControllers: number;
}

interface Session {
  _id: string;
  device: string;
  sessionStart: string;
  sessionEnd: string;
}

interface SessionsMap {
  [key: string]: Session;
}

const statusColors: Record<Device['deviceStatus'], string> = {
  Available: "bg-green-500",
  Occupied: "bg-red-500",
  Extended: "bg-yellow-500",
};

export default function Booking() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<SessionsMap>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [extendSession, setExtendSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/device/fetch");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDevices(data);

      // Fetch active sessions for occupied devices
      const occupiedDevices = data.filter((d: any) => d.deviceStatus !== "Available");
      const sessionsData: SessionsMap = {};
      
      for (const device of occupiedDevices) {
        const sessionResponse = await fetch("/api/sessions/fetch");
        if (sessionResponse.ok) {
          const allSessions = await sessionResponse.json();
          // Find the latest active session for this device
          const deviceSession = allSessions
            .filter((s: any) => s.device === device._id)
            .sort((a: any, b: any) => new Date(b.sessionStart).getTime() - new Date(a.sessionStart).getTime())[0];
          
          if (deviceSession) {
            sessionsData[device._id] = deviceSession;
          }
        }
      }
      
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load devices"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleEndSession = async (deviceId: string) => {
    try {
      const response = await fetch("/api/device/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          status: "Available"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      toast({
        title: "Success",
        description: "Session ended successfully"
      });
      fetchDevices();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to end session"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading devices...</div>;
  }

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 mb-6">
          <Monitor className="h-8 w-8 text-blue-500 shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Device Booking</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage device sessions and bookings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Card key={device._id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-lg md:text-xl">
                    {device.name}
                  </CardTitle>
                  <Badge className={`${statusColors[device.deviceStatus]} whitespace-nowrap`}>
                    {device.deviceStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 shrink-0" />
                      <span>Screen #{device.screenNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{device.numberOfControllers} Controllers</span>
                    </div>
                  </div>

                  {device.deviceStatus === "Available" ? (
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedDevice(device)}
                    >
                      Book Session
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleEndSession(device._id)}
                      >
                        End Session
                      </Button>
                      {device.deviceStatus !== "Extended" && sessions[device._id] && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setExtendSession(sessions[device._id])}
                        >
                          Extend
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session - {selectedDevice?.name}</DialogTitle>
            <DialogDescription>
              Create a new gaming session
            </DialogDescription>
          </DialogHeader>
          {selectedDevice && (
            <SessionForm
              deviceId={selectedDevice._id}
              onSuccess={() => {
                setSelectedDevice(null);
                fetchDevices();
              }}
              // onClose={() => setSelectedDevice(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ExtendSessionDialog
        session={extendSession}
        isOpen={!!extendSession}
        onClose={() => setExtendSession(null)}
        onSuccess={() => {
          setExtendSession(null);
          fetchDevices();
        }}
      />

      <Toaster />
    </>
  );
}
