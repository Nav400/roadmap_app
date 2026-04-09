import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { GradientBackground } from "@/components/gradient-background";

export default function RevealScreen({ profile, onContinue }: { profile: any; onContinue: () => void }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [milestoneReady, setMilestoneReady] = useState(false);
  const [showMilestoneContent, setShowMilestoneContent] = useState(false);
  const [hidePreReveal, setHidePreReveal] = useState(false);
  const milestoneProgressAnim = useRef(new Animated.Value(0)).current;
  const preRevealOpacity = useRef(new Animated.Value(1)).current;
  const preRevealTranslateY = useRef(new Animated.Value(0)).current;
  const milestoneContentOpacity = useRef(new Animated.Value(0)).current;
  const milestoneContentTranslateY = useRef(new Animated.Value(10)).current;
  const milestonePopupScale = useRef(new Animated.Value(0.96)).current;
  const milestonePopupRotate = useRef(new Animated.Value(0)).current;
  const ripplePrimaryOpacity = useRef(new Animated.Value(0)).current;
  const ripplePrimaryScale = useRef(new Animated.Value(0.24)).current;
  const celebrationSparkleAnim = useRef(new Animated.Value(0)).current;
  const milestoneTitlePulse = useRef(new Animated.Value(0.96)).current;

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
      { toValue: 10, duration: 520 },
      { toValue: 10, duration: 380 },
      { toValue: 40, duration: 760 },
      { toValue: 40, duration: 420 },
      { toValue: 80, duration: 860 },
      { toValue: 80, duration: 420 },
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
    milestoneContentOpacity.setValue(0);
    milestoneContentTranslateY.setValue(28);
    milestonePopupScale.setValue(0.86);
    milestonePopupRotate.setValue(-1.8);
    ripplePrimaryOpacity.setValue(0);
    ripplePrimaryScale.setValue(0.24);
    celebrationSparkleAnim.setValue(0);
    milestoneTitlePulse.setValue(0.96);

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
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(milestoneContentTranslateY, {
          toValue: -8,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(milestoneContentTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 95,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(milestonePopupScale, {
          toValue: 1.06,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(milestonePopupScale, {
          toValue: 1,
          friction: 7,
          tension: 95,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(milestonePopupRotate, {
          toValue: 0.5,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(milestonePopupRotate, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ripplePrimaryOpacity, {
            toValue: 0.82,
            duration: 620,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ripplePrimaryOpacity, {
            toValue: 0,
            duration: 5000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ripplePrimaryScale, {
          toValue: 2.7,
          duration: 5600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(celebrationSparkleAnim, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(milestoneTitlePulse, {
          toValue: 1.08,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(milestoneTitlePulse, {
          toValue: 1,
          friction: 6,
          tension: 95,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setHidePreReveal(true);
    });
  }, [
    celebrationSparkleAnim,
    milestoneTitlePulse,
    milestoneReady,
    milestonePopupScale,
    milestonePopupRotate,
    ripplePrimaryOpacity,
    ripplePrimaryScale,
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
      Animated.timing(milestoneContentOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(milestoneContentTranslateY, {
        toValue: 16,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(milestonePopupScale, {
        toValue: 0.97,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(milestonePopupRotate, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ripplePrimaryOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(celebrationSparkleAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onContinue();
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GradientBackground variant="soft" />
      <View style={styles.screenContent}>
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
              >
                <LinearGradient
                  colors={["#7c5cff", "#9274ff", "#b9a7ff"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
            <Text style={styles.preRevealText}>Pinpointing your biggest milestone...</Text>
          </Animated.View>
        )}

        {showMilestoneContent && (
          <Animated.View style={[styles.popupBackdrop, { opacity: milestoneContentOpacity }]}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.rippleLayer,
                {
                  opacity: ripplePrimaryOpacity,
                  transform: [{ scale: ripplePrimaryScale }],
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sparkleDot,
                styles.sparkleDotOne,
                {
                  opacity: celebrationSparkleAnim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -38],
                      }),
                    },
                    {
                      scale: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.6, 1.05, 0.86],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sparkleDot,
                styles.sparkleDotTwo,
                {
                  opacity: celebrationSparkleAnim.interpolate({
                    inputRange: [0, 0.25, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -52],
                      }),
                    },
                    {
                      scale: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 0.45, 1],
                        outputRange: [0.55, 1, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sparkleDot,
                styles.sparkleDotThree,
                {
                  opacity: celebrationSparkleAnim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -44],
                      }),
                    },
                    {
                      scale: celebrationSparkleAnim.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.5, 0.95, 0.75],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.popupCard,
                {
                  transform: [
                    { translateY: milestoneContentTranslateY },
                    { scale: milestonePopupScale },
                    {
                      rotate: milestonePopupRotate.interpolate({
                        inputRange: [-2, 2],
                        outputRange: ["-2deg", "2deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <ScrollView style={styles.popupScroll} contentContainerStyle={styles.popupScrollContent} showsVerticalScrollIndicator={false}>
                <Animated.Text style={[styles.title, { transform: [{ scale: milestoneTitlePulse }] }]}>HERE&apos;S YOUR FIRST MOVE</Animated.Text>
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
              </ScrollView>

              <View style={styles.popupFooter}>
                <Pressable
                  style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
                  onPress={handleContinueWithAnimation}
                  disabled={isTransitioning}
                >
                  <LinearGradient
                    colors={["#7c5cff", "#9274ff", "#b9a7ff"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaBtnText}>CONTINUE TO ROADMAP</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  screenContent: {
    flex: 1,
    padding: 24,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 11, 17, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  popupCard: {
    width: "100%",
    maxHeight: "86%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2c3343",
    backgroundColor: "#111724",
    overflow: "hidden",
  },
  rippleLayer: {
    position: "absolute",
    width: 980,
    height: 980,
    borderRadius: 490,
    backgroundColor: "rgba(165, 138, 255, 0.22)",
    top: "50%",
    left: "50%",
    marginLeft: -490,
    marginTop: -490,
  },
  sparkleDot: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#d5c8ff",
  },
  sparkleDotOne: {
    width: 10,
    height: 10,
    left: "22%",
    top: "28%",
  },
  sparkleDotTwo: {
    width: 14,
    height: 14,
    right: "22%",
    top: "26%",
    backgroundColor: "#bfa6ff",
  },
  sparkleDotThree: {
    width: 8,
    height: 8,
    right: "33%",
    top: "32%",
    backgroundColor: "#f0e8ff",
  },
  popupScroll: {
    flexGrow: 0,
  },
  popupScrollContent: {
    padding: 18,
    paddingBottom: 12,
  },
  popupFooter: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#242b3a",
    backgroundColor: "#111724",
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#b7adff",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
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
    fontSize: 20,
    color: "#cfd7e6",
    lineHeight: 22,
    marginTop: 14,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  preRevealTrack: {
    width: "84%",
    height: 12,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  preRevealFill: {
    height: "100%",
    backgroundColor: "transparent",
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
    borderRadius: 10,
    alignItems: "center",
    overflow: "hidden",
  },
  ctaGradient: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
  },
  ctaBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  ctaBtnText: {
    color: "#f5f7fb",
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
