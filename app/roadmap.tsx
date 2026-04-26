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

export const FAKE_MILESTONES = [
  { id: "1", title: "Set up your dev environment", desc: "Install VS Code, Git, and a Python environment. Get comfortable with the terminal.", tag: "foundation", done: false },
  { id: "2", title: "Learn Git basics", desc: "Commit, branch, push, pull. Create a GitHub profile and make it look active.", tag: "foundation", done: false },
  { id: "3", title: "Complete one CS project", desc: "Build anything and put it on GitHub. A calculator, a game, a script.", tag: "projects", done: false },
  { id: "4", title: "Join a CS club or org", desc: "ACM, Google DSC, or your school's hackathon club. Show up once.", tag: "community", done: false },
  { id: "5", title: "Do a LeetCode Easy per week", desc: "Start with arrays and strings. Consistency beats cramming.", tag: "interviews", done: false },
  { id: "6", title: "Attend a campus tech event", desc: "Career fair, info session, or tech talk. Talk to at least one person.", tag: "networking", done: false },
];

export const FAKE_PROJECTS = [
  { id: "1", title: "CLI To-Do App", desc: "Build a command-line task manager. Practice file I/O, loops, and functions.", diff: "easy", skills: ["python", "CLI", "file I/O"] },
  { id: "2", title: "Personal Portfolio Site", desc: "Build a static HTML/CSS site. Deploy free on GitHub Pages.", diff: "easy", skills: ["HTML", "CSS", "GitHub Pages"] },
  { id: "3", title: "REST API with Flask", desc: "Build a simple API for a to-do list. Learn HTTP methods and JSON.", diff: "medium", skills: ["python", "Flask", "REST"] },
  { id: "4", title: "Discord Bot", desc: "Automate something useful for your friend group. Great for showing initiative.", diff: "medium", skills: ["python", "APIs", "webhooks"] },
];

export const FAKE_EVENTS = [
  { id: "1", month: "APR", day: "12", title: "Spring Career Fair", meta: "University Career Center · Main Gym", why: "Internship recruiting still open at some companies", badge: "career" },
  { id: "2", month: "APR", day: "18", title: "HackUFL Spring 2026", meta: "CS Dept. · 36hr hackathon", why: "Build a project, meet teammates, put it on your resume", badge: "hackathon" },
  { id: "3", month: "---", day: "~", title: "ACM Weekly Meeting", meta: "Thursdays 6pm · CSE Building Rm 101", why: "Workshops, guest speakers, project teams", badge: "club" },
  { id: "4", month: "MAY", day: "2", title: "Google Info Session", meta: "Hosted via Handshake · Virtual", why: "Hear from engineers, ask about internships", badge: "recruiting" },
];

const MONTH_INDEX: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  foundation: { bg: "#0e1a12", border: "#2a4a32", text: "#6dbb8a" },
  projects:   { bg: "#0e1520", border: "#1e3a5a", text: "#5a9fd4" },
  community:  { bg: "#1a120e", border: "#4a2e1e", text: "#c47b4a" },
  interviews: { bg: "#170e1a", border: "#3d1e4a", text: "#a06ac4" },
  networking: { bg: "#0e1818", border: "#1e4040", text: "#4ab8b8" },
};

const SKILL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  python:         { bg: "#0e1520", border: "#1e3a5a", text: "#5a9fd4" },
  flask:          { bg: "#0e1520", border: "#1e3a5a", text: "#5a9fd4" },
  cli:            { bg: "#0e1818", border: "#1e4040", text: "#4ab8b8" },
  "file i/o":     { bg: "#0e1818", border: "#1e4040", text: "#4ab8b8" },
  html:           { bg: "#1a120e", border: "#4a2e1e", text: "#c47b4a" },
  css:            { bg: "#170e1a", border: "#3d1e4a", text: "#a06ac4" },
  "github pages": { bg: "#0e1a12", border: "#2a4a32", text: "#6dbb8a" },
  rest:           { bg: "#0e1520", border: "#1e3a5a", text: "#5a9fd4" },
  apis:           { bg: "#0e1818", border: "#1e4040", text: "#4ab8b8" },
  webhooks:       { bg: "#170e1a", border: "#3d1e4a", text: "#a06ac4" },
};

type Milestone = (typeof FAKE_MILESTONES)[number];
type Project = (typeof FAKE_PROJECTS)[number];
type Event = (typeof FAKE_EVENTS)[number];

