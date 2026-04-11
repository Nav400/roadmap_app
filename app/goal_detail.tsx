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
  onMiniTaskProgressChange?: (goal: RoadmapGoalSelection, checkedTaskIds: string[]) => void;
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
    onMiniTaskProgressChange?.(goal, normalizedTaskIds);
  }, [checkedTaskIds, goalKey, goal, onMiniTaskProgressChange]);

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

    runExitAnimation(() => {
      if (onCompleteGoal) {
        onCompleteGoal(goal);
        return;
      }
      onBack();
    });
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
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#070914", "#121234", "#1a1550"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
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
          <Text style={styles.backButtonText}>Back to roadmap</Text>
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
                colors={["#52dcc6", "#3aa8da", "#7167f0"]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#070913",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(52, 45, 120, 0.62)",
    borderWidth: 1,
    borderColor: "#7668df",
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
    color: "#f1edff",
  },
  heroCard: {
    backgroundColor: "rgba(24, 22, 58, 0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#6558cf",
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
    color: "#c0bbdf",
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
    color: "#daf5ff",
    backgroundColor: "rgba(23, 66, 102, 0.7)",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#43a4db",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2f8e92",
    backgroundColor: "rgba(13, 55, 62, 0.76)",
    padding: 14,
    marginBottom: 16,
  },
  noteLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    letterSpacing: 0.75,
    textTransform: "uppercase",
    color: "#72e5e3",
    marginBottom: 6,
  },
  noteText: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    lineHeight: 26,
    color: "#b2dfdd",
  },
  sectionTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 19,
    color: "#ece7ff",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#544db0",
    backgroundColor: "rgba(19, 18, 49, 0.9)",
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  taskCardChecked: {
    borderColor: "#4dd5be",
    backgroundColor: "rgba(12, 73, 72, 0.86)",
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
    borderColor: "#7a6cff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "#0f1030",
    overflow: "visible",
  },
  taskCheckBurst: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#92fff0",
    backgroundColor: "rgba(77, 213, 190, 0.24)",
  },
  taskCheckChecked: {
    borderColor: "#4dd5be",
    backgroundColor: "#38b8a4",
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
    color: "#9fd8ff",
    marginBottom: 4,
  },
  taskTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#f2efff",
    marginBottom: 4,
  },
  taskTitleChecked: {
    color: "#d3fff4",
  },
  taskTip: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    lineHeight: 24,
    color: "#bbb8d8",
  },
  taskTipChecked: {
    color: "#a8e2d7",
  },
  completeTaskButtonContainer: {
    marginTop: 14,
  },
  completeTaskButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4d8bff",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  completeTaskButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  completeTaskButtonGradient: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  completeTaskButtonText: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 18,
    color: "#f8fdff",
    letterSpacing: 0.3,
  },
});
