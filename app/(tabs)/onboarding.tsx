import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

const MAJORS = ["Computer Science", "Computer Engineering", "Data Science", "Software Eng.", "Cybersecurity", "AI / ML"];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const GOALS = ["Get a SWE internship", "Do research", "Build a startup", "Go to grad school", "Work in ML/AI"];
const SKILLS = [
  { id: "python", label: "Python / coding" },
  { id: "dsa", label: "Data structures" },
  { id: "git", label: "Git / version ctrl" },
  { id: "web", label: "Web dev" },
  { id: "math", label: "Discrete math" },
  { id: "systems", label: "Systems / OS" },
];
const LEVEL_LABELS = ["none", "heard of it", "beginner", "comfortable", "strong"];

export default function OnboardingScreen({ onComplete }: { onComplete: (data: any) => void }) {
  const [selectedMajor, setSelectedMajor] = useState("Computer Science");
  const [selectedYear, setSelectedYear] = useState("Freshman");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Get a SWE internship"]);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({
    python: 0, dsa: 0, git: 0, web: 0, math: 0, systems: 0,
  });

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

  function handleSubmit() {
    onComplete({
      major: selectedMajor,
      year: selectedYear,
      goals: selectedGoals,
      skills: skillLevels,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.logo}>[ pathway ]</Text>
        <Text style={styles.title}>What&apos;s your major?</Text>
        <Text style={styles.subtitle}>Answer a few quick questions and we&apos;ll build your personalized roadmap.</Text>

        {/* Major */}
        <Text style={styles.sectionLabel}>{/* your major */}</Text>
        <View style={styles.pillGroup}>
          {MAJORS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.pill, selectedMajor === m && styles.pillSelected]}
              onPress={() => setSelectedMajor(m)}
            >
              <Text style={[styles.pillText, selectedMajor === m && styles.pillTextSelected]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Year */}
        <Text style={styles.sectionLabel}>{/* your year */}</Text>
        <View style={styles.pillGroup}>
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.pill, selectedYear === y && styles.pillSelected]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[styles.pillText, selectedYear === y && styles.pillTextSelected]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skills */}
        <Text style={styles.sectionLabel}>{/* rate your skills */} </Text>
        {SKILLS.map((skill) => (
          <View key={skill.id} style={styles.skillRow}>
            <Text style={styles.skillName}>{skill.label}</Text>
            <View style={styles.skillDots}>
              {[1, 2, 3, 4].map((dot) => (
                <TouchableOpacity
                  key={dot}
                  style={[styles.dot, skillLevels[skill.id] >= dot && styles.dotFilled]}
                  onPress={() => setSkill(skill.id, dot)}
                />
              ))}
            </View>
            <Text style={styles.skillLevelLabel}>{LEVEL_LABELS[skillLevels[skill.id]]}</Text>
          </View>
        ))}

        {/* Goals */}
        <Text style={styles.sectionLabel}>{/* what do you want to do? */}</Text>
        <View style={styles.pillGroup}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, selectedGoals.includes(g) && styles.pillSelected]}
              onPress={() => toggleGoal(g)}
            >
              <Text style={[styles.pillText, selectedGoals.includes(g) && styles.pillTextSelected]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleSubmit}>
          <Text style={styles.ctaBtnText}>generate my roadmap →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  logo: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  pillSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  pillText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#666",
  },
  pillTextSelected: {
    color: "#fff",
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  skillName: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#111",
    width: 130,
  },
  skillDots: {
    flexDirection: "row",
    gap: 5,
    flex: 1,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#eee",
  },
  dotFilled: {
    backgroundColor: "#111",
  },
  skillLevelLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#888",
    width: 70,
    textAlign: "right",
  },
  ctaBtn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  ctaBtnText: {
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
  },
});
