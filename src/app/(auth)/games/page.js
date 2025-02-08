"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gamepad2, Search, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AddGameDialog from "@/components/add-game-dialog";
import EditGameDialog from "@/components/edit-game-dialog";
import { useToast } from "@/hooks/use-toast";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/games/fetch");
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load games"
      });
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setEditDialogOpen(true);
  };

  const filteredGames = games.filter((game) =>
    game?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Games</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage your game library
            </p>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Game
          </Button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <Gamepad2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No games found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? "Try adjusting your search" : "Get started by adding a new game"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGames.map((game) => (
            <Card key={game._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={game.isAvailable ? "default" : "destructive"}>
                      {game.isAvailable ? "Available" : "In Use"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGame(game)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players:</span>
                    <span>{game.numberOfPlayers}</span>
                  </div>
                  {game.description && (
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddGameDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          setAddDialogOpen(false);
          fetchGames();
        }}
      />

      {selectedGame && (
        <EditGameDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedGame(null);
            fetchGames();
          }}
          game={selectedGame}
        />
      )}
    </div>
  );
}
