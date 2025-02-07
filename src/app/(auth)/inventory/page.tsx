"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeviceForm } from "@/components/forms/device-form";
import { DeviceCategoryForm } from "@/components/forms/device-category-form";
import { SnackForm } from "@/components/forms/snack-form";
import { DeviceList } from "@/components/devices/device-list";
import { SnackList } from "@/components/snacks/snack-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function InventoryPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("devices");
  const [formType, setFormType] = useState<"device" | "snack" | "category" | null>(null);
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    setIsOpen(false);
    setKey(prev => prev + 1);
  };

  const handleAddNew = () => {
    setFormType(activeTab === "devices" ? "device" : "snack");
    setIsOpen(true);
  };

  const getFormComponent = () => {
    if (activeTab === "devices" && formType === "device") {
      return <DeviceForm onSuccess={handleSuccess} />;
    }
    if (activeTab === "devices" && formType === "category") {
      return <DeviceCategoryForm onSuccess={handleSuccess} />;
    }
    if (activeTab === "snacks" && formType === "snack") {
      return <SnackForm onSuccess={handleSuccess} />;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Inventory</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage devices, categories, and snacks
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="devices" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="snacks">Snacks</TabsTrigger>
          </TabsList>
          {activeTab === "devices" ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => {
                  setFormType("device");
                  setIsOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Device
              </Button>
              <Button 
                onClick={() => {
                  setFormType("category");
                  setIsOpen(true);
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleAddNew}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Snack
            </Button>
          )}
        </div>

        <TabsContent value="devices" className="space-y-4">
          <DeviceList key={`devices-${key}`} onRefresh={() => setKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="snacks" className="space-y-4">
          <SnackList key={`snacks-${key}`} onRefresh={() => setKey(prev => prev + 1)} />
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formType === "device" ? "Add New Device" : 
               formType === "category" ? "Add New Category" : 
               "Add New Snack"}
            </DialogTitle>
          </DialogHeader>
          {getFormComponent()}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
