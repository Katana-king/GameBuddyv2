import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function MatchmakingTab() {
  const matches = useQuery(api.matchmaking.findMatches, { limit: 10 });
  const createMatch = useMutation(api.matchmaking.createMatch);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (userId: string) => {
    setConnecting(userId);
    try {
      await createMatch({ targetUserId: userId as any });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send connection request");
    } finally {
      setConnecting(null);
    }
  };

  if (matches === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-600 mb-6">
          Try adding more games to your profile or check back later for new players in your region.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Players</h2>
        <p className="text-gray-600">
          Found {matches.length} compatible players in your region
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div key={match.profile.userId} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {match.profile.displayName}
                  {match.profile.isVerified && (
                    <span className="ml-2 text-green-500" title="Verified Player">✓</span>
                  )}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📍 {match.profile.region}</div>
                  <div>💬 {match.profile.communicationStyle}</div>
                  {match.profile.discordTag && (
                    <div>🎮 {match.profile.discordTag}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-1">
                  {match.compatibilityScore}%
                </div>
                <div className="text-xs text-gray-500">Match</div>
              </div>
            </div>

            {match.profile.bio && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {match.profile.bio}
              </p>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Mutual Games</h4>
              <div className="space-y-2">
                {match.mutualGames.slice(0, 3).map((gameInfo) => (
                  <div key={gameInfo.game?._id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{gameInfo.game?.name}</span>
                    <div className="text-xs text-gray-500">
                      {gameInfo.userSkill} vs {gameInfo.theirSkill}
                    </div>
                  </div>
                ))}
                {match.mutualGames.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{match.mutualGames.length - 3} more games
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleConnect(match.profile.userId)}
              disabled={connecting === match.profile.userId}
              className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting === match.profile.userId ? "Connecting..." : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
