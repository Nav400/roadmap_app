import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";

const FAKE_MILESTONES = [
  { id: "1", title: "Set up your dev environment", desc: "Install VS Code, Git, and a Python environment. Get comfortable with the terminal.", tag: "foundation", done: false },
  { id: "2", title: "Learn Git basics", desc: "Commit, branch, push, pull. Create a GitHub profile and make it look active.", tag: "foundation", done: false },
  { id: "3", title: "Complete one CS project", desc: "Build anything and put it on GitHub. A calculator, a game, a script.", tag: "projects", done: false },
  { id: "4", title: "Join a CS club or org", desc: "ACM, Google DSC, or your school's hackathon club. Show up once.", tag: "community", done: false },
  { id: "5", title: "Do a LeetCode Easy per week", desc: "Start with arrays and strings. Consistency beats cramming.", tag: "interviews", done: false },
  { id: "6", title: "Attend a campus tech event", desc: "Career fair, info session, or tech talk. Talk to at least one person.", tag: "networking", done: false },
];

const FAKE_PROJECTS = [
  { id: "1", title: "CLI To-Do App", desc: "Build a command-line task manager. Practice file I/O, loops, and functions.", diff: "easy", skills: ["python", "CLI", "file I/O"] },
  { id: "2", title: "Personal Portfolio Site", desc: "Build a static HTML/CSS site. Deploy free on GitHub Pages.", diff: "easy", skills: ["HTML", "CSS", "GitHub Pages"] },
  { id: "3", title: "REST API with Flask", desc: "Build a simple API for a to-do list. Learn HTTP methods and JSON.", diff: "medium", skills: ["python", "Flask", "REST"] },
  { id: "4", title: "Discord Bot", desc: "Automate something useful for your friend group. Great for showing initiative.", diff: "medium", skills: ["python", "APIs", "webhooks"] },
];

const FAKE_EVENTS = [
  { id: "1", month: "APR", day: "12", title: "Spring Career Fair", meta: "University Career Center · Main Gym", why: "Internship recruiting still open at some companies", badge: "career" },
  { id: "2", month: "APR", day: "18", title: "HackUFL Spring 2026", meta: "CS Dept. · 36hr hackathon", why: "Build a project, meet teammates, put it on your resume", badge: "hackathon" },
  { id: "3", month: "---", day: "~", title: "ACM Weekly Meeting", meta: "Thursdays 6pm · CSE Building Rm 101", why: "Workshops, guest speakers, project teams", badge: "club" },
  { id: "4", month: "MAY", day: "2", title: "Google Info Session", meta: "Hosted via Handshake · Virtual", why: "Hear from engineers, ask about internships", badge: "recruiting" },
];

const DIFF_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: "#1d1835", text: "#ddd6ff" },
  medium: { bg: "#2a2545", text: "#c9bcff" },
  hard: { bg: "#35203a", text: "#ffd1ff" },
};

const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  foundation: { bg: "#0d3a66", border: "#4a90e2", text: "#a3d5ff" },
  projects: { bg: "#0d5a5a", border: "#2db8b8", text: "#5fd4d4" },
  community: { bg: "#2d5a2d", border: "#5ec45e", text: "#9fef9f" },
  interviews: { bg: "#6a1a4a", border: "#ff5a9f", text: "#ffb3d9" },
  networking: { bg: "#6a4a1a", border: "#ffaa33", text: "#ffd699" },
};

type Milestone = (typeof FAKE_MILESTONES)[number];
type Event = (typeof FAKE_EVENTS)[number];

const MILESTONE_ORDER = new Map(FAKE_MILESTONES.map((milestone, index) => [milestone.id, index]));

