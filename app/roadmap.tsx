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
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { GradientBackground } from "@/components/gradient-background";
import type { GoalSourceTab, RoadmapGoalSelection } from "@/constants/goal-details";
import { getPriorityMilestone } from "@/constants/priority-milestone";

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

const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  foundation: { bg: "#0d3a66", border: "#4a90e2", text: "#a3d5ff" },
  projects: { bg: "#0d5a5a", border: "#2db8b8", text: "#5fd4d4" },
  community: { bg: "#2d5a2d", border: "#5ec45e", text: "#9fef9f" },
  interviews: { bg: "#6a1a4a", border: "#ff5a9f", text: "#ffb3d9" },
  networking: { bg: "#6a4a1a", border: "#ffaa33", text: "#ffd699" },
};

const SKILL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  python: { bg: "#0f3e66", border: "#4a90e2", text: "#a9d8ff" },
  flask: { bg: "#3b2a59", border: "#a67eff", text: "#dbc9ff" },
  cli: { bg: "#3f3f16", border: "#d4c24f", text: "#f4e78a" },
  "file i/o": { bg: "#1f3f3f", border: "#56c8c8", text: "#aef0f0" },
  html: { bg: "#5c2f1a", border: "#f29b6b", text: "#ffd9c3" },
  css: { bg: "#15365f", border: "#5f9be0", text: "#bbd8ff" },
  "github pages": { bg: "#3a3a3a", border: "#9a9a9a", text: "#e4e4e4" },
  rest: { bg: "#22542e", border: "#5fce78", text: "#b9efc6" },
  apis: { bg: "#2f2854", border: "#8a75dd", text: "#d8ceff" },
  webhooks: { bg: "#523124", border: "#d18f6f", text: "#f6d3c4" },
};

type Milestone = (typeof FAKE_MILESTONES)[number];
type Project = (typeof FAKE_PROJECTS)[number];
type Event = (typeof FAKE_EVENTS)[number];

const MILESTONE_ORDER = new Map(FAKE_MILESTONES.map((milestone, index) => [milestone.id, index]));
const PROJECT_ORDER = new Map(FAKE_PROJECTS.map((project, index) => [project.id, index]));
const LIST_ITEM_LAYOUT = LinearTransition.springify().damping(35).stiffness(150);

