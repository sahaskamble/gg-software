'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [formData, setFormData] = useState({
    GameName: '',
    PlayersCount: '1'
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create game');
      }

      setIsAddModalOpen(false);
      setFormData({ GameName: '', PlayersCount: 1 });
      fetchGames();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/games', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedGame.xata_id,
          ...formData
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update game');
      }

      setIsEditModalOpen(false);
      setSelectedGame(null);
      setFormData({ GameName: '', PlayersCount: '1' });
      fetchGames();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (gameId) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`/api/games?id=${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete game');
      }

      fetchGames();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Games</h1>
        <button
          onClick={() => {
            setError(null);
            setFormData({ GameName: '', PlayersCount: 1 });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Game
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-[#111827] rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Game Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Players Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1a202c]">
            {games.map((game) => (
              <tr key={game.xata_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {game.GameName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {game.PlayersCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedGame(game);
                      setFormData({
                        GameName: game.GameName,
                        PlayersCount: game.PlayersCount
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.xata_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-white">
                  No games found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Game Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setError(null);
        }}
        title="Add New Game"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          <div>
            <label htmlFor="gameName" className="block text-sm font-medium text-black">
              Game Name *
            </label>
            <input
              type="text"
              id="gameName"
              value={formData.GameName}
              onChange={(e) => setFormData({ ...formData, GameName: e.target.value })}
              className="mt-1 block p-3 text-black w-full rounded-md border-gray-300 shadow-md shadow-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="playersCount" className="block text-sm font-medium text-black">
              Players Count *
            </label>
            <input
              type="number"
              id="playersCount"
              value={formData.PlayersCount}
              onChange={(e) => setFormData({ ...formData, PlayersCount: parseInt(e.target.value) })}
              className="mt-1 block p-3 text-black w-full rounded-md border-gray-300 shadow-md shadow-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Game
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Game Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGame(null);
          setError(null);
        }}
        title="Edit Game"
      >
        <form onSubmit={handleEdit} className="space-y-6">
          <div>
            <label htmlFor="editGameName" className="block text-sm font-medium text-white">
              Game Name *
            </label>
            <input
              type="text"
              id="editGameName"
              value={formData.GameName}
              onChange={(e) => setFormData({ ...formData, GameName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="editPlayersCount" className="block text-sm font-medium text-gray-700">
              Players Count *
            </label>
            <input
              type="number"
              id="editPlayersCount"
              value={formData.PlayersCount}
              onChange={(e) => setFormData({ ...formData, PlayersCount: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Game
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
