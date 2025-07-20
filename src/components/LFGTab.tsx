import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];
const COMMON_TAGS = ["competitive", "ranked", "casual", "fun", "practice", "tournament"];

export function LFGTab() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filters, setFilters] = useState({
    gameId: "",
    region: "",
  });

  const lfgPosts = useQuery(api.lfg.listLFGPosts, filters.gameId ? { gameId: filters.gameId as any } : {});
  const games = useQuery(api.games.listGames, {});
  const myPosts = useQuery(api.lfg.getMyLFGPosts);
  const createLFGPost = useMutation(api.lfg.createLFGPost);
  const deleteLFGPost = useMutation(api.lfg.deleteLFGPost);

  const [newPost, setNewPost] = useState({
    gameId: "",
    title: "",
    description: "",
    skillLevel: "",
    playersNeeded: 1,
    scheduledTime: "",
    tags: [] as string[],
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.gameId || !newPost.title || !newPost.skillLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createLFGPost({
        gameId: newPost.gameId as any,
        title: newPost.title,
        description: newPost.description,
        skillLevel: newPost.skillLevel,
        playersNeeded: newPost.playersNeeded,
        scheduledTime: newPost.scheduledTime ? new Date(newPost.scheduledTime).getTime() : undefined,
        tags: newPost.tags,
      });
      
      setShowCreatePost(false);
      setNewPost({
        gameId: "",
        title: "",
        description: "",
        skillLevel: "",
        playersNeeded: 1,
        scheduledTime: "",
        tags: [],
      });
      toast.success("LFG post created!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteLFGPost({ postId: postId as any });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const toggleTag = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Looking For Group</h2>
          <p className="text-gray-600">Find players for your next gaming session</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Game</label>
            <select
              value={filters.gameId}
              onChange={(e) => setFilters({ ...filters, gameId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Games</option>
              {games?.map((game) => (
                <option key={game._id} value={game._id}>{game.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* My Posts */}
      {myPosts && myPosts.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">My Posts</h3>
          <div className="space-y-3">
            {myPosts.map((post) => (
              <div key={post._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{post.title}</div>
                  <div className="text-sm text-gray-600">{post.game?.name} • {formatTimeAgo(post._creationTime)}</div>
                </div>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LFG Posts */}
      <div className="space-y-4">
        {lfgPosts === undefined ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : lfgPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No LFG posts found</h3>
            <p className="text-gray-600">Be the first to create a post!</p>
          </div>
        ) : (
          lfgPosts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>🎮 {post.game?.name}</span>
                    <span>📍 {post.region}</span>
                    <span>⭐ {post.skillLevel}</span>
                    <span>👥 Need {post.playersNeeded} player{post.playersNeeded !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{post.author?.displayName}</div>
                  <div>{formatTimeAgo(post._creationTime)}</div>
                </div>
              </div>

              {post.description && (
                <p className="text-gray-700 mb-4">{post.description}</p>
              )}

              {post.scheduledTime && (
                <div className="text-sm text-gray-600 mb-4">
                  🕒 Scheduled for: {new Date(post.scheduledTime).toLocaleString()}
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {post.author?.discordTag && (
                    <span>Discord: {post.author.discordTag}</span>
                  )}
                </div>
                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                  Join Group
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create LFG Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game *</label>
                <select
                  value={newPost.gameId}
                  onChange={(e) => setNewPost({ ...newPost, gameId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                >
                  <option value="">Select a game</option>
                  {games?.map((game) => (
                    <option key={game._id} value={game._id}>{game.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g., Need 1 for ranked Valorant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  rows={3}
                  placeholder="Additional details about your group..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level *</label>
                  <select
                    value={newPost.skillLevel}
                    onChange={(e) => setNewPost({ ...newPost, skillLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    required
                  >
                    <option value="">Select level</option>
                    {SKILL_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Players Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPost.playersNeeded}
                    onChange={(e) => setNewPost({ ...newPost, playersNeeded: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time (optional)</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledTime}
                  onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        newPost.tags.includes(tag)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
