import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];
const REGIONS = [
  "NA-East", "NA-West", "EU-West", "EU-East", "Asia-Pacific", 
  "South America", "Middle East", "Africa", "Oceania"
];
const COMMUNICATION_STYLES = [
  "Casual", "Competitive", "Friendly", "Serious", "Laid-back"
];

export function ProfileTab() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const games = useQuery(api.games.listGames, {});
  const updateProfile = useMutation(api.profiles.updateProfile);
  const addUserGame = useMutation(api.profiles.addUserGame);
  const removeUserGame = useMutation(api.profiles.removeUserGame);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    region: "",
    communicationStyle: "",
    discordTag: "",
    steamId: "",
  });

  const [showAddGame, setShowAddGame] = useState(false);
  const [newGame, setNewGame] = useState({
    gameId: "",
    skillLevel: "",
    hoursPlayed: "",
    preferredRole: "",
  });

  if (!profile) return null;

  const handleEditStart = () => {
    setEditData({
      displayName: profile.displayName,
      bio: profile.bio || "",
      region: profile.region,
      communicationStyle: profile.communicationStyle,
      discordTag: profile.discordTag || "",
      steamId: profile.steamId || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAddGame = async () => {
    if (!newGame.gameId || !newGame.skillLevel) {
      toast.error("Please select a game and skill level");
      return;
    }

    try {
      await addUserGame({
        gameId: newGame.gameId as any,
        skillLevel: newGame.skillLevel,
        hoursPlayed: newGame.hoursPlayed ? parseInt(newGame.hoursPlayed) : undefined,
        preferredRole: newGame.preferredRole || undefined,
      });
      setShowAddGame(false);
      setNewGame({ gameId: "", skillLevel: "", hoursPlayed: "", preferredRole: "" });
      toast.success("Game added to your profile!");
    } catch (error) {
      toast.error("Failed to add game");
    }
  };

  const handleRemoveGame = async (userGameId: string) => {
    try {
      await removeUserGame({ userGameId: userGameId as any });
      toast.success("Game removed from your profile");
    } catch (error) {
      toast.error("Failed to remove game");
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEditStart}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <p className="text-gray-900">{profile.displayName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <p className="text-gray-900">{profile.region}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Style</label>
              <p className="text-gray-900">{profile.communicationStyle}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discord Tag</label>
              <p className="text-gray-900">{profile.discordTag || "Not set"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <p className="text-gray-900">{profile.bio || "No bio set"}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={editData.displayName}
                onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={editData.region}
                onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
              <select
                value={editData.communicationStyle}
                onChange={(e) => setEditData({ ...editData, communicationStyle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {COMMUNICATION_STYLES.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discord Tag</label>
              <input
                type="text"
                value={editData.discordTag}
                onChange={(e) => setEditData({ ...editData, discordTag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="username#1234"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                rows={3}
                placeholder="Tell others about your gaming style..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Games */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Games</h2>
          <button
            onClick={() => setShowAddGame(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Add Game
          </button>
        </div>

        {profile.games?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No games added yet. Add some games to start finding teammates!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.games?.map((userGame) => (
              <div key={userGame._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{userGame.game?.name}</h3>
                  <button
                    onClick={() => handleRemoveGame(userGame._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Skill: {userGame.skillLevel}</div>
                  {userGame.hoursPlayed && <div>Hours: {userGame.hoursPlayed}</div>}
                  {userGame.preferredRole && <div>Role: {userGame.preferredRole}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Game Modal */}
        {showAddGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Game</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
                  <select
                    value={newGame.gameId}
                    onChange={(e) => setNewGame({ ...newGame, gameId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Select a game</option>
                    {games?.map((game) => (
                      <option key={game._id} value={game._id}>{game.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                  <select
                    value={newGame.skillLevel}
                    onChange={(e) => setNewGame({ ...newGame, skillLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Select skill level</option>
                    {SKILL_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours Played (optional)</label>
                  <input
                    type="number"
                    value={newGame.hoursPlayed}
                    onChange={(e) => setNewGame({ ...newGame, hoursPlayed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Role (optional)</label>
                  <input
                    type="text"
                    value={newGame.preferredRole}
                    onChange={(e) => setNewGame({ ...newGame, preferredRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g., Support, DPS, Tank"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAddGame(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGame}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Add Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