export default function RoadmapScreen({
  profile,
  onOpenGoal,
  autoCompleteGoalRequest,
  onAutoCompleteHandled,
}: {
  profile: any;
  onOpenGoal?: (goal: RoadmapGoalSelection) => void;
  autoCompleteGoalRequest?: { goal: RoadmapGoalSelection; requestId: number } | null;
  onAutoCompleteHandled?: (requestId: number) => void;
}) {
  const entryOpacityAnim = useRef(new Animated.Value(0)).current;
  const entryTranslateYAnim = useRef(new Animated.Value(14)).current;
  const [activeTab, setActiveTab] = useState<"milestones" | "projects" | "events" | "completed">("milestones");
  const priorityMilestone = getPriorityMilestone(profile ?? {});
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const [first, ...rest] = FAKE_MILESTONES;
    if (!first) {
      return [];
    }

    return [
      {
        ...first,
        title: priorityMilestone.title,
        desc: priorityMilestone.reason,
      },
      ...rest,
    ];
  });
  const [completedMilestones, setCompletedMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>(FAKE_PROJECTS);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>(FAKE_EVENTS);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [completingProjectIds, setCompletingProjectIds] = useState<Set<string>>(new Set());
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
  const checkScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const checkBurstAnims = useRef<Record<string, Animated.Value>>({}).current;
  const projectFadeAnims = useRef<Record<string, Animated.Value>>({}).current;
  const projectScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const eventFadeAnims = useRef<Record<string, Animated.Value>>({}).current;
  const eventScaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const removedMilestoneGreenAnims = useRef<Record<string, Animated.Value>>({}).current;
  const removedProjectGreenAnims = useRef<Record<string, Animated.Value>>({}).current;
  const removedEventGreenAnims = useRef<Record<string, Animated.Value>>({}).current;

  const done =
    milestones.filter((m) => m.done).length +
    completedMilestones.length +
    completedProjects.length +
    completedEvents.length;
  const total = FAKE_MILESTONES.length + FAKE_PROJECTS.length + FAKE_EVENTS.length;
  const pct = Math.round((done / total) * 100);
  const displayToGo = total - displayDone;
  const displayPct = Math.round((displayDone / total) * 100);
  const goalsSummary = Array.isArray(profile.goals) && profile.goals.length > 0
    ? profile.goals.join(" • ")
    : "General track";
  const topPriorityMilestoneId = milestones.find((item) => !item.done && !completingMilestoneIds.has(item.id))?.id;
  const topPriorityProjectId = projects.find((item) => !completingProjectIds.has(item.id))?.id;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacityAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateYAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacityAnim, entryTranslateYAnim]);

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

  function getRemovedMilestoneGreenAnim(id: string) {
    if (!removedMilestoneGreenAnims[id]) {
      removedMilestoneGreenAnims[id] = new Animated.Value(0);
    }
    return removedMilestoneGreenAnims[id];
  }

  function getRemovedProjectGreenAnim(id: string) {
    if (!removedProjectGreenAnims[id]) {
      removedProjectGreenAnims[id] = new Animated.Value(0);
    }
    return removedProjectGreenAnims[id];
  }

  function getRemovedEventGreenAnim(id: string) {
    if (!removedEventGreenAnims[id]) {
      removedEventGreenAnims[id] = new Animated.Value(0);
    }
    return removedEventGreenAnims[id];
  }

  function animateRemovalGreen<T extends { id: string }>(item: T, getGreenAnim: (id: string) => Animated.Value) {
    const greenAnim = getGreenAnim(item.id);
    greenAnim.setValue(0);
    Animated.timing(greenAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
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
    completionToastAnim.stopAnimation(() => {
      Animated.timing(completionToastAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    completionToastTimer.current = setTimeout(() => {
      Animated.timing(completionToastAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setCompletionToastVisible(false);
      });
    }, 2600);
  }

  function openMilestoneDetail(milestone: Milestone, sourceTab: GoalSourceTab) {
    if (!onOpenGoal) {
      return;
    }

    onOpenGoal({
      type: "milestone",
      sourceTab,
      id: milestone.id,
      title: milestone.title,
      desc: milestone.desc,
      tag: milestone.tag,
    });
  }

  function openProjectDetail(project: Project, sourceTab: GoalSourceTab) {
    if (!onOpenGoal) {
      return;
    }

    onOpenGoal({
      type: "project",
      sourceTab,
      id: project.id,
      title: project.title,
      desc: project.desc,
      skills: project.skills,
      difficulty: project.diff,
    });
  }

  function completeMilestone(milestone: Milestone) {
    if (milestone.done || completingMilestoneIds.has(milestone.id)) {
      return;
    }

    setCompletingMilestoneIds((prev) => new Set(prev).add(milestone.id));
    setMilestones((prev) => prev.map((item) => (item.id === milestone.id ? { ...item, done: true } : item)));
    getRemovedMilestoneGreenAnim(milestone.id).setValue(0);
    runCheckCelebration(milestone.id);

    setTimeout(() => {
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
      showCompletionToast("Added to Completed Tasks");
    }, 1000);
  }

  function restoreMilestone(milestone: Milestone) {
    if (completingMilestoneIds.has(milestone.id)) {
      return;
    }

    setCompletingMilestoneIds((prev) => new Set(prev).add(milestone.id));
    animateRemovalGreen(milestone, getRemovedMilestoneGreenAnim);

    setTimeout(() => {
      setCompletedMilestones((prev) => prev.filter((item) => item.id !== milestone.id));
      setMilestones((prev) => {
        const restored = { ...milestone, done: false };
        const next = [...prev.filter((item) => item.id !== milestone.id), restored];
        return next.sort((left, right) => (MILESTONE_ORDER.get(left.id) ?? 0) - (MILESTONE_ORDER.get(right.id) ?? 0));
      });
      setCompletingMilestoneIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(milestone.id);
        return newSet;
      });
      showCompletionToast("Removed from Completed Tasks");
    }, 400);
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

  function getProjectFadeAnim(id: string) {
    if (!projectFadeAnims[id]) {
      projectFadeAnims[id] = new Animated.Value(1);
    }
    return projectFadeAnims[id];
  }

  function getProjectScaleAnim(id: string) {
    if (!projectScaleAnims[id]) {
      projectScaleAnims[id] = new Animated.Value(1);
    }
    return projectScaleAnims[id];
  }

  function completeProject(project: Project) {
    if (completingProjectIds.has(project.id)) {
      return;
    }

    const projectCheckAnimId = `project-${project.id}`;

    setCompletingProjectIds((prev) => new Set([...prev, project.id]));
    setCompletedProjects((prev) => [...prev, project]);
    getRemovedProjectGreenAnim(project.id).setValue(0);
    runCheckCelebration(projectCheckAnimId);

    const fadeAnim = getProjectFadeAnim(project.id);
    const scaleAnim = getProjectScaleAnim(project.id);

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
        setProjects((prev) => prev.filter((item) => item.id !== project.id));
        setCompletingProjectIds((prev) => {
          const next = new Set(prev);
          next.delete(project.id);
          return next;
        });
        showCompletionToast("Added to Completed Tasks");
      });
    }, 1000);
  }

  function uncompleteProject(project: Project) {
    if (completingProjectIds.has(project.id)) {
      return;
    }

    setCompletingProjectIds((prev) => new Set([...prev, project.id]));
    animateRemovalGreen(project, getRemovedProjectGreenAnim);

    setTimeout(() => {
      setCompletedProjects((prev) => prev.filter((item) => item.id !== project.id));
      setProjects((prev) => {
        const next = [...prev, project];
        return next.sort((left, right) => (PROJECT_ORDER.get(left.id) ?? 0) - (PROJECT_ORDER.get(right.id) ?? 0));
      });
      setCompletingProjectIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
      getProjectFadeAnim(project.id).setValue(1);
      getProjectScaleAnim(project.id).setValue(1);
      showCompletionToast("Removed from Completed Tasks");
    }, 420);
  }

  function getSkillColors(skillName: string) {
    return SKILL_COLORS[skillName.toLowerCase()] || { bg: "#181c24", border: "#3a404d", text: "#b0b9c8" };
  }

  function completeEvent(event: typeof FAKE_EVENTS[0]) {
    const eventCheckAnimId = `event-${event.id}`;

    setCompletingEventIds((prev) => new Set([...prev, event.id]));
    setCompletedEvents((prev) => [...prev, event]);
    getRemovedEventGreenAnim(event.id).setValue(0);
    runCheckCelebration(eventCheckAnimId);
    
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
    if (completingEventIds.has(event.id)) {
      return;
    }

    setCompletingEventIds((prev) => new Set([...prev, event.id]));
    animateRemovalGreen(event, getRemovedEventGreenAnim);

    setTimeout(() => {
      setCompletedEvents((prev) => prev.filter((e) => e.id !== event.id));
      setEvents((prev) => [...prev, event]);
      setCompletingEventIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
      getEventFadeAnim(event.id).setValue(1);
      getEventScaleAnim(event.id).setValue(1);
      showCompletionToast("Removed from Completed Tasks");
    }, 420);
  }

  useEffect(() => {
    if (!autoCompleteGoalRequest) {
      return;
    }

    const { goal, requestId } = autoCompleteGoalRequest;

    if (goal.type === "milestone") {
      const milestone = milestones.find((item) => item.id === goal.id);
      if (milestone && !completingMilestoneIds.has(milestone.id)) {
        animateTabChange(goal.sourceTab === "completed" ? "milestones" : goal.sourceTab ?? "milestones");
        completeMilestone(milestone);
      }
      onAutoCompleteHandled?.(requestId);
      return;
    }

    if (goal.type === "project") {
      const project = projects.find((item) => item.id === goal.id);
      if (project && !completingProjectIds.has(project.id)) {
        animateTabChange(goal.sourceTab === "completed" ? "projects" : goal.sourceTab ?? "projects");
        completeProject(project);
      }
      onAutoCompleteHandled?.(requestId);
    }
  }, [
    autoCompleteGoalRequest,
    completeMilestone,
    completeProject,
    completingMilestoneIds,
    completingProjectIds,
    milestones,
    onAutoCompleteHandled,
    projects,
  ]);

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GradientBackground variant="soft" />
      <Animated.View
        style={{
          flex: 1,
          opacity: entryOpacityAnim,
          transform: [{ translateY: entryTranslateYAnim }],
        }}
      >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{profile.major} Roadmap</Text>
        <Text style={styles.subtitle}>{profile.year} · {goalsSummary}</Text>

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
          >
            <LinearGradient
              colors={["#7c5cff", "#9274ff", "#b9a7ff"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
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
                const isTopPriorityMilestone = m.id === topPriorityMilestoneId;
                const showTopPriorityStyle = isTopPriorityMilestone && !(m.done || isMilestoneCompleting);
                return (
                  <Reanimated.View key={m.id} layout={LIST_ITEM_LAYOUT}>
                    <View
                      style={[
                        styles.milestoneRow,
                        showTopPriorityStyle && styles.milestoneRowTopPriority,
                        (m.done || isMilestoneCompleting) && styles.milestoneRowCompleting,
                      ]}
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
                      <Pressable
                        style={({ pressed }) => [styles.goalDetailBody, pressed && styles.goalDetailBodyPressed]}
                        onPress={() => openMilestoneDetail(m, "milestones")}
                      >
                        <View style={styles.milestoneHeader}>
                          <Text
                            style={[
                              styles.milestoneTitle,
                              (m.done || isMilestoneCompleting) && styles.milestoneTitleDone,
                            ]}
                          >
                            {m.title}
                          </Text>
                          {isTopPriorityMilestone && !(m.done || isMilestoneCompleting) && (
                            <View style={[styles.priorityPill, styles.topMilestonePriorityPill]}>
                              <Text style={[styles.priorityPillText, styles.topMilestonePriorityPillText]}>Top Priority</Text>
                            </View>
                          )}
                        </View>
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
                      </Pressable>
                    </View>
                  </Reanimated.View>
                );
              })}
            </View>
          )}

        {activeTab === "projects" && (
          <View>
            {projects.map((p) => {
              const isCompleting = completingProjectIds.has(p.id);
              const projectCheckAnimId = `project-${p.id}`;
              const isTopPriorityProject = p.id === topPriorityProjectId;
              const showTopPriorityProjectStyle = isTopPriorityProject && !isCompleting;
              return (
              <Reanimated.View key={p.id} layout={LIST_ITEM_LAYOUT}>
              <Animated.View
                style={{
                  opacity: getProjectFadeAnim(p.id),
                  transform: [{ scale: getProjectScaleAnim(p.id) }],
                }}
              >
              <View
                style={[
                  styles.projectCard,
                  showTopPriorityProjectStyle && styles.projectCardTopPriority,
                  isCompleting && styles.projectCardCompleting,
                ]}
              >
                <Animated.View
                  style={[
                    styles.check,
                    isCompleting && styles.checkDone,
                    {
                      transform: [{ scale: getCheckScaleAnim(projectCheckAnimId) }],
                    },
                  ]}
                >
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.checkBurst,
                      {
                        opacity: getCheckBurstAnim(projectCheckAnimId),
                        transform: [
                          {
                            scale: getCheckBurstAnim(projectCheckAnimId).interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.7, 1.75],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                  {isCompleting && <Text style={styles.checkMark}>✓</Text>}
                </Animated.View>
                <Pressable
                  style={({ pressed }) => [styles.goalDetailBody, pressed && styles.goalDetailBodyPressed]}
                  onPress={() => openProjectDetail(p, "projects")}
                >
                <View style={styles.projectHeader}>
                  <Text style={[styles.projectTitle, isCompleting && styles.projectTitleGray]} numberOfLines={2}>{p.title}</Text>
                  {isTopPriorityProject && !isCompleting && (
                    <View style={[styles.priorityPill, styles.topProjectPriorityPill]}>
                      <Text style={[styles.priorityPillText, styles.topProjectPriorityPillText]}>Top Priority</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.projectDesc, isCompleting && styles.projectDescGray]}>{p.desc}</Text>
                <View style={styles.skillTags}>
                  {p.skills.map((s) => {
                    const colors = getSkillColors(s);
                    return (
                    <View
                      key={s}
                      style={[
                        styles.skillTag,
                        {
                          backgroundColor: isCompleting ? "#222833" : colors.bg,
                          borderColor: isCompleting ? "#394150" : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.skillTagText, { color: isCompleting ? "#8a93a4" : colors.text }]}>{s}</Text>
                    </View>
                    );
                  })}
                </View>
              </Pressable>
              </View>
              </Animated.View>
              </Reanimated.View>
            );
            })}
          </View>
        )}

        {activeTab === "events" && (
          <View>
            {events.map((e) => {
              const isCompleting = completingEventIds.has(e.id);
              const eventCheckAnimId = `event-${e.id}`;
              return (
                <Reanimated.View key={e.id} layout={LIST_ITEM_LAYOUT}>
                <Animated.View
                  style={[
                    styles.eventRow,
                    isCompleting && styles.eventRowCompleting,
                    {
                      opacity: getEventFadeAnim(e.id),
                      transform: [{ scale: getEventScaleAnim(e.id) }],
                    },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [styles.checkButton, pressed && styles.checkButtonPressed]}
                    onPress={() => completeEvent(e)}
                    disabled={isCompleting}
                  >
                    <Animated.View
                      style={[
                        styles.check,
                        isCompleting && styles.checkDone,
                        {
                          transform: [{ scale: getCheckScaleAnim(eventCheckAnimId) }],
                        },
                      ]}
                    >
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.checkBurst,
                          {
                            opacity: getCheckBurstAnim(eventCheckAnimId),
                            transform: [
                              {
                                scale: getCheckBurstAnim(eventCheckAnimId).interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.7, 1.75],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      {isCompleting && <Text style={styles.checkMark}>✓</Text>}
                    </Animated.View>
                  </Pressable>
                  <View style={[styles.eventDate, isCompleting && styles.eventDateGray]}>
                    <Text style={[styles.eventMonth, isCompleting && styles.eventMonthGray]}>{e.month}</Text>
                    <Text style={[styles.eventDay, isCompleting && styles.eventDayGray]}>{e.day}</Text>
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={[styles.eventTitle, isCompleting && styles.eventTitleGray]}>{e.title}</Text>
                    <Text style={[styles.eventMeta, isCompleting && styles.eventMetaGray]}>{e.meta}</Text>
                    <Text style={[styles.eventWhy, isCompleting && styles.eventWhyGray]}>{e.why}</Text>
                  </View>
                </Animated.View>
                </Reanimated.View>
              );
            })}
          </View>
        )}

          {activeTab === "completed" && (
            <View>
              {completedMilestones.length === 0 && completedProjects.length === 0 && completedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No completed items yet</Text>
                </View>
              ) : (
                <View>
                  {completedMilestones.length > 0 && (
                    <Reanimated.View layout={LIST_ITEM_LAYOUT}>
                      <Text style={styles.completedSectionLabel}>Completed milestones</Text>
                      {completedMilestones.map((m) => {
                        const isRestoring = completingMilestoneIds.has(m.id);
                        const removedAnim = getRemovedMilestoneGreenAnim(m.id);
                        return (
                          <Reanimated.View key={m.id} layout={LIST_ITEM_LAYOUT}>
                            <View
                              style={[
                                styles.completedMilestoneRow,
                                isRestoring && styles.completedRowRestoring,
                              ]}
                            >
                              <Pressable
                                style={({ pressed }) => [styles.goalDetailBody, pressed && styles.goalDetailBodyPressed]}
                                onPress={() => openMilestoneDetail(m, "completed")}
                              >
                                <Text style={[styles.milestoneTitle, styles.completedEventTitle]}>{m.title}</Text>
                                <Text style={styles.milestoneDescDone}>{m.desc}</Text>
                                <View
                                  style={[
                                    styles.tag,
                                    {
                                      backgroundColor: getTagColors(m.tag).bg,
                                      borderColor: getTagColors(m.tag).border,
                                      opacity: 0.75,
                                    },
                                  ]}
                                >
                                  <Text style={[styles.tagText, { color: getTagColors(m.tag).text }]}>{m.tag}</Text>
                                </View>
                              </Pressable>
                              <Pressable
                                style={({ pressed }) => [styles.checkButton, pressed && styles.checkButtonPressed]}
                                onPress={() => restoreMilestone(m)}
                                disabled={isRestoring}
                              >
                                <Animated.View
                                  style={[
                                    styles.eventBadge,
                                    styles.completedBadge,
                                    {
                                      opacity: removedAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 0],
                                      }),
                                      transform: [
                                        {
                                          scale: removedAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0.78],
                                          }),
                                        },
                                      ],
                                    },
                                  ]}
                                >
                                  <Text style={styles.completedBadgeText}>✓</Text>
                                </Animated.View>
                              </Pressable>
                            </View>
                          </Reanimated.View>
                        );
                      })}
                    </Reanimated.View>
                  )}

                  {completedProjects.length > 0 && (
                    <Reanimated.View layout={LIST_ITEM_LAYOUT}>
                      <Text style={styles.completedSectionLabel}>Completed projects</Text>
                      {completedProjects.map((p) => {
                        const isRestoring = completingProjectIds.has(p.id);
                        const removedAnim = getRemovedProjectGreenAnim(p.id);
                        return (
                        <Reanimated.View key={p.id} layout={LIST_ITEM_LAYOUT}>
                          <View
                            style={[
                              styles.completedProjectRow,
                              isRestoring && styles.completedRowRestoring,
                            ]}
                          >
                            <Pressable
                              style={({ pressed }) => [styles.goalDetailBody, pressed && styles.goalDetailBodyPressed]}
                              onPress={() => openProjectDetail(p, "completed")}
                            >
                              <Text style={[styles.projectTitle, styles.completedEventTitle]}>{p.title}</Text>
                              <Text style={[styles.projectDesc, styles.milestoneDescDone]}>{p.desc}</Text>
                              <View style={styles.skillTags}>
                                {p.skills.map((s) => {
                                  const colors = getSkillColors(s);
                                  return (
                                  <View
                                    key={s}
                                    style={[
                                      styles.skillTag,
                                      {
                                        backgroundColor: colors.bg,
                                        borderColor: colors.border,
                                        opacity: 0.75,
                                      },
                                    ]}
                                  >
                                    <Text style={[styles.skillTagText, { color: colors.text }]}>{s}</Text>
                                  </View>
                                  );
                                })}
                              </View>
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [styles.checkButton, pressed && styles.checkButtonPressed]}
                              onPress={() => uncompleteProject(p)}
                              disabled={isRestoring}
                            >
                              <Animated.View
                                style={[
                                  styles.eventBadge,
                                  styles.completedBadge,
                                  {
                                    opacity: removedAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [1, 0],
                                    }),
                                    transform: [
                                      {
                                        scale: removedAnim.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [1, 0.78],
                                        }),
                                      },
                                    ],
                                  },
                                ]}
                              >
                                <Text style={styles.completedBadgeText}>✓</Text>
                              </Animated.View>
                            </Pressable>
                          </View>
                        </Reanimated.View>
                      );
                      })}
                    </Reanimated.View>
                  )}

                  {completedEvents.length > 0 && (
                    <Reanimated.View layout={LIST_ITEM_LAYOUT}>
                      <Text style={styles.completedSectionLabel}>Completed events</Text>
                      {completedEvents.map((e) => {
                        const isRestoring = completingEventIds.has(e.id);
                        const removedAnim = getRemovedEventGreenAnim(e.id);
                        return (
                        <Reanimated.View key={e.id} layout={LIST_ITEM_LAYOUT}>
                          <View
                            style={[
                              styles.completedEventRow,
                              isRestoring && styles.completedRowRestoring,
                            ]}
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
                            <Pressable
                              style={({ pressed }) => [styles.checkButton, pressed && styles.checkButtonPressed]}
                              onPress={() => uncompleteEvent(e)}
                              disabled={isRestoring}
                            >
                              <Animated.View
                                style={[
                                  styles.eventBadge,
                                  styles.completedBadge,
                                  {
                                    opacity: removedAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [1, 0],
                                    }),
                                    transform: [
                                      {
                                        scale: removedAnim.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [1, 0.78],
                                        }),
                                      },
                                    ],
                                  },
                                ]}
                              >
                                <Text style={styles.completedBadgeText}>✓</Text>
                              </Animated.View>
                            </Pressable>
                          </View>
                        </Reanimated.View>
                      );
                      })}
                    </Reanimated.View>
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
      </Animated.View>
    </SafeAreaView>
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
    fontSize: 31,
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 100,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "transparent",
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
  milestoneRowTopPriority: {
    borderColor: "#a995ff",
    borderWidth: 1.5,
    backgroundColor: "#19172a",
    shadowColor: "#8c76ff",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 18,
    color: "#f5f7fb",
    letterSpacing: 0.3,
    flex: 1,
  },
  milestoneTitleDone: {
    color: "#7f8797",
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
    flexDirection: "row",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#232834",
    backgroundColor: "#141824",
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  projectCardTopPriority: {
    borderColor: "#a995ff",
    borderWidth: 1.5,
    backgroundColor: "#19172a",
    shadowColor: "#8c76ff",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  projectCardCompleting: {
    backgroundColor: "#0a0f14",
    borderColor: "#1a2028",
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#2a213f",
    borderWidth: 1,
    borderColor: "#9b86ff",
  },
  priorityPillText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 10,
    letterSpacing: 0.35,
    color: "#ddd6ff",
    textTransform: "uppercase",
  },
  topMilestonePriorityPill: {
    backgroundColor: "#35276a",
    borderColor: "#c4b6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topMilestonePriorityPillText: {
    color: "#f1ecff",
    letterSpacing: 0.45,
  },
  topProjectPriorityPill: {
    backgroundColor: "#35276a",
    borderColor: "#c4b6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topProjectPriorityPillText: {
    color: "#f1ecff",
    letterSpacing: 0.45,
  },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  projectBody: { flex: 1 },
  projectTitle: { fontFamily: "ClashGrotesk-Semibold", fontSize: 17, color: "#f5f7fb", flex: 1, marginRight: 8 },
  projectTitleGray: { color: "#7f8797" },
  projectDesc: { fontFamily: "ClashGrotesk-Regular", fontSize: 14, color: "#aab3c3", lineHeight: 20, marginBottom: 10 },
  projectDescGray: { color: "#667080" },
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
  checkButton: {
    marginTop: 1,
  },
  checkButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  goalDetailBody: {
    flex: 1,
  },
  goalDetailBodyPressed: {
    opacity: 0.84,
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
  completedProjectRow: {
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
  },
  completedRowRestoring: {
    backgroundColor: "#141824",
    borderColor: "#232834",
    opacity: 0.9,
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
