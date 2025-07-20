import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProfileTab } from "./ProfileTab";
import { MatchmakingTab } from "./MatchmakingTab";
import { LFGTab } from "./LFGTab";
import { MatchesTab } from "./MatchesTab";

const TABS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "matchmaking", label: "Find Players", icon: "🎯" },
  { id: "lfg", label: "LFG Board", icon: "📋" },
  { id: "matches", label: "My Matches", icon: "💬" },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("matchmaking");
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.displayName}! 🎮
        </h1>
        <p className="text-gray-600">
          Ready to find your next gaming teammate?
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "matchmaking" && <MatchmakingTab />}
        {activeTab === "lfg" && <LFGTab />}
        {activeTab === "matches" && <MatchesTab />}
      </div>
    </div>
  );
}
