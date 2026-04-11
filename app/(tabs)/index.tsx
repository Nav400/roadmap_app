import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

import { GradientBackground } from "@/components/gradient-background";
import OnboardingScreen from "../onboarding";
import RevealScreen from "../reveal";
import RoadmapLoadingScreen from "../roadmap_loading";
import RoadmapScreen, { FAKE_PROJECTS } from "../roadmap";
import GoalDetailScreen from "../goal_detail";
import type { RoadmapGoalSelection } from "@/constants/goal-details";
import { getPriorityMilestone } from "@/constants/priority-milestone";

const { height } = Dimensions.get("window");
const EMPTY_TASK_IDS: string[] = [];
type MainTab = "home" | "roadmap" | "events" | "profile";
const TAB_MASK_MAX_OPACITY = 1;
const TAB_SWAP_SETTLE_MS = 90;
type RoadmapTab = "milestones" | "projects" | "events" | "completed";

function AnimatedBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim1, {
        toValue: 1,
        duration: 6800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(anim2, {
        toValue: 1,
        duration: 8400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(anim3, {
        toValue: 1,
        duration: 9800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim1, anim2, anim3]);

  const blob1Y = anim1.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -32, -10, 18, 0],
  });
  const blob1X = anim1.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 28, -12, -26, 0],
  });
  const blob2Y = anim2.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 22, -8, -26, 0],
  });
  const blob2X = anim2.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -24, -6, 22, 0],
  });
  const blob3Y = anim3.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -18, 14, -12, 0],
  });
  const blob3X = anim3.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 16, -20, 10, 0],
  });
  const blob1Opacity = anim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.25, 0.15] });
  const blob2Opacity = anim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.2, 0.1] });
  const blob3Opacity = anim3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.15, 0.08] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.blob,
          {
            width: 320,
            height: 320,
            backgroundColor: "#4c1d95",
            borderRadius: 160,
            top: -60,
            left: -80,
            opacity: blob1Opacity,
            transform: [{ translateY: blob1Y }, { translateX: blob1X }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: 280,
            height: 280,
            backgroundColor: "#6d28d9",
            borderRadius: 140,
            top: height * 0.3,
            right: -80,
            opacity: blob2Opacity,
            transform: [{ translateY: blob2Y }, { translateX: blob2X }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: 240,
            height: 240,
            backgroundColor: "#a855f7",
            borderRadius: 120,
            bottom: 80,
            left: 20,
            opacity: blob3Opacity,
            transform: [{ translateY: blob3Y }, { translateX: blob3X }],
          },
        ]}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [screen, setScreen] = useState<"landing" | "onboarding" | "reveal" | "loading" | "mainApp" | "goalDetail">("landing");
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [renderedMainTab, setRenderedMainTab] = useState<MainTab>("home");
  const [profile, setProfile] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<RoadmapGoalSelection | null>(null);
  const [pendingGoalCompletion, setPendingGoalCompletion] = useState<{ goal: RoadmapGoalSelection; requestId: number } | null>(null);
  const [goalMiniTaskProgress, setGoalMiniTaskProgress] = useState<Record<string, string[]>>({});
  const [roadmapStartTab, setRoadmapStartTab] = useState<RoadmapTab>("milestones");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const goalCompletionRequestCounter = useRef(0);
  const tabFadeAnim = useRef(new Animated.Value(0)).current;
  const isTabAnimatingRef = useRef(false);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealRaf1Ref = useRef<number | null>(null);
  const revealRaf2Ref = useRef<number | null>(null);

  const handleMiniTaskProgressChange = useCallback((goal: RoadmapGoalSelection, checkedTaskIds: string[]) => {
    const goalKey = `${goal.type}:${goal.id}`;
    setGoalMiniTaskProgress((prev) => {
      const normalizedTaskIds = [...checkedTaskIds].sort();
      const prevTaskIds = prev[goalKey] ?? EMPTY_TASK_IDS;
      const hasSameLength = prevTaskIds.length === normalizedTaskIds.length;
      const hasSameItems = hasSameLength && prevTaskIds.every((taskId, index) => taskId === normalizedTaskIds[index]);

      if (hasSameItems) {
        return prev;
      }

      return {
        ...prev,
        [goalKey]: normalizedTaskIds,
      };
    });
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
      if (revealRaf1Ref.current !== null) {
        cancelAnimationFrame(revealRaf1Ref.current);
        revealRaf1Ref.current = null;
      }
      if (revealRaf2Ref.current !== null) {
        cancelAnimationFrame(revealRaf2Ref.current);
        revealRaf2Ref.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (screen !== "mainApp") {
      return;
    }

    if (mainTab === renderedMainTab || isTabAnimatingRef.current) {
      return;
    }

    if (swapTimeoutRef.current) {
      clearTimeout(swapTimeoutRef.current);
      swapTimeoutRef.current = null;
    }
    if (revealRaf1Ref.current !== null) {
      cancelAnimationFrame(revealRaf1Ref.current);
      revealRaf1Ref.current = null;
    }
    if (revealRaf2Ref.current !== null) {
      cancelAnimationFrame(revealRaf2Ref.current);
      revealRaf2Ref.current = null;
    }

    isTabAnimatingRef.current = true;
    tabFadeAnim.stopAnimation();
    Animated.timing(tabFadeAnim, {
      toValue: TAB_MASK_MAX_OPACITY,
      duration: 360,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      swapTimeoutRef.current = setTimeout(() => {
        setRenderedMainTab(mainTab);
        revealRaf1Ref.current = requestAnimationFrame(() => {
          revealRaf2Ref.current = requestAnimationFrame(() => {
            Animated.timing(tabFadeAnim, {
              toValue: 0,
              duration: 460,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(() => {
              isTabAnimatingRef.current = false;
            });
          });
        });
      }, TAB_SWAP_SETTLE_MS);
    });
  }, [mainTab, renderedMainTab, screen, tabFadeAnim]);

  const handleMainTabPress = useCallback((nextTab: MainTab) => {
    if (nextTab === mainTab || isTabAnimatingRef.current) {
      return;
    }

    setMainTab(nextTab);
  }, [mainTab]);

  const openRoadmapTab = useCallback((nextTab: RoadmapTab) => {
    setRoadmapStartTab(nextTab);
    handleMainTabPress("roadmap");
  }, [handleMainTabPress]);

  function handleGetStartedPress() {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 18,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScreen("onboarding");
    });
  }

  if (screen === "onboarding") {
    return (
      <OnboardingScreen
        startAtQuestions
        onComplete={(data) => {
          setProfile(data);
          setScreen("reveal");
        }}
      />
    );
  }

  if (screen === "reveal") {
    return <RevealScreen profile={profile} onContinue={() => setScreen("loading")} />;
  }

  if (screen === "loading") {
    return (
      <RoadmapLoadingScreen
        profile={profile}
        onComplete={() => {
          setMainTab("home");
          setScreen("mainApp");
        }}
      />
    );
  }

  if (screen === "mainApp" || screen === "goalDetail") {
    const priorityMilestone = getPriorityMilestone(profile ?? {});
    const featuredProject = FAKE_PROJECTS[0];
    const goalsSummary = Array.isArray(profile?.goals) && profile.goals.length > 0
      ? profile.goals.join(" • ")
      : "No goals selected yet";
    const showRoadmapLayer = (renderedMainTab === "roadmap" || renderedMainTab === "events") && screen !== "goalDetail";
    const showHomeLayer = renderedMainTab === "home" && screen !== "goalDetail";
    const showProfileLayer = renderedMainTab === "profile" && screen !== "goalDetail";

    return (
      <View style={styles.mainContainer}>
        <GradientBackground />
        <AnimatedBackground />
        <SafeAreaView style={styles.mainSafe}>
          <View style={styles.mainContent}>
            <Animated.View
              style={[
                styles.stackContainer,
              ]}
            >
              <View style={[styles.stackLayer, !showRoadmapLayer && styles.hiddenLayer]}>
                <RoadmapScreen
                  profile={profile}
                  viewMode={renderedMainTab === "events" ? "events" : "roadmap"}
                  startTab={roadmapStartTab}
                  autoCompleteGoalRequest={pendingGoalCompletion}
                  onAutoCompleteHandled={(requestId) => {
                    setPendingGoalCompletion((prev) => (prev && prev.requestId === requestId ? null : prev));
                  }}
                  onOpenGoal={(goal) => {
                    setSelectedGoal(goal);
                    setScreen("goalDetail");
                  }}
                />
              </View>

              <View style={[styles.stackLayer, !showHomeLayer && styles.hiddenLayer]}>
                <ScrollView contentContainerStyle={styles.homeContainer} showsVerticalScrollIndicator={false}>
                  <Text style={styles.homeTitle}>Top priorities today</Text>
                  <Text style={styles.homeSubtitle}>Start with these, then continue through your full roadmap.</Text>

                  <View style={styles.homeCard}>
                    <Text style={styles.homeCardLabel}>Top priority milestone</Text>
                    <Text style={styles.homeCardTitle}>{priorityMilestone.title}</Text>
                    <Text style={styles.homeCardBody}>{priorityMilestone.reason}</Text>
                    <TouchableOpacity style={styles.homeButton} onPress={() => openRoadmapTab("milestones")}>
                      <Text style={styles.homeButtonText}>Open roadmap</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.homeCard}>
                    <Text style={styles.homeCardLabel}>Top priority project</Text>
                    <Text style={styles.homeCardTitle}>{featuredProject?.title}</Text>
                    <Text style={styles.homeCardBody}>{featuredProject?.desc}</Text>
                    <TouchableOpacity style={styles.homeButtonAlt} onPress={() => openRoadmapTab("projects")}>
                      <Text style={styles.homeButtonText}>See projects</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>

              <View style={[styles.stackLayer, !showProfileLayer && styles.hiddenLayer]}>
                <ScrollView contentContainerStyle={styles.profileContainer} showsVerticalScrollIndicator={false}>
                  <Text style={styles.homeTitle}>Your information</Text>
                  <Text style={styles.homeSubtitle}>School details, goals, and quick settings.</Text>

                  <View style={styles.profileCard}>
                    <Text style={styles.profileLabel}>School</Text>
                    <Text style={styles.profileValue}>{profile?.school || "Not set"}</Text>
                  </View>
                  <View style={styles.profileCard}>
                    <Text style={styles.profileLabel}>Major</Text>
                    <Text style={styles.profileValue}>{profile?.major || "Not set"}</Text>
                  </View>
                  <View style={styles.profileCard}>
                    <Text style={styles.profileLabel}>Year</Text>
                    <Text style={styles.profileValue}>{profile?.year || "Not set"}</Text>
                  </View>
                  <View style={styles.profileCard}>
                    <Text style={styles.profileLabel}>Goals</Text>
                    <Text style={styles.profileValue}>{goalsSummary}</Text>
                  </View>

                  <Text style={styles.settingsHeader}>Settings</Text>
                  <View style={styles.settingRow}><Text style={styles.settingText}>Notifications</Text><Text style={styles.settingValue}>On</Text></View>
                  <View style={styles.settingRow}><Text style={styles.settingText}>Study reminders</Text><Text style={styles.settingValue}>On</Text></View>
                  <View style={styles.settingRow}><Text style={styles.settingText}>Theme</Text><Text style={styles.settingValue}>Nebula Dark</Text></View>
                </ScrollView>
              </View>
            </Animated.View>

            {screen === "goalDetail" && selectedGoal && (
              <View style={styles.stackLayer}>
                <GoalDetailScreen
                  goal={selectedGoal}
                  initialCheckedTaskIds={goalMiniTaskProgress[`${selectedGoal.type}:${selectedGoal.id}`] ?? EMPTY_TASK_IDS}
                  onMiniTaskProgressChange={handleMiniTaskProgressChange}
                  onBack={() => setScreen("mainApp")}
                  onCompleteGoal={(goal) => {
                    goalCompletionRequestCounter.current += 1;
                    setPendingGoalCompletion({ goal, requestId: goalCompletionRequestCounter.current });
                    setScreen("mainApp");
                  }}
                />
              </View>
            )}
          </View>
      </SafeAreaView>

      {screen === "mainApp" && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tabTransitionMask,
            {
              opacity: tabFadeAnim,
            },
          ]}
        />
      )}

      {screen === "mainApp" && (
        <View style={styles.bottomNav}>
          {([
            { key: "home", label: "Home", icon: "home" },
            { key: "roadmap", label: "Roadmap", icon: "route" },
            { key: "events", label: "Events", icon: "event" },
            { key: "profile", label: "Profile", icon: "person" },
          ] as const).map((tab) => {
            const active = mainTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.bottomNavButton}
                onPress={() => {
                  if (tab.key === "roadmap") {
                    setRoadmapStartTab("milestones");
                  }
                  handleMainTabPress(tab.key);
                }}
              >
                <MaterialIcons name={tab.icon} size={28} color={active ? "#e8deff" : "#8f98ab"} />
                <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <AnimatedBackground />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >


          <Text style={styles.headline}>Stop feeling{"\n"}lost in your{"\n"}major</Text>

          

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>2 min</Text>
              <Text style={styles.statDesc}>to your roadmap</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>100%</Text>
              <Text style={styles.statDesc}>personalized</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>Free</Text>
              <Text style={styles.statDesc}>to start</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleGetStartedPress}
            disabled={isTransitioning}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#7c5cff", "#9274ff", "#b9a7ff"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaBtnText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  mainSafe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainContent: {
    flex: 1,
    paddingBottom: 86,
  },
  stackContainer: {
    flex: 1,
  },
  stackLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  tabTransitionMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0b1120",
  },
  hiddenLayer: {
    display: "none",
  },
  homeContainer: {
    padding: 22,
    paddingBottom: 130,
  },
  homeKicker: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 13,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  homeTitle: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 34,
    color: "#f5f7fb",
    marginBottom: 4,
  },
  homeSubtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#aab3c3",
    lineHeight: 25,
    marginBottom: 18,
  },
  homeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#262e42",
    backgroundColor: "#121826",
    padding: 16,
    marginBottom: 12,
  },
  homeCardLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  homeCardTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 24,
    color: "#f5f7fb",
    lineHeight: 28,
    marginBottom: 8,
  },
  homeCardBody: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#c7cfde",
    lineHeight: 25,
    marginBottom: 12,
  },
  homeButton: {
    alignItems: "center",
    backgroundColor: "#7c5cff",
    borderRadius: 999,
    paddingVertical: 11,
  },
  homeButtonAlt: {
    alignItems: "center",
    backgroundColor: "#1b2336",
    borderRadius: 999,
    paddingVertical: 11,
  },
  homeButtonText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    color: "#f5f7fb",
  },
  profileContainer: {
    padding: 22,
    paddingBottom: 130,
  },
  profileCard: {
    borderRadius: 16,
    fontSize: 13,
    borderColor: "#262e42",
    backgroundColor: "#121826",
    padding: 14,
    marginBottom: 10,
  },
  profileLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#a8b2c5",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  profileValue: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 18,
    color: "#f5f7fb",
    lineHeight: 23,
  },
  settingsHeader: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 14,
    color: "#b7adff",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  settingText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 18,
    color: "#f5f7fb",
  },
  settingValue: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    color: "#adb6c8",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0f1320",
    flexDirection: "row",
    paddingTop: 13,
    paddingBottom: 22,
  },
  bottomNavButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bottomNavLabel: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 12,
    color: "#8f98ab",
  },
  bottomNavLabelActive: {
    color: "#e8deff",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-end",
    paddingBottom: 52,
  },
  blob: {
    position: "absolute",
  },
  topLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 20,
  },
  topLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7ab648",
  },
  topLabelText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#555",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 48,
    color: "#fff",
    lineHeight: 54,
    letterSpacing:1,
    marginBottom: 100,
  },
  subtext: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 36,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#575757",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  statDesc: {
    fontSize: 15,
    color: "#999999",
    textAlign: "center",
  },
  statDivider: {
    width: 1.5,
    height: 34,
    backgroundColor: "#575757",
  },
  ctaBtn: {
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  ctaGradient: {
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 14,
  },
  ctaBtnText: {
    color: "#f7f5ff",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: "ClashGrotesk-Bold",
    letterSpacing: 1,
  },
  finePrint: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontFamily: "monospace",
  },
});
