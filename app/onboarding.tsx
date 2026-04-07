import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

const MAJORS = ["Computer Science", "Computer Engineering", "Data Science", "Software Eng.", "Cybersecurity", "AI / ML"];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const GOALS = ["Get a SWE internship", "Do research", "Build a startup", "Go to grad school", "Work in ML/AI"];
const SKILLS = [
  { id: "coding", label: "Coding Languages" },
  { id: "dsa", label: "Data Structures" },
  { id: "git", label: "Git / Version Ctrl" },
  { id: "web", label: "Web Development" },
  { id: "math", label: "Discrete Math" },
  { id: "systems", label: "Systems / OS" },
];
const SKILL_DESCRIPTIONS: Record<string, string> = {
  coding: "Writing code in languages (ex: Python, Java, C++), solving problems with functions, and understanding core programming patterns.",
  dsa: "Using common data structures like arrays, stacks, queues, trees, linked lists, and applying algorithmic thinking.",
  git: "Version control basics: commits, branches, pull requests, and collaborating safely in codebases.",
  web: "Building web apps with frontend UI, backend APIs, and connecting data between them.",
  math: "Discrete math topics like logic, sets, combinatorics, and proofs used in CS courses.",
  systems: "Operating systems and systems concepts including processes, memory, concurrency, and performance.",
};
const LEVEL_LABELS = ["None", "Heard of it", "Beginner", "Comfortable", "Strong"];
const SKILL_SHEET_HEIGHT = 220;

type OnboardingScreenProps = {
  onComplete: (data: any) => void;
  startAtQuestions?: boolean;
};

