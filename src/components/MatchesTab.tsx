import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function MatchesTab() {
  const matches = useQuery(api.matchmaking.getMyMatches);
  const respondToMatch = useMutation(api.matchmaking.respondToMatch);

  const handleRespond = async (matchId: string, response: "accepted" | "declined") => {
    try {
      await respondToMatch({ matchId: matchId as any, response });
      toast.success(`Match ${response}!`);
    } catch (error) {
      toast.error(`Failed to ${response.slice(0, -1)} match`);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
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
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
        <p className="text-gray-600">
          Start connecting with players in the "Find Players" tab to see your matches here.
        </p>
      </div>
    );
  }

  const pendingMatches = matches.filter(m => m.status === "pending");
  const acceptedMatches = matches.filter(m => m.status === "accepted");
  const declinedMatches = matches.filter(m => m.status === "declined");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Matches</h2>
        <p className="text-gray-600">Manage your gaming connections</p>
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests ({pendingMatches.length})
          </h3>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match._id} className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {match.otherProfile?.displayName}
                        {match.otherProfile?.isVerified && (
                          <span className="ml-2 text-green-500" title="Verified Player">✓</span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {match.isInitiator ? "You sent a request" : "Sent you a request"}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div>📍 {match.otherProfile?.region}</div>
                      <div>💬 {match.otherProfile?.communicationStyle}</div>
                      {match.otherProfile?.discordTag && (
                        <div>🎮 {match.otherProfile.discordTag}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Mutual Games: </span>
                      <span className="text-sm text-gray-600">
                        {match.mutualGamesWithDetails?.map(game => game?.name).join(", ")}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(match.createdAt)} • {match.compatibilityScore}% compatibility
                    </div>
                  </div>

                  {!match.isInitiator && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleRespond(match._id, "declined")}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespond(match._id, "accepted")}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Matches */}
      {acceptedMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Connected Players ({acceptedMatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedMatches.map((match) => (
              <div key={match._id} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {match.otherProfile?.displayName}
                    {match.otherProfile?.isVerified && (
                      <span className="ml-2 text-green-500" title="Verified Player">✓</span>
                    )}
                  </h4>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <div>📍 {match.otherProfile?.region}</div>
                  <div>💬 {match.otherProfile?.communicationStyle}</div>
                  {match.otherProfile?.discordTag && (
                    <div>🎮 {match.otherProfile.discordTag}</div>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Mutual Games: </span>
                  <div className="text-sm text-gray-600">
                    {match.mutualGamesWithDetails?.map(game => game?.name).join(", ")}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Connected {formatTimeAgo(match.createdAt)}
                  </div>
                  <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declined Matches */}
      {declinedMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Declined ({declinedMatches.length})
          </h3>
          <div className="space-y-2">
            {declinedMatches.map((match) => (
              <div key={match._id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-700">{match.otherProfile?.displayName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {formatTimeAgo(match.createdAt)}
                  </span>
                </div>
                <span className="text-sm text-red-600">Declined</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
