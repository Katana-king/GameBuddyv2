import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎮</div>
          <h2 className="text-xl font-bold text-primary">GameBuddy</h2>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (loggedInUser === undefined || profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        {!profile ? <ProfileSetup /> : <Dashboard />}
      </Authenticated>
      
      <Unauthenticated>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Find Your Perfect Gaming Teammate
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Connect with gamers who share your passion, skill level, and schedule. 
              Whether you're looking for competitive teammates or casual friends, GameBuddy helps you find the right match.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Match by skill level
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Regional preferences
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Schedule compatibility
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                LFG board
              </div>
            </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