function getEventTimestamp(event: Event, fallbackYear: number): number | null {
  const month = MONTH_INDEX[event.month?.toUpperCase() ?? ""];
  const day = Number(event.day);

  if (month === undefined || Number.isNaN(day)) {
    return null;
  }

  const explicitYearMatch = event.title.match(/\b(20\d{2})\b/);
  const year = explicitYearMatch ? Number(explicitYearMatch[1]) : fallbackYear;
  const eventDate = new Date(year, month, day, 23, 59, 59, 999);
  return Number.isNaN(eventDate.getTime()) ? null : eventDate.getTime();
}

function isPastEvent(event: Event, now: Date): boolean {
  const timestamp = getEventTimestamp(event, now.getFullYear());
  if (timestamp === null) {
    return false;
  }

  return timestamp < now.getTime();
}

const MILESTONE_ORDER = new Map(FAKE_MILESTONES.map((milestone, index) => [milestone.id, index]));
const PROJECT_ORDER = new Map(FAKE_PROJECTS.map((project, index) => [project.id, index]));
const LIST_ITEM_LAYOUT = LinearTransition.springify().damping(35).stiffness(150);

export default function RoadmapScreen({
  profile,
  onOpenGoal,
  autoCompleteGoalRequest,
  onAutoCompleteHandled,
  onCompletionStateChange,
  viewMode = "roadmap",
  startTab,
  goalMiniTaskProgress = {},
}: {
  profile: any;
  onOpenGoal?: (goal: RoadmapGoalSelection) => void;
  autoCompleteGoalRequest?: { goal: RoadmapGoalSelection; requestId: number } | null;
  onAutoCompleteHandled?: (requestId: number) => void;
  onCompletionStateChange?: (state: { completedMilestoneIds: string[]; completedProjectIds: string[] }) => void;
  viewMode?: "roadmap" | "events";
  startTab?: "milestones" | "projects" | "events" | "completed";
  goalMiniTaskProgress?: Record<string, { checked: string[]; total: number }>;
}) {
  const entryOpacityAnim = useRef(new Animated.Value(0)).current;
  const entryTranslateYAnim = useRef(new Animated.Value(14)).current;
  const [activeTab, setActiveTab] = useState<"milestones" | "projects" | "events" | "completed">(
    viewMode === "events" ? "events" : "milestones"
  );
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

  useEffect(() => {
    onCompletionStateChange?.({
      completedMilestoneIds: completedMilestones.map((milestone) => milestone.id),
      completedProjectIds: completedProjects.map((project) => project.id),
    });
  }, [completedMilestones, completedProjects, onCompletionStateChange]);

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
  const upcomingEvents = events.filter((event) => !isPastEvent(event, new Date()));
  const visibleTabs = viewMode === "events"
    ? (["events"] as const)
    : (["milestones", "projects", "completed"] as const);
  const pageTitle = viewMode === "events" ? "Events" : `${profile.major}`;
  const pageSubtitle = viewMode === "events"
    ? "Upcoming campus opportunities."
    : `${profile.year} · ${goalsSummary}`;
  const topPriorityMilestoneId = milestones.find((item) => !item.done && !completingMilestoneIds.has(item.id))?.id;
  const topPriorityProjectId = projects.find((item) => !completingProjectIds.has(item.id))?.id;

  useEffect(() => {
    if (viewMode === "events") {
      setActiveTab("events");
      return;
    }

    setActiveTab((prev) => (prev === "events" ? "milestones" : prev));
  }, [viewMode]);

  useEffect(() => {
    if (!startTab) {
      return;
    }

    if (viewMode === "events" && startTab !== "events") {
      return;
    }

    setActiveTab((prev) => {
      if (prev === startTab) {
        return prev;
      }

      return startTab;
    });
  }, [startTab, viewMode]);

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
    return SKILL_COLORS[skillName.toLowerCase()] || { bg: "#111111", border: "#2A2A2A", text: "#888888" };
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
    <View style={styles.safe}>
      <Animated.View
        style={{
          flex: 1,
          opacity: entryOpacityAnim,
          transform: [{ translateY: entryTranslateYAnim }],
        }}
      >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{pageTitle}</Text>
        <Text style={styles.subtitle}>{pageSubtitle}</Text>

        {viewMode === "roadmap" && (
          <>
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
                  colors={["#FFFFFF", "#DDDDDD"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
          </>
        )}

        {viewMode === "roadmap" && (
          <View style={styles.tabs}>
            {visibleTabs.map((tab) => (
              <Pressable
                key={tab}
                style={({ pressed }) => [styles.tab, activeTab === tab && styles.tabActive, pressed && styles.tabPressed]}
                onPress={() => animateTabChange(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Animated.View
          style={{
            opacity: tabContentOpacity,
            transform: [{ translateY: tabContentTranslateY }],
          }}
        >
          {viewMode === "roadmap" && activeTab === "milestones" && (
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
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <View
                            style={[
                              styles.tag,
                              {
                                backgroundColor: m.done || isMilestoneCompleting ? "#1A1A1A" : getTagColors(m.tag).bg,
                                borderColor: m.done || isMilestoneCompleting ? "#2A2A2A" : getTagColors(m.tag).border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tagText,
                                {
                                  color: m.done || isMilestoneCompleting ? "#555555" : getTagColors(m.tag).text,
                                },
                              ]}
                            >
                              {m.tag}
                            </Text>
                          </View>
                          {(() => {
                            const key = `milestone:${m.id}`;
                            const entry = goalMiniTaskProgress[key];
                            const checked = entry?.checked.length ?? 0;
                            const total = entry?.total ?? 0;
                            if (checked === 0 || total === 0) return null;
                            const pct = Math.min(100, Math.round((checked / total) * 100));
                            return (
                              <View style={{ flex: 1, minWidth: 60 }}>
                                <View style={{ height: 4, borderRadius: 999, backgroundColor: "#0A0A0A", overflow: "hidden" }}>
                                  <View style={{ width: `${pct}%`, height: "100%", borderRadius: 999, backgroundColor: "#FFFFFF" }} />
                                </View>
                                <Text style={{ fontFamily: "ClashGrotesk-Regular", fontSize: 11, color: "#FFFFFF", marginTop: 2 }}>{pct}% tasks done</Text>
                              </View>
                            );
                          })()}
                        </View>
                      </Pressable>
                    </View>
                  </Reanimated.View>
                );
              })}
            </View>
          )}

        {viewMode === "roadmap" && activeTab === "projects" && (
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
                          backgroundColor: isCompleting ? "#1A1A1A" : colors.bg,
                          borderColor: isCompleting ? "#2A2A2A" : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.skillTagText, { color: isCompleting ? "#555555" : colors.text }]}>{s}</Text>
                    </View>
                    );
                  })}
                </View>
                {(() => {
                  const key = `project:${p.id}`;
                  const entry = goalMiniTaskProgress[key];
                  const checked = entry?.checked.length ?? 0;
                  const total = entry?.total ?? 0;
                  if (checked === 0 || total === 0) return null;
                  const pct = Math.min(100, Math.round((checked / total) * 100));
                  return (
                    <View style={{ marginTop: 8 }}>
                      <View style={{ height: 4, borderRadius: 999, backgroundColor: "#0A0A0A", overflow: "hidden" }}>
                        <View style={{ width: `${pct}%`, height: "100%", borderRadius: 999, backgroundColor: "#FFFFFF" }} />
                      </View>
                      <Text style={{ fontFamily: "ClashGrotesk-Regular", fontSize: 11, color: "#FFFFFF", marginTop: 2 }}>{pct}% tasks done</Text>
                    </View>
                  );
                })()}
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
            {upcomingEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No upcoming events right now</Text>
              </View>
            ) : (
              upcomingEvents.map((e) => (
                <Reanimated.View key={e.id} layout={LIST_ITEM_LAYOUT}>
                  <View style={styles.eventRow}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventMonth}>{e.month}</Text>
                      <Text style={styles.eventDay}>{e.day}</Text>
                    </View>
                    <View style={styles.eventBody}>
                      <Text style={styles.eventTitle}>{e.title}</Text>
                      <Text style={styles.eventMeta}>{e.meta}</Text>
                      <Text style={styles.eventWhy}>{e.why}</Text>
                    </View>
                  </View>
                </Reanimated.View>
              ))
            )}
          </View>
        )}

          {activeTab === "completed" && (
            <View>
              {viewMode === "events"
                ? completedEvents.length === 0
                : completedMilestones.length === 0 && completedProjects.length === 0 && completedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No completed items yet</Text>
                </View>
              ) : (
                <View>
                  {viewMode === "roadmap" && completedMilestones.length > 0 && (
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

                  {viewMode === "roadmap" && completedProjects.length > 0 && (
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
  progressLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 35,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 21,
    color: "#888888",
    marginBottom: 20,
    letterSpacing: 0.4,
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 15,
    color: "#FFFFFF",
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
    borderColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    padding: 12,
    alignItems: "center",
  },
  statVal: {
    fontFamily: "ClashGrotesk-SemiBold",
    fontSize: 28,
    color: "#FFFFFF",
  },
  statLabel: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 16,
    color: "#888888",
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 2,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: 2,
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
    borderColor: "#333333",
    backgroundColor: "#111111",
  },
  tabActive: {
    backgroundColor: "#0A0A0A",
    borderColor: "#FFFFFF",
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tabText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 16,
    color: "#888888",
    textTransform: "capitalize",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  milestoneRow: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    marginBottom: 10,
  },
  milestoneRowTopPriority: {
    borderColor: "#b8860b",
    borderWidth: 1.5,
    backgroundColor: "#110e00",
    shadowColor: "#d4a017",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  milestoneRowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  milestoneRowCompleting: {
    backgroundColor: "#0D0D0D",
    borderColor: "#2A2A2A",
  },
  check: {
    position: "relative",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#333333",
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
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  checkDone: {
    backgroundColor: "#DDDDDD",
    borderColor: "#DDDDDD",
  },
  checkMark: {
    fontSize: 12,
    color: "#FFFFFF",
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
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 0.3,
    flex: 1,
  },
  milestoneTitleDone: {
    color: "#555555",
  },
  milestoneDescDone: {
    color: "#444444",
  },
  milestoneDesc: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    color: "#888888",
    lineHeight: 23,
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
    borderColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  projectCardTopPriority: {
    borderColor: "#b8860b",
    borderWidth: 1.5,
    backgroundColor: "#110e00",
    shadowColor: "#d4a017",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  projectCardCompleting: {
    backgroundColor: "#080808",
    borderColor: "#1E1E1E",
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#1a1400",
    borderWidth: 1,
    borderColor: "#b8860b",
  },
  priorityPillText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 10,
    letterSpacing: 0.35,
    color: "#d4a017",
    textTransform: "uppercase",
  },
  topMilestonePriorityPill: {
    backgroundColor: "#1a1400",
    borderColor: "#b8860b",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topMilestonePriorityPillText: {
    color: "#d4a017",
    letterSpacing: 0.45,
  },
  topProjectPriorityPill: {
    backgroundColor: "#1a1400",
    borderColor: "#b8860b",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topProjectPriorityPillText: {
    color: "#d4a017",
    letterSpacing: 0.45,
  },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  projectBody: { flex: 1 },
  projectTitle: { fontFamily: "ClashGrotesk-Semibold", fontSize: 19, color: "#FFFFFF", flex: 1, marginRight: 8 },
  projectTitleGray: { color: "#555555" },
  projectDesc: { fontFamily: "ClashGrotesk-Regular", fontSize: 16, color: "#888888", lineHeight: 22, marginBottom: 10 },
  projectDescGray: { color: "#444444" },
  skillTags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skillTag: { backgroundColor: "#111111", borderRadius: 100, borderWidth: 1, borderColor: "#333333", paddingHorizontal: 9, paddingVertical: 4 },
  skillTagText: { fontFamily: "ClashGrotesk-Regular", fontSize: 13, color: "#888888" },
  eventRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  eventDate: { width: 44, alignItems: "center" },
  eventMonth: { fontFamily: "ClashGrotesk-Semibold", fontSize: 15, color: "#888888", textTransform: "uppercase", letterSpacing: 0.9 },
  eventDay: { fontFamily: "ClashGrotesk-Bold", fontSize: 31, color: "#FFFFFF", lineHeight: 35 },
  eventBody: { flex: 1 },
  eventTitle: { fontFamily: "ClashGrotesk-Semibold", fontSize: 21, color: "#FFFFFF", marginBottom: 5, lineHeight: 25 },
  eventMeta: { fontFamily: "ClashGrotesk-Regular", fontSize: 18, color: "#888888", marginBottom: 6, lineHeight: 23 },
  eventWhy: { fontFamily: "ClashGrotesk-Regular", fontSize: 17, color: "#666666", lineHeight: 22 },
  eventBadge: { borderRadius: 100, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "#0A0A0A", paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  eventBadgeText: { fontFamily: "ClashGrotesk-Medium", fontSize: 11, color: "#FFFFFF" },
  completedSectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 15,
    color: "#FFFFFF",
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
    backgroundColor: "#080808",
    borderColor: "#1E1E1E",
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
    color: "#555555",
  },
  completedRowRestoring: {
    backgroundColor: "#0A0A0A",
    borderColor: "#1E1E1E",
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
    fontSize: 18,
    color: "#555555",
  },
  completionToast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: "rgba(10, 12, 15, 0.97)",
    borderWidth: 1,
    borderColor: "#2A2A2A",
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
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
