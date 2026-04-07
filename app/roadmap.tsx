import { useState } from "react";
import {
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

export default function RoadmapScreen({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<"milestones" | "projects" | "events">("milestones");
  const [milestones, setMilestones] = useState(FAKE_MILESTONES);

  if (!profile) {
    return null;
  }

  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;
  const pct = Math.round((done / total) * 100);

  function toggleMilestone(id: string) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.progressLabel}>YOUR ROADMAP</Text>
        <Text style={styles.title}>{profile.major} Roadmap</Text>
        <Text style={styles.subtitle}>{profile.year} · {profile.goals[0] ?? "General track"}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{done}</Text>
            <Text style={styles.statLabel}>done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{total - done}</Text>
            <Text style={styles.statLabel}>to go</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{pct}%</Text>
            <Text style={styles.statLabel}>progress</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <Text style={styles.sectionLabel}>focus area</Text>
        <View style={styles.tabs}>
          {(["milestones", "projects", "events"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={({ pressed }) => [styles.tab, activeTab === tab && styles.tabActive, pressed && styles.tabPressed]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "milestones" && (
          <View>
            {milestones.map((m) => (
              <Pressable
                key={m.id}
                style={({ pressed }) => [styles.milestoneRow, pressed && styles.milestoneRowPressed]}
                onPress={() => toggleMilestone(m.id)}
              >
                <View style={[styles.check, m.done && styles.checkDone]}>
                  {m.done && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.milestoneBody}>
                  <Text style={[styles.milestoneTitle, m.done && styles.milestoneTitleDone]}>{m.title}</Text>
                  <Text style={styles.milestoneDesc}>{m.desc}</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{m.tag}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
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
            {FAKE_EVENTS.map((e) => (
              <View key={e.id} style={styles.eventRow}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventMonth}>{e.month}</Text>
                  <Text style={styles.eventDay}>{e.day}</Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventMeta}>{e.meta}</Text>
                  <Text style={styles.eventWhy}>{e.why}</Text>
                </View>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>{e.badge}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
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
    fontSize: 11,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    marginBottom: 6,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#aab3c3",
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#b7adff",
    letterSpacing: 0.7,
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
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 23,
    color: "#f5f7fb",
  },
  statLabel: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 12,
    color: "#aab3c3",
  },
  progressTrack: {
    height: 8,
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
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#3a404d",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
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
    fontSize: 17,
    color: "#f5f7fb",
    marginBottom: 4,
  },
  milestoneTitleDone: {
    color: "#7f8797",
    textDecorationLine: "line-through",
  },
  milestoneDesc: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 14,
    color: "#aab3c3",
    lineHeight: 20,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#1d1835",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#7c5cff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  tagText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 12,
    color: "#ddd6ff",
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
});
