"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch data");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        {/* Top Bar */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Dashboard Cards */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="lg:pl-[240px] p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.totalSessions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.todaySessions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${data?.totalAmount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.totalCustomers}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
