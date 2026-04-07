import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from "react-native";

export default function RevealScreen({ profile, onContinue }: { profile: any; onContinue: () => void }) {
  if (!profile) {
    return null;
  }

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.progressLabel}>PRIORITY REVEAL</Text>
        <Text style={styles.title}>HERE&apos;S YOUR FIRST MOVE</Text>
        <Text style={styles.subtitle}>Based on your answers, this is the highest-impact step to start with.</Text>

        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>{level}</Text>
        </View>

        <View style={styles.priorityCard}>
          <Text style={styles.sectionLabel}>FIRST MILESTONE</Text>
          <Text style={styles.milestone}>{firstMilestone}</Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.sectionLabel}>WHY THIS FIRST</Text>
          <Text style={styles.reason}>{reason}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]} onPress={onContinue}>
          <Text style={styles.ctaBtnText}>CONTINUE TO ROADMAP</Text>
        </Pressable>
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
    flexGrow: 1,
    padding: 24,
    paddingBottom: 36,
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
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
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
    fontSize: 14,
    color: "#ddd6ff",
  },
  sectionLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
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
  milestone: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 25,
    color: "#f5f7fb",
    lineHeight: 32,
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
    fontSize: 16,
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
