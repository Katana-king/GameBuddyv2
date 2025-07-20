import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const REGIONS = [
  "NA-East", "NA-West", "EU-West", "EU-East", "Asia-Pacific", 
  "South America", "Middle East", "Africa", "Oceania"
];

const COMMUNICATION_STYLES = [
  "Casual", "Competitive", "Friendly", "Serious", "Laid-back"
];

export function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    region: "",
    communicationStyle: "",
    discordTag: "",
    steamId: "",
  });

  const createProfile = useMutation(api.profiles.createProfile);
  const seedGames = useMutation(api.games.seedGames);
  const games = useQuery(api.games.listGames, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.displayName || !formData.region || !formData.communicationStyle) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
      return;
    }

    try {
      await createProfile(formData);
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  const handleSeedGames = async () => {
    try {
      await seedGames();
      toast.success("Games database initialized!");
    } catch (error) {
      console.error("Failed to seed games:", error);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to GameBuddy!</h1>
          <p className="text-gray-600">Let's set up your gaming profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Your gaming name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Tell others about your gaming style..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            >
              <option value="">Select your region</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Style *
            </label>
            <select
              value={formData.communicationStyle}
              onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            >
              <option value="">Select your style</option>
              {COMMUNICATION_STYLES.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discord Tag
            </label>
            <input
              type="text"
              value={formData.discordTag}
              onChange={(e) => setFormData({ ...formData, discordTag: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="username#1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steam ID
            </label>
            <input
              type="text"
              value={formData.steamId}
              onChange={(e) => setFormData({ ...formData, steamId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Your Steam profile URL or ID"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Almost Done!</h1>
        <p className="text-gray-600">Your profile is ready to go</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {formData.displayName}</div>
            <div><span className="font-medium">Region:</span> {formData.region}</div>
            <div><span className="font-medium">Style:</span> {formData.communicationStyle}</div>
            {formData.discordTag && (
              <div><span className="font-medium">Discord:</span> {formData.discordTag}</div>
            )}
          </div>
        </div>

        {!games?.length && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-3">
              Initialize the games database to start matching with other players.
            </p>
            <button
              onClick={handleSeedGames}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Initialize Games Database
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          Create Profile
        </button>
      </div>
    </div>
  );
}