export default function RoadmapScreen({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<"milestones" | "projects" | "events" | "completed">("milestones");
  const [milestones, setMilestones] = useState<Milestone[]>(FAKE_MILESTONES);
  const [completedMilestones, setCompletedMilestones] = useState<Milestone[]>([]);
  const [events, setEvents] = useState<Event[]>(FAKE_EVENTS);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [completingEventIds, setCompletingEventIds] = useState<Set<string>>(new Set());
  const [completingMilestoneIds, setCompletingMilestoneIds] = useState<Set<string>>(new Set());
  const [displayDone, setDisplayDone] = useState(0);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [completionToastVisible, setCompletionToastVisible] = useState(false);
  const [completionToastMessage, setCompletionToastMessage] = useState("");
  const doneCountAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const statsRowAnim = useRef(new Animated.Value(1)).current;
  const tabContentOpacity = useRef(new Animated.Value(1)).current;
  const tabContentTranslateY = useRef(new Animated.Value(0)).current;
  const completionToastAnim = useRef(new Animated.Value(0)).current;
  const completionToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const milestoneFadeAnims = useRef<Record<string, Animated.Value>>({}).current;
  const milestoneScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const checkScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const checkBurstAnims = useRef<Record<string, Animated.Value>>({}).current;
  const eventFadeAnims = useRef<Record<string, Animated.Value>>({}).current;
  const eventScaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  const done = milestones.filter((m) => m.done).length + completedMilestones.length;
  const total = milestones.length + completedMilestones.length;
  const pct = Math.round((done / total) * 100);
  const displayToGo = total - displayDone;
  const displayPct = Math.round((displayDone / total) * 100);

  function getCheckScaleAnim(id: string) {
    if (!checkScaleAnims[id]) {
      checkScaleAnims[id] = new Animated.Value(1);
    }
    return checkScaleAnims[id];
  }

  function getCheckBurstAnim(id: string) {
    if (!checkBurstAnims[id]) {
      checkBurstAnims[id] = new Animated.Value(0);
    }
    return checkBurstAnims[id];
  }

  function getMilestoneFadeAnim(id: string) {
    if (!milestoneFadeAnims[id]) {
      milestoneFadeAnims[id] = new Animated.Value(1);
    }
    return milestoneFadeAnims[id];
  }

  function getMilestoneScaleAnim(id: string) {
    if (!milestoneScaleAnims[id]) {
      milestoneScaleAnims[id] = new Animated.Value(1);
    }
    return milestoneScaleAnims[id];
  }

  function runCheckCelebration(id: string) {
    const scaleAnim = getCheckScaleAnim(id);
    const burstAnim = getCheckBurstAnim(id);

    scaleAnim.setValue(1);
    burstAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.18,
          friction: 4,
          tension: 170,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 130,
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
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }

  useEffect(() => {
    const listenerId = doneCountAnim.addListener(({ value }) => {
      setDisplayDone(Math.round(value));
    });

    return () => {
      doneCountAnim.removeListener(listenerId);
    };
  }, [doneCountAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(doneCountAnim, {
        toValue: done,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: pct,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(statsRowAnim, {
          toValue: 0.98,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(statsRowAnim, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [done, doneCountAnim, pct, progressAnim, statsRowAnim]);

  useEffect(() => {
    return () => {
      if (completionToastTimer.current) {
        clearTimeout(completionToastTimer.current);
      }
    };
  }, []);

  function showCompletionToast(message: string) {
    if (completionToastTimer.current) {
      clearTimeout(completionToastTimer.current);
    }

    setCompletionToastMessage(message);
    setCompletionToastVisible(true);
    completionToastAnim.setValue(0);

    Animated.timing(completionToastAnim, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    completionToastTimer.current = setTimeout(() => {
      Animated.timing(completionToastAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setCompletionToastVisible(false);
      });
    }, 3000);
  }

  function completeMilestone(milestone: Milestone) {
    if (milestone.done || completingMilestoneIds.has(milestone.id)) {
      return;
    }

    setCompletingMilestoneIds((prev) => new Set(prev).add(milestone.id));
    setMilestones((prev) => prev.map((item) => (item.id === milestone.id ? { ...item, done: true } : item)));
    runCheckCelebration(milestone.id);

    const fadeAnim = getMilestoneFadeAnim(milestone.id);
    const scaleAnim = getMilestoneScaleAnim(milestone.id);

    fadeAnim.setValue(1);
    scaleAnim.setValue(1);

    Animated.sequence([
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setMilestones((prev) => prev.filter((item) => item.id !== milestone.id));
      setCompletedMilestones((prev) => {
        const next = [{ ...milestone, done: true }, ...prev.filter((item) => item.id !== milestone.id)];
        return next.sort((left, right) => (MILESTONE_ORDER.get(left.id) ?? 0) - (MILESTONE_ORDER.get(right.id) ?? 0));
      });
      setCompletingMilestoneIds((prev) => {
        const next = new Set(prev);
        next.delete(milestone.id);
        return next;
      });
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      showCompletionToast("Added to Completed Tasks");
    });
  }

  function restoreMilestone(milestone: Milestone) {
    setCompletedMilestones((prev) => prev.filter((item) => item.id !== milestone.id));
    setMilestones((prev) => {
      const restored = { ...milestone, done: false };
      const next = [...prev.filter((item) => item.id !== milestone.id), restored];
      return next.sort((left, right) => (MILESTONE_ORDER.get(left.id) ?? 0) - (MILESTONE_ORDER.get(right.id) ?? 0));
    });
    getMilestoneFadeAnim(milestone.id).setValue(1);
    getMilestoneScaleAnim(milestone.id).setValue(1);
  }

  function animateTabChange(nextTab: "milestones" | "projects" | "events" | "completed") {
    if (nextTab === activeTab || isTabTransitioning) {
      return;
    }

    setIsTabTransitioning(true);
    Animated.parallel([
      Animated.timing(tabContentOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(tabContentTranslateY, {
        toValue: -8,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(nextTab);
      tabContentTranslateY.setValue(10);

      Animated.parallel([
        Animated.timing(tabContentOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tabContentTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setIsTabTransitioning(false));
    });
  }

  function getTagColors(tagName: string) {
    return TAG_COLORS[tagName] || TAG_COLORS.foundation;
  }

  function getEventFadeAnim(id: string) {
    if (!eventFadeAnims[id]) {
      eventFadeAnims[id] = new Animated.Value(1);
    }
    return eventFadeAnims[id];
  }

  function getEventScaleAnim(id: string) {
    if (!eventScaleAnims[id]) {
      eventScaleAnims[id] = new Animated.Value(1);
    }
    return eventScaleAnims[id];
  }

  function completeEvent(event: typeof FAKE_EVENTS[0]) {
    setCompletingEventIds((prev) => new Set([...prev, event.id]));
    setCompletedEvents((prev) => [...prev, event]);
    
    const fadeAnim = getEventFadeAnim(event.id);
    const scaleAnim = getEventScaleAnim(event.id);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        setCompletingEventIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });
        showCompletionToast("Added to Completed Tasks");
      });
    }, 1000);
  }

  function uncompleteEvent(event: typeof FAKE_EVENTS[0]) {
    setCompletedEvents((prev) => prev.filter((e) => e.id !== event.id));
    setEvents((prev) => [...prev, event]);
    getEventFadeAnim(event.id).setValue(1);
    getEventScaleAnim(event.id).setValue(1);
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{profile.major} Roadmap</Text>
        <Text style={styles.subtitle}>{profile.year} · {profile.goals[0] ?? "General track"}</Text>

        <Animated.View
          style={[
            styles.statsRow,
            {
              transform: [{ scale: statsRowAnim }],
              opacity: statsRowAnim.interpolate({
                inputRange: [0.98, 1],
                outputRange: [0.9, 1],
              }),
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{displayDone}</Text>
            <Text style={styles.statLabel}>done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{displayToGo}</Text>
            <Text style={styles.statLabel}>to go</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{displayPct}%</Text>
            <Text style={styles.statLabel}>progress</Text>
          </View>
        </Animated.View>

        <Text style={styles.sectionLabel}>progress</Text>
        <View style={styles.progressTrack} onLayout={(event) => setProgressTrackWidth(event.nativeEvent.layout.width)}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, progressTrackWidth || 1],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.tabs}>
          {(["milestones", "projects", "events", "completed"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={({ pressed }) => [styles.tab, activeTab === tab && styles.tabActive, pressed && styles.tabPressed]}
              onPress={() => animateTabChange(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <Animated.View
          style={{
            opacity: tabContentOpacity,
            transform: [{ translateY: tabContentTranslateY }],
          }}
        >
          {activeTab === "milestones" && (
            <View>
              {milestones.map((m) => {
                const isMilestoneCompleting = completingMilestoneIds.has(m.id);
                return (
                  <Animated.View
                    key={m.id}
                    style={{
                      opacity: getMilestoneFadeAnim(m.id),
                      transform: [{ scale: getMilestoneScaleAnim(m.id) }],
                    }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.milestoneRow,
                        (m.done || isMilestoneCompleting) && styles.milestoneRowCompleting,
                        pressed && styles.milestoneRowPressed,
                      ]}
                      onPress={() => completeMilestone(m)}
                      disabled={m.done || isMilestoneCompleting}
                    >
                      <Animated.View
                        style={[
                          styles.check,
                          (m.done || isMilestoneCompleting) && styles.checkDone,
                          {
                            transform: [{ scale: getCheckScaleAnim(m.id) }],
                          },
                        ]}
                      >
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.checkBurst,
                            {
                              opacity: getCheckBurstAnim(m.id),
                              transform: [
                                {
                                  scale: getCheckBurstAnim(m.id).interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.7, 1.75],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                        {(m.done || isMilestoneCompleting) && <Text style={styles.checkMark}>✓</Text>}
                      </Animated.View>
                      <View style={styles.milestoneBody}>
                        <Text
                          style={[
                            styles.milestoneTitle,
                            (m.done || isMilestoneCompleting) && styles.milestoneTitleDone,
                          ]}
                        >
                          {m.title}
                        </Text>
                        <Text style={[styles.milestoneDesc, (m.done || isMilestoneCompleting) && styles.milestoneDescDone]}>
                          {m.desc}
                        </Text>
                        <View
                          style={[
                            styles.tag,
                            {
                              backgroundColor: m.done || isMilestoneCompleting ? "#222833" : getTagColors(m.tag).bg,
                              borderColor: m.done || isMilestoneCompleting ? "#394150" : getTagColors(m.tag).border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              {
                                color: m.done || isMilestoneCompleting ? "#8a93a4" : getTagColors(m.tag).text,
                              },
                            ]}
                          >
                            {m.tag}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}

        {activeTab === "projects" && (
          <View>
            {FAKE_PROJECTS.map((p) => (
              <View key={p.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{p.title}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: DIFF_COLORS[p.diff].bg }]}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[p.diff].text }]}>{p.diff}</Text>
                  </View>
                </View>
                <Text style={styles.projectDesc}>{p.desc}</Text>
                <View style={styles.skillTags}>
                  {p.skills.map((s) => (
                    <View key={s} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "events" && (
          <View>
            {events.map((e) => {
              const isCompleting = completingEventIds.has(e.id);
              return (
                <Animated.View
                  key={e.id}
                  style={[
                    styles.eventRow,
                    isCompleting && styles.eventRowCompleting,
                    {
                      opacity: getEventFadeAnim(e.id),
                      transform: [{ scale: getEventScaleAnim(e.id) }],
                    },
                  ]}
                >
                  <View style={[styles.eventDate, isCompleting && styles.eventDateGray]}>
                    <Text style={[styles.eventMonth, isCompleting && styles.eventMonthGray]}>{e.month}</Text>
                    <Text style={[styles.eventDay, isCompleting && styles.eventDayGray]}>{e.day}</Text>
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={[styles.eventTitle, isCompleting && styles.eventTitleGray]}>{e.title}</Text>
                    <Text style={[styles.eventMeta, isCompleting && styles.eventMetaGray]}>{e.meta}</Text>
                    <Text style={[styles.eventWhy, isCompleting && styles.eventWhyGray]}>{e.why}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.eventCheckBtn, pressed && styles.eventCheckBtnPressed]}
                    onPress={() => completeEvent(e)}
                    disabled={isCompleting}
                  >
                    <View style={[styles.eventCheckbox, isCompleting && styles.eventCheckboxCompleted]} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}

          {activeTab === "completed" && (
            <View>
              {completedMilestones.length === 0 && completedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No completed items yet</Text>
                </View>
              ) : (
                <View>
                  {completedMilestones.length > 0 && (
                    <>
                      <Text style={styles.completedSectionLabel}>Completed milestones</Text>
                      {completedMilestones.map((m) => (
                        <Pressable
                          key={m.id}
                          style={({ pressed }) => [styles.completedMilestoneRow, pressed && styles.eventRowPressed]}
                          onPress={() => restoreMilestone(m)}
                        >
                          <View style={styles.checkDone}>
                            <Text style={styles.checkMark}>✓</Text>
                          </View>
                          <View style={styles.milestoneBody}>
                            <Text style={[styles.milestoneTitle, styles.completedEventTitle]}>{m.title}</Text>
                            <Text style={styles.milestoneDescDone}>{m.desc}</Text>
                            <View
                              style={[
                                styles.tag,
                                {
                                  backgroundColor: "#222833",
                                  borderColor: "#394150",
                                },
                              ]}
                            >
                              <Text style={[styles.tagText, { color: "#8a93a4" }]}>{m.tag}</Text>
                            </View>
                          </View>
                          <View style={[styles.eventBadge, styles.completedBadge]}>
                            <Text style={styles.completedBadgeText}>✓</Text>
                          </View>
                        </Pressable>
                      ))}
                    </>
                  )}

                  {completedEvents.length > 0 && (
                    <>
                      <Text style={styles.completedSectionLabel}>Completed events</Text>
                      {completedEvents.map((e) => (
                        <Pressable
                          key={e.id}
                          style={({ pressed }) => [styles.completedEventRow, pressed && styles.eventRowPressed]}
                          onPress={() => uncompleteEvent(e)}
                        >
                          <View style={styles.eventDate}>
                            <Text style={styles.eventMonth}>{e.month}</Text>
                            <Text style={styles.eventDay}>{e.day}</Text>
                          </View>
                          <View style={styles.eventBody}>
                            <Text style={[styles.eventTitle, styles.completedEventTitle]}>{e.title}</Text>
                            <Text style={styles.eventMeta}>{e.meta}</Text>
                            <Text style={styles.eventWhy}>{e.why}</Text>
                          </View>
                          <View style={[styles.eventBadge, styles.completedBadge]}>
                            <Text style={styles.completedBadgeText}>✓</Text>
                          </View>
                        </Pressable>
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </Animated.View>

      </ScrollView>
      {completionToastVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.completionToast,
            {
              opacity: completionToastAnim,
              transform: [
                {
                  translateY: completionToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.completionToastText}>{completionToastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  progressLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 19,
    color: "#aab3c3",
    marginBottom: 20,
    letterSpacing: 0.4,
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 15,
    color: "#b7adff",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 12,
    alignItems: "center",
  },
  statVal: {
    fontFamily: "ClashGrotesk-SemiBold",
    fontSize: 25,
    color: "#f5f7fb",
  },
  statLabel: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#aab3c3",
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 14,
    backgroundColor: "#2b2f38",
    borderRadius: 100,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c5cff",
    borderRadius: 100,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
  },
  tabActive: {
    backgroundColor: "#1d1835",
    borderColor: "#7c5cff",
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tabText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 15,
    color: "#b0b9c8",
    textTransform: "capitalize",
  },
  tabTextActive: {
    color: "#ddd6ff",
  },
  milestoneRow: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    marginBottom: 10,
  },
  milestoneRowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  milestoneRowCompleting: {
    backgroundColor: "#10151d",
    borderColor: "#2d3440",
  },
  check: {
    position: "relative",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#3a404d",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
    overflow: "visible",
  },
  checkBurst: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#a995ff",
    backgroundColor: "rgba(124, 92, 255, 0.2)",
  },
  checkDone: {
    backgroundColor: "#7c5cff",
    borderColor: "#7c5cff",
  },
  checkMark: {
    fontSize: 12,
    color: "#f5f7fb",
    fontFamily: "ClashGrotesk-Semibold",
  },
  milestoneBody: { flex: 1 },
  milestoneTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 18,
    color: "#f5f7fb",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  milestoneTitleDone: {
    color: "#7f8797",
    textDecorationLine: "line-through",
  },
  milestoneDescDone: {
    color: "#667080",
  },
  milestoneDesc: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#aab3c3",
    lineHeight: 20,
    marginBottom: 8,
  },
  tag: {
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  tagText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 12,
  },
  projectCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 14,
    marginBottom: 10,
  },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  projectTitle: { fontFamily: "ClashGrotesk-Semibold", fontSize: 17, color: "#f5f7fb", flex: 1, marginRight: 8 },
  diffBadge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  diffText: { fontFamily: "ClashGrotesk-Medium", fontSize: 11 },
  projectDesc: { fontFamily: "ClashGrotesk-Regular", fontSize: 14, color: "#aab3c3", lineHeight: 20, marginBottom: 10 },
  skillTags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skillTag: { backgroundColor: "#181c24", borderRadius: 100, borderWidth: 1, borderColor: "#3a404d", paddingHorizontal: 9, paddingVertical: 4 },
  skillTagText: { fontFamily: "ClashGrotesk-Regular", fontSize: 12, color: "#b0b9c8" },
  eventRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  eventDate: { width: 44, alignItems: "center" },
  eventMonth: { fontFamily: "ClashGrotesk-Semibold", fontSize: 11, color: "#b7adff", textTransform: "uppercase", letterSpacing: 0.7 },
  eventDay: { fontFamily: "ClashGrotesk-Bold", fontSize: 22, color: "#f5f7fb", lineHeight: 26 },
  eventBody: { flex: 1 },
  eventTitle: { fontFamily: "ClashGrotesk-Semibold", fontSize: 15, color: "#f5f7fb", marginBottom: 3 },
  eventMeta: { fontFamily: "ClashGrotesk-Regular", fontSize: 13, color: "#aab3c3", marginBottom: 4 },
  eventWhy: { fontFamily: "ClashGrotesk-Regular", fontSize: 12, color: "#8f98ab" },
  eventBadge: { borderRadius: 100, borderWidth: 1, borderColor: "#7c5cff", backgroundColor: "#1d1835", paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  eventBadgeText: { fontFamily: "ClashGrotesk-Medium", fontSize: 11, color: "#ddd6ff" },
  completedSectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 14,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  completedMilestoneRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a3a2a",
    backgroundColor: "#0f1810",
    marginBottom: 10,
    alignItems: "flex-start",
    opacity: 0.7,
  },
  eventCheckBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#3a404d",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  eventCheckBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  eventCheckbox: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  eventRowCompleting: {
    backgroundColor: "#0a0f14",
    borderColor: "#1a2028",
  },
  eventDateGray: {
    opacity: 0.55,
  },
  eventMonthGray: {
    color: "#6f7682",
  },
  eventDayGray: {
    color: "#5a6370",
  },
  eventTitleGray: {
    color: "#6f7682",
  },
  eventMetaGray: {
    color: "#5a6370",
  },
  eventWhyGray: {
    color: "#4a525f",
  },
  eventCheckboxCompleted: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  completedEventRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a3a2a",
    backgroundColor: "#0f1810",
    marginBottom: 10,
    alignItems: "flex-start",
    opacity: 0.7,
  },
  eventRowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  completedEventTitle: {
    color: "#7f8797",
    textDecorationLine: "line-through",
  },
  completedBadge: {
    backgroundColor: "#1a4a1a",
    borderColor: "#5ec45e",
  },
  completedBadgeText: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 14,
    color: "#5ec45e",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 16,
    color: "#7f8797",
  },
  completionToast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: "rgba(20, 24, 36, 0.96)",
    borderWidth: 1,
    borderColor: "#394150",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  completionToastText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 14,
    color: "#f5f7fb",
    textAlign: "center",
  },
});
