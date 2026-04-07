import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, Text, StyleSheet } from "react-native";
import OnboardingScreen from "../onboarding";
import RevealScreen from "../reveal";
import RoadmapScreen from "../roadmap";

type ProfileData = {
  major: string;
  year: string;
  goals: string[];
  skills: Record<string, number>;
};

const LOADING_PHRASES = [
  "Developing your plan...",
  "Mapping milestones to your goals...",
  "Choosing projects for your level...",
  "Finding events worth your time...",
  "Finalizing your personalized roadmap...",
];

export default function HomeScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stage, setStage] = useState<"onboarding" | "loading" | "reveal" | "roadmap">("onboarding");
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const phraseOpacity = useRef(new Animated.Value(1)).current;
  const phraseTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stage !== "loading") {
      return;
    }

    setLoadingPhraseIndex(0);
    loadingProgress.setValue(0);

    let cancelled = false;
    Animated.sequence([
      Animated.timing(loadingProgress, {
        toValue: 0.1,
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(1040),
      Animated.timing(loadingProgress, {
        toValue: 0.4,
        duration: 1040,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(1040),
      Animated.timing(loadingProgress, {
        toValue: 0.5,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(1040),
      Animated.timing(loadingProgress, {
        toValue: 0.8,
        duration: 1040,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(1040),
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished && !cancelled) {
        setStage("reveal");
      }
    });

    const phraseInterval = setInterval(() => {
      Animated.parallel([
        Animated.timing(phraseOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(phraseTranslateY, {
          toValue: -6,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        phraseTranslateY.setValue(6);
        Animated.parallel([
          Animated.timing(phraseOpacity, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(phraseTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 1500);

    return () => {
      cancelled = true;
      loadingProgress.stopAnimation();
      clearInterval(phraseInterval);
    };
  }, [loadingProgress, phraseOpacity, phraseTranslateY, stage]);

  if (stage === "onboarding" || !profile) {
    return (
      <OnboardingScreen
        onComplete={(data: ProfileData) => {
          setProfile(data);
          setStage("loading");
        }}
      />
    );
  }

  if (stage === "loading") {
    const progressWidth = loadingProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingTitle}>Building your personalized roadmap</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Animated.Text
          style={[
            styles.loadingPhrase,
            {
              opacity: phraseOpacity,
              transform: [{ translateY: phraseTranslateY }],
            },
          ]}
        >
          {LOADING_PHRASES[loadingPhraseIndex]}
        </Animated.Text>
        <View style={styles.loadingSummaryCard}>
          <Text style={styles.loadingSummaryText}>
            You&apos;re a <Text style={styles.loadingSummaryHighlight}>{profile.year}</Text> studying <Text style={styles.loadingSummaryHighlight}>{profile.major}</Text>.
            {profile.goals.length > 0 && (
              <Text> Your focus is <Text style={styles.loadingSummaryHighlight}>{profile.goals[0]}</Text>.</Text>
            )}
            <Text> This roadmap is tailored to your current level.</Text>
          </Text>
        </View>
      </View>
    );
  }

  if (stage === "reveal") {
    return <RevealScreen profile={profile} onContinue={() => setStage("roadmap")} />;
  }

  return <RoadmapScreen profile={profile} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#0f1115",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  loadingLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 11,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  loadingTitle: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 30,
    color: "#f5f7fb",
    textAlign: "center",
    lineHeight: 31,
    marginBottom: 18,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 100,
    backgroundColor: "#2b2f38",
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c5cff",
    borderRadius: 100,
  },
  loadingPhrase: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#aab3c3",
    lineHeight: 19,
    textAlign: "center",
    minHeight: 20,
    marginBottom: 8,
  },
  loadingHint: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 16,
    color: "#9099ad",
    lineHeight: 20,
    textAlign: "center",
  },
  loadingSummaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 14,
    marginBottom: 10,
  },
  loadingSummaryText: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#aab3c3",
    lineHeight: 20,
    textAlign: "center",
  },
  loadingSummaryHighlight: {
    color: "#f5f7fb",
    fontFamily: "ClashGrotesk-Semibold",
  },
});