"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RecentSales() {
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentSessions() {
      try {
        const response = await fetch('/api/stats/recent-sessions');
        const data = await response.json();
        setRecentSessions(data.sessions);
      } catch (error) {
        console.error('Error fetching recent sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentSessions();
  }, []);

  if (loading) {
    return <div>Loading recent sessions...</div>;
  }

  return (
    <div className="space-y-8">
      {recentSessions.map((session) => (
        <div key={session._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {session.customerName?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.customerName || 'Anonymous User'}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.gameName}
            </p>
          </div>
          <div className="ml-auto font-medium">
            ${session.price.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
