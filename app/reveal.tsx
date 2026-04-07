import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Animated, Easing } from "react-native";

export default function RevealScreen({ profile, onContinue }: { profile: any; onContinue: () => void }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [milestoneReady, setMilestoneReady] = useState(false);
  const [showMilestoneContent, setShowMilestoneContent] = useState(false);
  const [hidePreReveal, setHidePreReveal] = useState(false);
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const exitSlideAnim = useRef(new Animated.Value(0)).current;
  const milestoneProgressAnim = useRef(new Animated.Value(0)).current;
  const preRevealOpacity = useRef(new Animated.Value(1)).current;
  const preRevealTranslateY = useRef(new Animated.Value(0)).current;
  const milestoneContentOpacity = useRef(new Animated.Value(0)).current;
  const milestoneContentTranslateY = useRef(new Animated.Value(10)).current;

  const avgSkill = Object.values(profile.skills as Record<string, number>).reduce((a, b) => a + b, 0) / 6;
  const level = avgSkill < 1.5 ? "Beginner" : avgSkill < 2.8 ? "Intermediate" : "Advanced";

  const firstMilestone =
    avgSkill < 1.5
      ? "Set up your dev environment and push your first project to GitHub."
      : avgSkill < 2.8
      ? "Build a full-stack project and deploy it with a live URL."
      : "Lead a project or apply for a research position.";

  const reason =
    profile.goals.includes("Get a SWE internship")
      ? "Recruiters want to see you can ship something real. This is step one."
      : profile.goals.includes("Do research")
      ? "Professors want students who show initiative. A project proves that."
      : "Every goal you picked starts here. Build the habit first.";

  useEffect(() => {
    const sequence = [
      { toValue: 20, duration: 600 },
      { toValue: 20, duration: 400 },
      { toValue: 50, duration: 800 },
      { toValue: 50, duration: 400 },
      { toValue: 80, duration: 800 },
      { toValue: 80, duration: 400 },
      { toValue: 100, duration: 600 },
    ];

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= sequence.length) {
        setMilestoneReady(true);
        return;
      }

      const step = sequence[currentIndex];
      Animated.timing(milestoneProgressAnim, {
        toValue: step.toValue,
        duration: step.duration,
        easing: step.duration > 600 ? Easing.out(Easing.cubic) : Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        currentIndex += 1;
        playNext();
      });
    };

    playNext();
  }, [milestoneProgressAnim]);

  useEffect(() => {
    if (!milestoneReady) {
      return;
    }

    setShowMilestoneContent(true);
    Animated.parallel([
      Animated.timing(preRevealOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(preRevealTranslateY, {
        toValue: -8,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(milestoneContentOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(milestoneContentTranslateY, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setHidePreReveal(true);
    });
  }, [
    milestoneReady,
    preRevealOpacity,
    preRevealTranslateY,
    milestoneContentOpacity,
    milestoneContentTranslateY,
  ]);

  if (!profile) {
    return null;
  }

  function handleContinueWithAnimation() {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(exitFadeAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(exitSlideAnim, {
        toValue: 18,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onContinue();
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={{
          flex: 1,
          opacity: exitFadeAnim,
          transform: [{ translateY: exitSlideAnim }],
        }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {!hidePreReveal && (
            <Animated.View
              style={[
                styles.preRevealStage,
                {
                opacity: preRevealOpacity,
                transform: [{ translateY: preRevealTranslateY }],
                },
              ]}
            >
              <View style={styles.preRevealTrack}>
                <Animated.View
                  style={[
                    styles.preRevealFill,
                    {
                      width: milestoneProgressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.preRevealText}>Pinpointing your biggest milestone...</Text>
            </Animated.View>
          )}

          {showMilestoneContent && (
            <Animated.View
              style={{
                opacity: milestoneContentOpacity,
                transform: [{ translateY: milestoneContentTranslateY }],
              }}
            >
              <Text style={styles.title}>HERE&apos;S YOUR FIRST MOVE</Text>
              <Text style={styles.subtitle}>Based on your answers, this is the highest-impact step to start with.</Text>

              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>{level}</Text>
              </View>

              <View style={styles.priorityCard}>
                <Text style={styles.sectionLabel}>BIGGEST MILESTONE</Text>
                <Text style={styles.milestone}>{firstMilestone}</Text>
              </View>

              <View style={styles.reasonCard}>
                <Text style={styles.sectionLabel}>WHY THIS FIRST</Text>
                <Text style={styles.reason}>{reason}</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
            onPress={handleContinueWithAnimation}
            disabled={isTransitioning}
          >
            <Text style={styles.ctaBtnText}>CONTINUE TO ROADMAP</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: "#0f1115",
  },
  progressLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 11,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    lineHeight: 32,
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    color: "#aab3c3",
    lineHeight: 22,
    marginBottom: 18,
  },
  levelPill: {
    alignSelf: "flex-start",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#7c5cff",
    backgroundColor: "#1d1835",
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  levelPillText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 18,
    color: "#ddd6ff",
  },
  preRevealStage: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 420,
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 17,
    color: "#b7adff",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  priorityCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 16,
    marginBottom: 12,
  },
  preRevealText: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 19,
    color: "#cfd7e6",
    lineHeight: 22,
    marginTop: 14,
    textAlign: "center",
  },
  preRevealTrack: {
    width: "84%",
    height: 5,
    borderRadius: 100,
    backgroundColor: "#2b2f38",
    overflow: "hidden",
  },
  preRevealFill: {
    height: "100%",
    backgroundColor: "#7c5cff",
  },
  milestone: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 25,
    color: "#f5f7fb",
    lineHeight: 32,
    letterSpacing: 0.4,
  },
  reasonCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 16,
    marginBottom: 12,
  },
  reason: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17.5,
    color: "#cfd7e6",
    lineHeight: 24,
  },
  ctaBtn: {
    backgroundColor: "#7c5cff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  ctaBtnText: {
    color: "#f5f7fb",
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