export default function OnboardingScreen({ onComplete, startAtQuestions = false }: OnboardingScreenProps) {
  const TOTAL_STEPS = 4;
  const [selectedMajor, setSelectedMajor] = useState("Computer Science");
  const [selectedYear, setSelectedYear] = useState("Freshman");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Get a SWE internship"]);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(startAtQuestions);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({
    coding: 0, dsa: 0, git: 0, web: 0, math: 0, systems: 0,
  });
  const containerBottomPadding = started ? (step <= 1 ? 120 : 180) : 48;
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const exitSlideAnim = useRef(new Animated.Value(0)).current;
  const skillSheetTranslateY = useRef(new Animated.Value(SKILL_SHEET_HEIGHT + 40)).current;
  const activeSkillRef = useRef<string | null>(null);
  const prevStepRef = useRef(0);

  useEffect(() => {
    activeSkillRef.current = activeSkillId;
  }, [activeSkillId]);

  const skillSheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        activeSkillRef.current !== null && gestureState.dy > 6,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          skillSheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 1.2) {
          setActiveSkillId(null);
          return;
        }

        Animated.spring(skillSheetTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (!started) {
      return;
    }

    Animated.timing(progressAnim, {
      toValue: (step + 1) / TOTAL_STEPS,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const direction = step >= prevStepRef.current ? 1 : -1;
    contentOpacity.setValue(0.12);
    contentTranslateY.setValue(direction * 12);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    prevStepRef.current = step;
  }, [TOTAL_STEPS, contentOpacity, contentTranslateY, progressAnim, started, step]);

  useEffect(() => {
    Animated.spring(skillSheetTranslateY, {
      toValue: activeSkillId ? 0 : SKILL_SHEET_HEIGHT + 40,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeSkillId, skillSheetTranslateY]);

  useEffect(() => {
    if (step !== 2) {
      setActiveSkillId(null);
    }
  }, [step]);

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function setSkill(id: string, level: number) {
    setSkillLevels((prev) => ({
      ...prev,
      [id]: prev[id] === level ? 0 : level,
    }));
  }

  function toggleSkillSheet(skillId: string) {
    setActiveSkillId((prev) => (prev === skillId ? null : skillId));
  }

  function closeSkillSheet() {
    setActiveSkillId(null);
  }

  function handleSubmitWithAnimation() {
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
      onComplete({
        major: selectedMajor,
        year: selectedYear,
        goals: selectedGoals,
        skills: skillLevels,
      });
    });
  }

  function goNext() {
    if (!started) {
      setStarted(true);
      setStep(0);
      return;
    }

    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    handleSubmitWithAnimation();
  }

  function goBack() {
    if (!started) {
      return;
    }

    if (step > 0) {
      setStep((prev) => prev - 1);
      return;
    }

    setStarted(false);
  }

  function getStepTitle() {
    if (step === 0) return "What's your major?";
    if (step === 1) return "What year are you in?";
    if (step === 2) return "Rate your current skills";
    return "WHAT ARE YOUR GOALS?";
  }

  function renderTitle() {
    if (!started) {
      return <Text style={styles.title}>{/*Answer a few quick questions*/}</Text>;
    }

    if (step === 0) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.titleSmallRest}>WHAT&apos;S YOUR MAJOR?</Text>
        </View>
      );
    }
    if (step === 1) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.titleSmallRest}>WHAT YEAR ARE YOU IN?</Text>
        </View>
      );
    }
    if (step === 2) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.titleSmallRest}>RATE YOUR CURRENT SKILLS</Text>
        </View>
      );
    }

    return <Text style={styles.title}>{getStepTitle()}</Text>;
  }

  function renderStepContent() {
    if (!started) {
      return null;
    }

    if (step === 0) {
      return (
        <>
          <View style={styles.pillGroup}>
            {MAJORS.map((m) => (
              <Pressable
                key={m}
                style={({ pressed }) => [
                  styles.pill,
                  selectedMajor === m && styles.pillSelected,
                  pressed && styles.pillPressed,
                ]}
                onPress={() => setSelectedMajor(m)}
              >
                <Text style={[styles.pillText, selectedMajor === m && styles.pillTextSelected]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <View style={styles.yearGroup}>
            {YEARS.map((y) => (
              <Pressable
                key={y}
                style={({ pressed }) => [
                  styles.yearPill,
                  selectedYear === y && styles.pillSelected,
                  pressed && styles.pillPressed,
                ]}
                onPress={() => setSelectedYear(y)}
              >
                <Text style={[styles.pillText, selectedYear === y && styles.pillTextSelected]}>{y}</Text>
              </Pressable>
            ))}
          </View>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          {SKILLS.map((skill) => (
            <View key={skill.id} style={styles.skillCard}>
              <View style={styles.skillHeaderRow}>
                <Pressable
                  style={({ pressed }) => [styles.skillNameBtn, pressed && styles.skillNameBtnPressed]}
                  onPress={() => toggleSkillSheet(skill.id)}
                >
                  <Text style={styles.skillName}>{skill.label}</Text>
                  <Text style={styles.skillHint}>tap for description</Text>
                </Pressable>
                <Text style={styles.skillLevelLabel}>{LEVEL_LABELS[skillLevels[skill.id]]}</Text>
              </View>
              <View style={styles.skillDots}>
                {[1, 2, 3, 4].map((dot) => (
                  <Pressable
                    key={dot}
                    style={({ pressed }) => [
                      styles.dot,
                      skillLevels[skill.id] >= dot && styles.dotFilled,
                      pressed && styles.dotPressed,
                    ]}
                    onPress={() => setSkill(skill.id, dot)}
                  />
                ))}
              </View>
            </View>
          ))}
        </>
      );
    }

    return (
      <>
        <View style={styles.pillGroup}>
          {GOALS.map((g) => (
            <Pressable
              key={g}
              style={({ pressed }) => [
                styles.pill,
                selectedGoals.includes(g) && styles.pillSelected,
                pressed && styles.pillPressed,
              ]}
              onPress={() => toggleGoal(g)}
            >
              <Text style={[styles.pillText, selectedGoals.includes(g) && styles.pillTextSelected]}>{g}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  function renderIntroContent() {
    if (started) {
      return null;
    }

    return (
      <View style={styles.introLayout}>
        <Text style={styles.title}>Answer a few quick questions</Text>
        <Pressable style={({ pressed }) => [styles.ctaBtn, styles.introBtn, pressed && styles.ctaBtnPressed]} onPress={goNext}>
          <Text style={styles.ctaBtnText}>GET STARTED</Text>
        </Pressable>
      </View>
    );
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
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: containerBottomPadding }]} showsVerticalScrollIndicator={false}>
          {started && (
            <>
              <Text style={styles.progressLabel}>step {step + 1} of {TOTAL_STEPS}</Text>
              <View style={styles.progressTrack} onLayout={(event) => setProgressTrackWidth(event.nativeEvent.layout.width)}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: Animated.multiply(progressAnim, progressTrackWidth || 1),
                    },
                  ]}
                />
              </View>
            </>
          )}
          {renderTitle()}
          {started && (
            <Text style={styles.subtitle}>Pick a few details so we can build your personalized roadmap.</Text>
          )}

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {renderIntroContent()}
            {renderStepContent()}
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {started && (
        <View style={styles.footer}>
          {step > 0 && (
            <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]} onPress={goBack}>
              <Text style={styles.secondaryBtnText}>BACK</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
            onPress={goNext}
            disabled={isTransitioning}
          >
            <Text style={styles.ctaBtnText}>
              {step === TOTAL_STEPS - 1 ? "GENERATE MY ROADMAP" : "NEXT"}
            </Text>
          </Pressable>
        </View>
      )}

      {activeSkillId && <Pressable style={styles.skillSheetBackdrop} onPress={closeSkillSheet} />}

      <Animated.View
        style={[
          styles.skillSheet,
          {
            transform: [{ translateY: skillSheetTranslateY }],
          },
        ]}
        pointerEvents={activeSkillId ? "auto" : "none"}
      >
        <View style={styles.skillSheetHandleArea} {...skillSheetPanResponder.panHandlers}>
          <View style={styles.skillSheetHandle} />
        </View>
        <View style={styles.skillSheetHeader}>
          <Text style={styles.skillSheetTitle}>{SKILLS.find((s) => s.id === activeSkillId)?.label}</Text>
          <Pressable style={({ pressed }) => [styles.skillSheetCloseBtn, pressed && styles.skillSheetCloseBtnPressed]} onPress={closeSkillSheet}>
            <Text style={styles.skillSheetCloseText}>close</Text>
          </Pressable>
        </View>
        <Text style={styles.skillSheetBody}>
          {activeSkillId ? SKILL_DESCRIPTIONS[activeSkillId] : ""}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  logo: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#8d7dff",
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 11,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 100,
    backgroundColor: "#2b2f38",
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c5cff",
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  titleLargeW: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 56,
    color: "#f5f7fb",
    letterSpacing: 0.2,
    lineHeight: 56,
  },
  titleSmallRest: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    textAlign: "center",
    color: "#f5f7fb",
    letterSpacing: 0.2,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#aab3c3",
    lineHeight: 22,
    marginBottom: 28,
  },
  introLayout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    gap: 20,
    minHeight: 520,
    paddingVertical: 32,
  },
  introBtn: {
    alignSelf: "stretch",
    marginTop: 18,
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#b7adff",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
  },
  yearGroup: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 24,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
    width: "100%",
    alignItems: "center",
  },
  pillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  pillSelected: {
    backgroundColor: "#1d1835",
    borderColor: "#7c5cff",
  },
  pillText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 20,
    color: "#b0b9c8",
  },
  pillTextSelected: {
    color: "#ddd6ff",
  },
  skillCard: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    marginBottom: 14,
  },
  skillHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  skillNameBtn: {
    maxWidth: "72%",
    alignItems: "flex-start",
  },
  skillNameBtnPressed: {
    opacity: 0.8,
  },
  skillName: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 17,
    color: "#e6ebf3",
  },
  skillHint: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 10,
    color: "#8c96aa",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skillDots: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  dot: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#2d3340",
  },
  dotFilled: {
    backgroundColor: "#7c5cff",
  },
  dotPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  skillLevelLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 13,
    color: "#b7adff",
    width: 74,
    textAlign: "right",
  },
  ctaBtn: {
    backgroundColor: "#7c5cff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  ctaBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  ctaBtnText: {
    fontFamily: "ClashGrotesk-Bold",
    color: "#f7f5ff",
    fontSize: 15,
    letterSpacing: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#0f1115",
    borderTopWidth: 1,
    borderTopColor: "#222836",
    gap: 10,
  },
  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    textTransform: "uppercase",
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  secondaryBtnText: {
    fontFamily: "ClashGrotesk-Semibold",
    color: "#b7adff",
    fontSize: 15,
    textTransform: "uppercase",
  },
  secondaryBtnPressed: {
    opacity: 0.75,
  },
  secondaryBtnSpacer: {
    width: 0,
  },
  skillSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 20,
  },
  skillSheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: SKILL_SHEET_HEIGHT,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2b3344",
    backgroundColor: "#141b29",
    paddingHorizontal: 16,
    paddingBottom: 18,
    zIndex: 30,
  },
  skillSheetHandleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
  },
  skillSheetHandle: {
    width: 52,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#48516a",
  },
  skillSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  skillSheetTitle: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 22,
    letterSpacing: 0.4,
    color: "#f1f5ff",
  },
  skillSheetCloseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#3a445b",
  },
  skillSheetCloseBtnPressed: {
    opacity: 0.75,
  },
  skillSheetCloseText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#aeb8ce",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skillSheetBody: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#c8d0e0",
    lineHeight: 21,
  },
});
