import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getGoalDetailContent, type RoadmapGoalSelection } from "@/constants/goal-details";

export default function GoalDetailScreen({
  goal,
  onBack,
  onCompleteGoal,
  initialCheckedTaskIds,
  onMiniTaskProgressChange,
}: {
  goal: RoadmapGoalSelection;
  onBack: () => void;
  onCompleteGoal?: (goal: RoadmapGoalSelection) => void;
  initialCheckedTaskIds?: string[];
  onMiniTaskProgressChange?: (goal: RoadmapGoalSelection, checkedTaskIds: string[], totalTaskCount: number) => void;
}) {
  const goalKey = `${goal.type}:${goal.id}`;
  const detail = useMemo(() => getGoalDetailContent(goal), [goal]);
  const scrollRef = useRef<ScrollView | null>(null);
  const [checkedTaskIds, setCheckedTaskIds] = useState<Set<string>>(new Set());
  const [displayPercent, setDisplayPercent] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showCompleteTaskButton, setShowCompleteTaskButton] = useState(false);
  const contentOpacity = useState(() => new Animated.Value(0))[0];
  const contentTranslateX = useState(() => new Animated.Value(24))[0];
  const percentAnim = useRef(new Animated.Value(0)).current;
  const percentPillScale = useRef(new Animated.Value(1)).current;
  const completeTaskButtonAnim = useRef(new Animated.Value(0)).current;
  const taskCheckScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const taskCheckBurstAnims = useRef<Record<string, Animated.Value>>({}).current;
  const autoScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnims = useRef<{ x: Animated.Value; y: Animated.Value; rot: Animated.Value; op: Animated.Value; color: string }[]>([]);

  function spawnConfetti() {
    const colors = ["#22c97a", "#7c5cff", "#f7c948", "#ff6eb4", "#4dd5f5", "#ff8c42"];
    confettiAnims.current = Array.from({ length: 28 }, () => ({
      x: new Animated.Value((Math.random() - 0.5) * 340),
      y: new Animated.Value(0),
      rot: new Animated.Value(0),
      op: new Animated.Value(1),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setShowConfetti(true);
    Animated.parallel(
      confettiAnims.current.map((p) =>
        Animated.parallel([
          Animated.timing(p.y, { toValue: -(220 + Math.random() * 180), duration: 900 + Math.random() * 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(p.rot, { toValue: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360), duration: 1000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(p.op, { toValue: 0, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          ]),
        ])
      )
    ).start(() => setShowConfetti(false));
  }
  const shouldSkipNextProgressSync = useRef(true);

  useEffect(() => {
    shouldSkipNextProgressSync.current = true;
    setCheckedTaskIds(new Set(initialCheckedTaskIds ?? []));
    setDisplayPercent(0);
    percentAnim.setValue(0);
    percentPillScale.setValue(1);
    setShowCompleteTaskButton(false);
    completeTaskButtonAnim.setValue(0);
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, [goalKey, initialCheckedTaskIds, completeTaskButtonAnim, percentAnim, percentPillScale]);

  useEffect(() => {
    if (shouldSkipNextProgressSync.current) {
      shouldSkipNextProgressSync.current = false;
      return;
    }

    const normalizedTaskIds = Array.from(checkedTaskIds).sort();
    onMiniTaskProgressChange?.(goal, normalizedTaskIds, detail.miniTasks.length);
  }, [checkedTaskIds]);
  useEffect(() => {
    return () => {
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const listenerId = percentAnim.addListener(({ value }) => {
      setDisplayPercent(Math.round(value));
    });

    return () => {
      percentAnim.removeListener(listenerId);
    };
  }, [percentAnim]);

  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslateX.setValue(24);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateX, goal.id, goal.type]);

  function runExitAnimation(onExited: () => void) {
    if (isLeaving) {
      return;
    }

    setIsLeaving(true);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: 20,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLeaving(false);
      onExited();
    });
  }

  function handleBackPress() {
    runExitAnimation(onBack);
  }

  function toggleTask(taskId: string) {
    const isCurrentlyChecked = checkedTaskIds.has(taskId);
    runTaskToggleAnimation(taskId, !isCurrentlyChecked);

    setCheckedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  const total = detail.miniTasks.length;
  const done = checkedTaskIds.size;
  const percent = Math.round((done / Math.max(total, 1)) * 100);
  const allMiniTasksComplete = total > 0 && done === total;

  useEffect(() => {
    if (allMiniTasksComplete) {
      setShowCompleteTaskButton(true);
      completeTaskButtonAnim.setValue(0);
      Animated.sequence([
        Animated.timing(completeTaskButtonAnim, {
          toValue: 1.04,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(completeTaskButtonAnim, {
          toValue: 1,
          friction: 6,
          tension: 130,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
      autoScrollTimer.current = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
        autoScrollTimer.current = null;
      }, 130);
      return;
    }

    if (!showCompleteTaskButton) {
      return;
    }

    Animated.timing(completeTaskButtonAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowCompleteTaskButton(false);
    });
  }, [allMiniTasksComplete, completeTaskButtonAnim, showCompleteTaskButton]);

  function handleCompleteTaskPress() {
    if (!allMiniTasksComplete) {
      return;
    }

    spawnConfetti();
    setTimeout(() => {
    runExitAnimation(() => {
      if (onCompleteGoal) {
        onCompleteGoal(goal);
        return;
      }
      onBack();
    });
    }, 600);
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(percentAnim, {
        toValue: percent,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(percentPillScale, {
          toValue: 1.08,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(percentPillScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [percent, percentAnim, percentPillScale]);

  function getTaskCheckScaleAnim(taskId: string) {
    if (!taskCheckScaleAnims[taskId]) {
      taskCheckScaleAnims[taskId] = new Animated.Value(1);
    }
    return taskCheckScaleAnims[taskId];
  }

  function getTaskCheckBurstAnim(taskId: string) {
    if (!taskCheckBurstAnims[taskId]) {
      taskCheckBurstAnims[taskId] = new Animated.Value(0);
    }
    return taskCheckBurstAnims[taskId];
  }

  function runTaskToggleAnimation(taskId: string, nextChecked: boolean) {
    const scaleAnim = getTaskCheckScaleAnim(taskId);
    const burstAnim = getTaskCheckBurstAnim(taskId);

    scaleAnim.stopAnimation();
    burstAnim.stopAnimation();
    scaleAnim.setValue(1);

    if (nextChecked) {
      burstAnim.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.18,
            duration: 130,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 140,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(burstAnim, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(burstAnim, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#070914", minHeight: "100%" }}>
      <LinearGradient
        colors={["#0A0C0F", "#0d1510", "#0a1210"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe}>
      <Animated.View
        style={{
          flex: 1,
          opacity: contentOpacity,
          transform: [{ translateX: contentTranslateX }],
        }}
      >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={handleBackPress}
          disabled={isLeaving}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={[styles.backButtonText, { fontSize: 20, lineHeight: 22 }]}>‹</Text>
            <Text style={styles.backButtonText}>Back to roadmap</Text>
          </View>
        </Pressable>

        <View style={styles.heroCard}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalDesc}>{goal.desc}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{detail.estimatedTime}</Text>
            <Animated.Text style={[styles.metaPill, { transform: [{ scale: percentPillScale }] }]}>{displayPercent}% complete</Animated.Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>Mentor Note</Text>
          <Text style={styles.noteText}>{detail.mentorNote}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mini Tasks</Text>
        {detail.miniTasks.map((task, index) => {
          const checked = checkedTaskIds.has(task.id);
          return (
            <Pressable
              key={task.id}
              style={({ pressed }) => [styles.taskCard, checked && styles.taskCardChecked, pressed && styles.taskCardPressed]}
              onPress={() => toggleTask(task.id)}
            >
              <Animated.View
                style={[
                  styles.taskCheck,
                  checked && styles.taskCheckChecked,
                  { transform: [{ scale: getTaskCheckScaleAnim(task.id) }] },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.taskCheckBurst,
                    {
                      opacity: getTaskCheckBurstAnim(task.id),
                      transform: [
                        {
                          scale: getTaskCheckBurstAnim(task.id).interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 1.9],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                {checked && <Text style={styles.taskCheckMark}>✓</Text>}
              </Animated.View>
              <View style={styles.taskBody}>
                <Text style={styles.taskStep}>Step {index + 1}</Text>
                <Text style={[styles.taskTitle, checked && styles.taskTitleChecked]}>{task.title}</Text>
                <Text style={[styles.taskTip, checked && styles.taskTipChecked]}>{task.tip}</Text>
              </View>
            </Pressable>
          );
        })}

        {showCompleteTaskButton && (
          <Animated.View
            style={[
              styles.completeTaskButtonContainer,
              {
                opacity: completeTaskButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateY: completeTaskButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: completeTaskButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.completeTaskButton, pressed && styles.completeTaskButtonPressed]}
              onPress={handleCompleteTaskPress}
              disabled={isLeaving || !allMiniTasksComplete}
            >
              <LinearGradient
                colors={["#00D4AA", "#00B894", "#009b7a"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.completeTaskButtonGradient}
              >
                <Text style={styles.completeTaskButtonText}>Complete Task</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
      </Animated.View>
    {showConfetti && (
        <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "flex-end", paddingBottom: 80 }}>
          {confettiAnims.current.map((p, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                bottom: 80,
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: p.color,
                opacity: p.op,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate: p.rot.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }) },
                ],
              }}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 20, 18, 0.85)",
    borderWidth: 1,
    borderColor: "#1f3330",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16,
  },
  backButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    color: "#c8ede8",
  },
  heroCard: {
    backgroundColor: "rgba(8, 20, 18, 0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f4a42",
    padding: 18,
    marginBottom: 12,
  },
  goalTitle: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 31,
    lineHeight: 32,
    color: "#f5f2ff",
    marginBottom: 6,
  },
  goalDesc: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    lineHeight: 24,
    color: "#a8c5c0",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    color: "#00D4AA",
    backgroundColor: "rgba(0, 40, 34, 0.7)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00B894",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f5c50",
    backgroundColor: "rgba(8, 32, 28, 0.82)",
    padding: 14,
    marginBottom: 16,
  },
  noteLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    letterSpacing: 0.75,
    textTransform: "uppercase",
    color: "#00D4AA",
    marginBottom: 6,
  },
  noteText: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    lineHeight: 26,
    color: "#9ecfc8",
  },
  sectionTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 19,
    color: "#d8ede9",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1a2a28",
    backgroundColor: "rgba(8, 16, 14, 0.9)",
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  taskCardChecked: {
    borderColor: "#00B894",
    backgroundColor: "rgba(0, 50, 40, 0.9)",
  },
  taskCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  taskCheck: {
    position: "relative",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1f4a42",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "#060f0d",
    overflow: "visible",
  },
  taskCheckBurst: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#00D4AA",
    backgroundColor: "rgba(0, 212, 170, 0.2)",
  },
  taskCheckChecked: {
    borderColor: "#00B894",
    backgroundColor: "#00B894",
  },
  taskCheckMark: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 14,
    color: "#fff",
  },
  taskBody: {
    flex: 1,
  },
  taskStep: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 14,
    color: "#00D4AA",
    marginBottom: 4,
  },
  taskTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#f0f4f2",
    marginBottom: 4,
  },
  taskTitleChecked: {
    color: "#00D4AA",
  },
  taskTip: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    lineHeight: 24,
    color: "#8aada8",
  },
  taskTipChecked: {
    color: "#7ecfc4",
  },
  completeTaskButtonContainer: {
    marginTop: 14,
  },
  completeTaskButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#00D4AA",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  completeTaskButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  completeTaskButtonGradient: {
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  completeTaskButtonText: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 18,
    color: "#f8fdff",
    letterSpacing: 0.7,
  },
});
