import { useState } from "react";
import OnboardingScreen from "./onboarding";

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);

  if (!profile) {
    return <OnboardingScreen onComplete={(data) => setProfile(data)} />;
  }

  return null;
}