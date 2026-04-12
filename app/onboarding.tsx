import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  InteractionManager,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  TextInput,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { GradientBackground } from "@/components/gradient-background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const MAJOR_CATEGORIES = [
  {
    label: "STEM",
    description: "Science, technology, engineering, and math majors.",
    majors: [
      "Aerospace Engineering",
      "Agricultural Engineering",
      "Agricultural Science",
      "Animal Science",
      "Applied Mathematics",
      "Artificial Intelligence",
      "Astronomy",
      "Biochemistry",
      "Bioengineering",
      "Biomedical Engineering",
      "Biophysics",
      "Biostatistics",
      "Chemical Engineering",
      "Cognitive Science",
      "Computer Engineering",
      "Computer Information Systems",
      "Computer Science",
      "Construction Management",
      "Cybersecurity",
      "Data Science",
      "Electrical Engineering",
      "Engineering Physics",
      "Engineering Technology",
      "Environmental Engineering",
      "Environmental Science",
      "Food Science",
      "Forensic Science",
      "Genetics",
      "Geography",
      "Geology",
      "Industrial Engineering",
      "Information Technology",
      "Landscape Architecture",
      "Materials Science",
      "Mathematics",
      "Mechanical Engineering",
      "Microbiology",
      "Molecular Biology",
      "Neuroscience",
      "Physics",
      "Physiology",
      "Software Engineering",
      "Statistics",
    ],
  },
  {
    label: "Health & Medicine",
    description: "Clinical, care, and public health pathways.",
    majors: [
      "Athletic Training",
      "Clinical Psychology",
      "Communication Disorders",
      "Dentistry (Pre-Dental)",
      "Health Administration",
      "Health Science",
      "Kinesiology",
      "Medicine (Pre-Med)",
      "Nursing",
      "Nutrition",
      "Occupational Therapy",
      "Pharmacy (Pre-Pharm)",
      "Physical Education",
      "Physical Therapy",
      "Public Health",
      "Radiologic Science",
      "Speech-Language Pathology",
      "Veterinary Medicine (Pre-Vet)",
    ],
  },
  {
    label: "Business & Finance",
    description: "Business, economics, and management majors.",
    majors: [
      "Accounting",
      "Actuarial Science",
      "Business Administration",
      "Business Analytics",
      "Economics",
      "Finance",
      "Hospitality Management",
      "Human Resources",
      "Information Systems",
      "International Business",
      "Management",
      "Management Information Systems",
      "Marketing",
      "Public Administration",
      "Public Policy",
      "Sports Management",
      "Supply Chain Management",
    ],
  },
  {
    label: "Arts & Design",
    description: "Creative, visual, and performance-focused majors.",
    majors: [
      "Architecture",
      "Art Education",
      "Art History",
      "Dance",
      "Digital Media",
      "Fine Arts",
      "Game Design",
      "Graphic Design",
      "Industrial Design",
      "Interior Design",
      "Music",
      "Music Education",
      "Photography",
      "Theater",
    ],
  },
  {
    label: "Humanities & Languages",
    description: "Writing, history, languages, and cultural study.",
    majors: [
      "African American Studies",
      "Asian Studies",
      "Comparative Literature",
      "English",
      "Ethnic Studies",
      "French",
      "German",
      "Global Studies",
      "History",
      "Humanities",
      "Latin American Studies",
      "Linguistics",
      "Middle Eastern Studies",
      "Philosophy",
      "Religious Studies",
      "Spanish",
      "Women and Gender Studies",
    ],
  },
  {
    label: "Social Sciences & Policy",
    description: "Behavior, society, systems, and public policy.",
    majors: [
      "Anthropology",
      "Communication",
      "Criminal Justice",
      "Early Childhood Education",
      "Elementary Education",
      "Human Development",
      "International Relations",
      "Journalism",
      "Law (Pre-Law)",
      "Media Studies",
      "Political Science",
      "Psychology",
      "Social Work",
      "Sociology",
      "Urban Planning",
    ],
  },
  {
    label: "Education",
    description: "Teaching and learning-focused majors.",
    majors: ["Education", "Special Education"],
  },
  {
    label: "Other / Undecided",
    description: "Flexible or interdisciplinary options.",
    majors: ["Interdisciplinary Studies", "Undecided / Exploring"],
  },
];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const UNIVERSITIES = [
  "Arizona State University",
  "Boston University",
  "Brown University",
  "California Institute of Technology",
  "Carnegie Mellon University",
  "Columbia University",
  "Cornell University",
  "Duke University",
  "Emory University",
  "Florida State University",
  "Georgia Institute of Technology",
  "Harvard University",
  "Indiana University Bloomington",
  "Johns Hopkins University",
  "Massachusetts Institute of Technology",
  "New York University",
  "North Carolina State University",
  "Northwestern University",
  "Ohio State University",
  "Pennsylvania State University",
  "Princeton University",
  "Purdue University",
  "Stanford University",
  "Texas A&M University",
  "University of California, Berkeley",
  "University of California, Davis",
  "University of California, Irvine",
  "University of California, Los Angeles",
  "University of California, San Diego",
  "University of Chicago",
  "University of Florida",
  "University of Illinois Urbana-Champaign",
  "University of Maryland, College Park",
  "University of Michigan",
  "University of North Carolina at Chapel Hill",
  "University of Pennsylvania",
  "University of Southern California",
  "University of Texas at Austin",
  "University of Washington",
  "University of Wisconsin-Madison",
  "Vanderbilt University",
  "Virginia Tech",
  "Yale University",
];
const DEFAULT_SKILLS = [
  { id: "domain-core", label: "Core Domain Knowledge" },
  { id: "quant-analytical", label: "Quantitative / Analytical" },
  { id: "research-methods", label: "Research / Methodology" },
  { id: "tools-platforms", label: "Industry Tools" },
  { id: "communication", label: "Professional Communication" },
  { id: "problem-solving", label: "Problem Solving" },
];
const DEFAULT_SKILL_DESCRIPTIONS: Record<string, string> = {
  "domain-core": "Foundational concepts and vocabulary in your major that you should be comfortable using.",
  "quant-analytical": "Applying quantitative reasoning, analysis, or modeling expected in your field.",
  "research-methods": "Understanding how your field gathers evidence, validates findings, and applies methods.",
  "tools-platforms": "Using common tools, software, or platforms relevant to your discipline.",
  communication: "Explaining technical ideas clearly in writing, presentations, or discussions.",
  "problem-solving": "Breaking complex tasks into steps and choosing effective strategies to solve them.",
};
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";
const DEV_AI_API_KEY = __DEV__ ? process.env.EXPO_PUBLIC_AI_API_KEY ?? "" : "";
const DEV_AI_MODEL = __DEV__ ? process.env.AI_MODEL ?? "llama-3.3-70b-versatile" : "";
const SKILL_INTRO_TITLE = "HOW TO RATE YOURSELF";
const SKILL_INTRO_LEAD = "Use 1 - 4 for each skill so your roadmap matches your current level.";
const SKILL_LEVEL_OPTIONS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Basic Familiarity" },
  { value: 3, label: "Comfortable" },
  { value: 4, label: "Confident" },
];
const SKILL_DESCRIPTION_PROMPT_VERSION = "skills-desc-25-35-v2";

const SKILL_SHEET_HEIGHT = 220;

type OnboardingScreenProps = {
  onComplete: (data: any) => void;
  startAtQuestions?: boolean;
};

export default function OnboardingScreen({ onComplete, startAtQuestions = false }: OnboardingScreenProps) {
  const TOTAL_STEPS = 4;
  const [selectedMajor, setSelectedMajor] = useState("");
  const [majorQuery, setMajorQuery] = useState("");
  const [isMajorSearchFocused, setIsMajorSearchFocused] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [isSchoolSearchFocused, setIsSchoolSearchFocused] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [generatedGoals, setGeneratedGoals] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(startAtQuestions);
  const [isSkillsIntroPopupVisible, setIsSkillsIntroPopupVisible] = useState(false);
  const [isSkillsIntroPopupMounted, setIsSkillsIntroPopupMounted] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isSkillSheetVisible, setIsSkillSheetVisible] = useState(false);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skillsToRate, setSkillsToRate] = useState(DEFAULT_SKILLS);
  const [skillDescriptions, setSkillDescriptions] = useState<Record<string, string>>(DEFAULT_SKILL_DESCRIPTIONS);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [lastGeneratedSkillsKey, setLastGeneratedSkillsKey] = useState("");
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [lastGeneratedGoalsKey, setLastGeneratedGoalsKey] = useState("");
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [isQuestionEntrySettled, setIsQuestionEntrySettled] = useState(startAtQuestions);
  const [expandedMajorCategories, setExpandedMajorCategories] = useState<string[]>([]);
  const containerBottomPadding = started ? (step <= 1 ? 120 : 180) : 48;
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const exitSlideAnim = useRef(new Animated.Value(0)).current;
  const majorSearchFocusAnim = useRef(new Animated.Value(0)).current;
  const selectedMajorRowAnim = useRef(new Animated.Value(0)).current;
  const selectedMajorLabelAnim = useRef(new Animated.Value(0)).current;
  const selectedMajorAppearAnim = useRef(new Animated.Value(0)).current;
  const selectedMajorTapAnim = useRef(new Animated.Value(0)).current;
  const selectedSchoolRowAnim = useRef(new Animated.Value(0)).current;
  const selectedSchoolAppearAnim = useRef(new Animated.Value(0)).current;
  const schoolSearchFocusAnim = useRef(new Animated.Value(0)).current;
  const yearRevealAnim = useRef(new Animated.Value(0)).current;
  const nextBtnEnableAnim = useRef(new Animated.Value(0)).current;
  const skillIntroBackdropOpacity = useRef(new Animated.Value(0)).current;
  const skillIntroCardOpacity = useRef(new Animated.Value(0)).current;
  const skillIntroCardScale = useRef(new Animated.Value(0.96)).current;
  const skillIntroCardTranslateY = useRef(new Animated.Value(18)).current;
  const skillSheetTranslateY = useRef(new Animated.Value(SKILL_SHEET_HEIGHT + 40)).current;
  const majorCategoryExpandAnimsRef = useRef<Record<string, Animated.Value>>({});
  const yearPillScaleAnimsRef = useRef<Record<string, Animated.Value>>({});
  const goalPillScaleAnimsRef = useRef<Record<string, Animated.Value>>({});
  const customGoalAppearAnimsRef = useRef<Record<string, Animated.Value>>({});
  const skillDotTapAnimsRef = useRef<Record<string, Animated.Value>>({});
  const skillLabelAnimsRef = useRef<Record<string, Animated.Value>>({});
  const getMajorCategoryExpandAnim = (categoryLabel: string) => {
    if (!majorCategoryExpandAnimsRef.current[categoryLabel]) {
      majorCategoryExpandAnimsRef.current[categoryLabel] = new Animated.Value(0);
    }
    return majorCategoryExpandAnimsRef.current[categoryLabel];
  };
  const getYearPillScaleAnim = (year: string) => {
    if (!yearPillScaleAnimsRef.current[year]) {
      yearPillScaleAnimsRef.current[year] = new Animated.Value(1);
    }
    return yearPillScaleAnimsRef.current[year];
  };
  const getGoalPillScaleAnim = (goal: string) => {
    if (!goalPillScaleAnimsRef.current[goal]) {
      goalPillScaleAnimsRef.current[goal] = new Animated.Value(1);
    }
    return goalPillScaleAnimsRef.current[goal];
  };
  const getCustomGoalAppearAnim = (goal: string) => {
    if (!customGoalAppearAnimsRef.current[goal]) {
      customGoalAppearAnimsRef.current[goal] = new Animated.Value(1);
    }
    return customGoalAppearAnimsRef.current[goal];
  };
  const getSkillDotTapAnim = (skillId: string, dot: number) => {
    const key = `${skillId}-${dot}`;
    if (!skillDotTapAnimsRef.current[key]) {
      skillDotTapAnimsRef.current[key] = new Animated.Value(0);
    }
    return skillDotTapAnimsRef.current[key];
  };
  const getSkillLabelAnim = (skillId: string) => {
    if (!skillLabelAnimsRef.current[skillId]) {
      skillLabelAnimsRef.current[skillId] = new Animated.Value(0);
    }
    return skillLabelAnimsRef.current[skillId];
  };
  const activeSkillRef = useRef<string | null>(null);
  const hasSeenSkillsIntroRef = useRef(false);
  const hasEnteredQuestionsRef = useRef(startAtQuestions);
  const prevStepRef = useRef(0);
  const prevSelectedMajorRef = useRef("");
  const prevGoalsMajorRef = useRef("");
  const prevSelectedSchoolRef = useRef("");
  const hasPlayedSelectedMajorLabelIntroRef = useRef(false);
  const normalizedMajorQuery = majorQuery.trim().toLowerCase();
  const visibleMajorCategories = MAJOR_CATEGORIES.map((category) => {
    const categoryMatches = category.label.toLowerCase().includes(normalizedMajorQuery);
    const majors =
      normalizedMajorQuery.length === 0 || categoryMatches
        ? category.majors
        : category.majors.filter((major) => major.toLowerCase().includes(normalizedMajorQuery));

    return {
      ...category,
      majors,
    };
  }).filter((category) => category.majors.length > 0);
  const hasMajorSearchResults = visibleMajorCategories.length > 0;
  const normalizedSchoolQuery = schoolQuery.trim();
  const filteredSchools = UNIVERSITIES.filter((school) =>
    school.toLowerCase().includes(normalizedSchoolQuery.toLowerCase())
  );
  const canUseCustomSchool = normalizedSchoolQuery.length > 1 && filteredSchools.length === 0;
  const hasAllSkillsRated = skillsToRate.length > 0 && skillsToRate.every((skill) => (skillLevels[skill.id] ?? 0) > 0);
  const currentSkillsGenerationKey = `${selectedMajor || "computer science"}|${selectedYear || "college"}|${SKILL_DESCRIPTION_PROMPT_VERSION}`;
  const areSkillsReadyForCurrentSelection =
    lastGeneratedSkillsKey === currentSkillsGenerationKey && skillsToRate.length > 0;
  const normalizedGoalSkillEntries = Object.entries(skillLevels)
    .filter(([, level]) => typeof level === "number")
    .sort(([left], [right]) => left.localeCompare(right));
  const currentGoalsGenerationKey = `${selectedMajor || "computer science"}|${selectedYear || "college"}|${selectedSchool || "their university"}|${JSON.stringify(Object.fromEntries(normalizedGoalSkillEntries))}`;
  const areGoalsReadyForCurrentSelection =
    lastGeneratedGoalsKey === currentGoalsGenerationKey && generatedGoals.length > 0;

  function slugifySkillLabel(label: string, index: number) {
    const base = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return base || `skill-${index + 1}`;
  }

  function buildSkillState(skills: { id: string }[], prev: Record<string, number>) {
    const next: Record<string, number> = {};
    for (const skill of skills) {
      next[skill.id] = prev[skill.id] ?? 0;
    }
    return next;
  }

  function normalizeGoalList(goalList: unknown): string[] {
    if (!Array.isArray(goalList)) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const goal of goalList) {
      if (typeof goal !== "string") {
        continue;
      }

      const trimmed = goal.trim().slice(0, 80);
      if (!trimmed) {
        continue;
      }

      const key = trimmed.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(trimmed);
    }

    return normalized;
  }

  function broadenSpecificGoal(goal: string): string {
    const normalized = goal.trim().replace(/[.!?]+$/g, "");
    const hasRoleWord = /\b(role|position|job)\b/i.test(normalized);
    const hasJobTitlePattern = /\b(analyst|engineer|developer|manager|consultant|scientist|specialist)\b/i.test(normalized);
    const hasTargetingVerb = /\b(secure|get|land|become|attain|obtain|win)\b/i.test(normalized);

    if (hasRoleWord || (hasJobTitlePattern && hasTargetingVerb)) {
      return "Advance Career Readiness";
    }

    return normalized;
  }

  function getMajorCategoryLabel(major: string) {
    return MAJOR_CATEGORIES.find((category) => category.majors.includes(major))?.label ?? "";
  }

  function toggleMajorCategory(categoryLabel: string) {
    setExpandedMajorCategories((prev) =>
      prev.includes(categoryLabel) ? prev.filter((label) => label !== categoryLabel) : [...prev, categoryLabel]
    );
  }

  const generateSkillsFromAI = useCallback(async () => {
    const major = selectedMajor || "computer science";
    const year = selectedYear || "college";
    const generationKey = `${major}|${year}|${SKILL_DESCRIPTION_PROMPT_VERSION}`;

    if (isGeneratingSkills || lastGeneratedSkillsKey === generationKey) {
      return;
    }

    setIsGeneratingSkills(true);
    try {
      let response: Response;

      if (__DEV__) {
        if (!DEV_AI_API_KEY) {
          throw new Error("EXPO_PUBLIC_AI_API_KEY is missing in development");
        }

        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEV_AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: DEV_AI_MODEL,
            temperature: 0.5,
            messages: [
              {
                role: "system",
                content:
                  'Return strict JSON only. Output format: {"skills":[{"label":"...","description":"..."}]}. Exactly 6 skills. Skills must be specific to the student\'s major and academic level, not generic computer science skills unless the major is CS-related. Include domain-specific areas used in that major (for example, actuarial science should emphasize probability, statistics, financial mathematics, risk modeling, insurance concepts, and actuarial software). Keep labels short and write each description in 2 to 3 sentences having a maximum of 18 words per description. Avoid template-like repeated endings across skills.',
              },
              {
                role: "user",
                content: `Generate exactly 6 major-specific skills a ${year} ${major} student should self-rate for a roadmap app. Do not default to software engineering skills unless the major is software/computer related. Keep labels short and make each description 2 to 3 sentences having a maximum of 18 words per description. Keep each description distinct and avoid repeated stock phrasing.`,
              },
            ],
          }),
        });
      } else {
        response = await fetch(`${API_URL}/skills/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ major, year }),
        });
      }

      if (!response.ok) {
        throw new Error("Skill generation request failed");
      }

      const data = await response.json();
      const apiSkills = __DEV__
        ? (() => {
            const rawText = data?.choices?.[0]?.message?.content ?? "";
            const jsonStart = rawText.indexOf("{");
            const jsonEnd = rawText.lastIndexOf("}");
            const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? rawText.slice(jsonStart, jsonEnd + 1) : rawText;
            const parsed = JSON.parse(jsonText);
            return Array.isArray(parsed?.skills) ? parsed.skills.slice(0, 6) : [];
          })()
        : Array.isArray(data?.skills)
        ? data.skills.slice(0, 6)
        : [];

      if (apiSkills.length !== 6) {
        throw new Error("Skill generation did not return 6 skills");
      }

      const normalizedSkills = apiSkills.map((skill: { label?: string; description?: string }, index: number) => ({
        id: slugifySkillLabel(skill?.label?.trim() || `Skill ${index + 1}`, index),
        label: (skill?.label?.trim() || `Skill ${index + 1}`).slice(0, 40),
        description: (skill?.description?.replace(/\s+/g, " ").trim() || "Rate your familiarity with this skill.").slice(0, 360),
      }));

      const dedupedSkills = normalizedSkills.map(
        (skill: { id: string; label: string; description: string }, index: number) => {
          const duplicates = normalizedSkills.filter(
            (s: { id: string; label: string; description: string }) => s.id === skill.id
          );
          if (duplicates.length <= 1) {
            return skill;
          }
          return { ...skill, id: `${skill.id}-${index + 1}` };
        }
      );

      const descriptions: Record<string, string> = {};
      for (const skill of dedupedSkills) {
        descriptions[skill.id] = skill.description;
      }

      setSkillsToRate(dedupedSkills.map((skill: { id: string; label: string }) => ({ id: skill.id, label: skill.label })));
      setSkillDescriptions(descriptions);
      setSkillLevels((prev) => buildSkillState(dedupedSkills, prev));
      setLastGeneratedSkillsKey(generationKey);
    } catch (error) {
      if (__DEV__) {
        console.warn("Skill generation failed:", error);
      }
    } finally {
      setIsGeneratingSkills(false);
    }
  }, [isGeneratingSkills, lastGeneratedSkillsKey, selectedMajor, selectedYear]);

  const generateGoalsFromAI = useCallback(async () => {
    const major = selectedMajor || "computer science";
    const year = selectedYear || "college";
    const school = selectedSchool || "their university";
    const normalizedSkillEntries = Object.entries(skillLevels)
      .filter(([, level]) => typeof level === "number")
      .sort(([left], [right]) => left.localeCompare(right));
    const normalizedSkills = Object.fromEntries(normalizedSkillEntries);
    const skillsJson = JSON.stringify(normalizedSkills);
    const generationKey = `${major}|${year}|${school}|${skillsJson}`;

    if (isGeneratingGoals || lastGeneratedGoalsKey === generationKey) {
      return;
    }

    setIsGeneratingGoals(true);
    try {
      let response: Response;

      if (__DEV__) {
        if (!DEV_AI_API_KEY) {
          throw new Error("EXPO_PUBLIC_AI_API_KEY is missing in development");
        }

        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEV_AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: DEV_AI_MODEL,
            temperature: 0.5,
            messages: [
              {
                role: "system",
                content:
                  'Return strict JSON only. Output format: {"goals":["..."]}. Exactly 6 goals. Each goal must be a short phrase of 2 to 6 words. Goals should be clear, useful, and outcome-focused, but not overly specific. Keep them broad enough to be widely applicable to students in the major. Include a mix of goals like getting certified, landing an internship, preparing for grad school, and building career readiness. Do not mention specific job titles, role names, company names, or exact positions. Goals must match the major and skill level provided. No project-based goals and no full sentences.',
              },
              {
                role: "user",
                content: `Generate exactly 6 short outcome goals for a ${year} ${major} student at ${school} whose skill ratings are: ${skillsJson}. Each goal should be 2 to 6 words. Keep the goals practical and broad rather than highly specific. It is okay to use goals like "Get Certified" or "Get an Internship". Make goals fit the student's major and skill level. Include a mix of certification, internship/research, grad-school, and broad career-readiness goals. Do not use specific job titles or role names. Return only JSON.`,
              },
            ],
          }),
        });
      } else {
        response = await fetch(`${API_URL}/goals/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ major, year, school, skills: normalizedSkills }),
        });
      }

      if (!response.ok) {
        throw new Error("Goal generation request failed");
      }

      const data = await response.json();
      const apiGoals = __DEV__
        ? (() => {
            const rawText = data?.choices?.[0]?.message?.content ?? "";
            const jsonStart = rawText.indexOf("{");
            const jsonEnd = rawText.lastIndexOf("}");
            const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? rawText.slice(jsonStart, jsonEnd + 1) : rawText;
            const parsed = JSON.parse(jsonText);
            return normalizeGoalList(parsed?.goals)
              .map((goal) => broadenSpecificGoal(goal))
              .map((goal) => goal.replace(/[.!?]+$/g, "").trim())
              .slice(0, 6);
          })()
        : normalizeGoalList(data?.goals)
            .map((goal) => broadenSpecificGoal(goal))
            .map((goal) => goal.replace(/[.!?]+$/g, "").trim())
            .slice(0, 6);

      if (apiGoals.length !== 6) {
        throw new Error("Goal generation did not return 6 goals");
      }

      setGeneratedGoals(apiGoals);
      setSelectedGoals([]);
      setCustomGoals([]);
      setCustomGoalInput("");
      setLastGeneratedGoalsKey(generationKey);
    } catch (error) {
      if (__DEV__) {
        console.warn("Goal generation failed:", error);
      }
    } finally {
      setIsGeneratingGoals(false);
    }
  }, [
    isGeneratingGoals,
    lastGeneratedGoalsKey,
    selectedMajor,
    selectedSchool,
    selectedYear,
    skillLevels,
  ]);

  useEffect(() => {
    setSkillLevels((prev) => buildSkillState(skillsToRate, prev));
  }, [skillsToRate]);

  useEffect(() => {
    if (started && step >= 1 && selectedMajor.trim().length > 0 && selectedYear.trim().length > 0) {
      generateSkillsFromAI();
    }
  }, [generateSkillsFromAI, selectedMajor, selectedYear, started, step]);

  useEffect(() => {
    if (selectedMajor.trim().length === 0) {
      return;
    }

    if (selectedMajor !== prevGoalsMajorRef.current) {
      setGeneratedGoals([]);
      setSelectedGoals([]);
      setCustomGoals([]);
      setCustomGoalInput("");
      setLastGeneratedGoalsKey("");
    }

    prevGoalsMajorRef.current = selectedMajor;
  }, [selectedMajor]);

  useEffect(() => {
    // Preload goals while the user is on skills so step 4 renders without pop-in.
    if (
      started &&
      step >= 2 &&
      selectedMajor.trim().length > 0 &&
      selectedSchool.trim().length > 0 &&
      selectedYear.trim().length > 0 &&
      hasAllSkillsRated
    ) {
      generateGoalsFromAI();
    }
  }, [
    generateGoalsFromAI,
    hasAllSkillsRated,
    selectedMajor,
    selectedSchool,
    selectedYear,
    started,
    step,
  ]);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!started) {
      setIsQuestionEntrySettled(startAtQuestions);
      return;
    }

    if (isQuestionEntrySettled) {
      return;
    }

    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setIsQuestionEntrySettled(true);
    });

    return () => {
      interactionTask.cancel();
    };
  }, [isQuestionEntrySettled, startAtQuestions, started]);

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
    if (!hasEnteredQuestionsRef.current) {
      contentOpacity.setValue(0);
      contentTranslateY.setValue(16);
      hasEnteredQuestionsRef.current = true;
    } else {
      contentOpacity.setValue(0.12);
      contentTranslateY.setValue(direction * 12);
    }

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
    if (activeSkillId) {
      setIsSkillSheetVisible(true);
      skillSheetTranslateY.setValue(SKILL_SHEET_HEIGHT + 56);
      Animated.spring(skillSheetTranslateY, {
        toValue: 0,
        friction: 12,
        tension: 68,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(skillSheetTranslateY, {
      toValue: SKILL_SHEET_HEIGHT + 56,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSkillSheetVisible(false);
    });
  }, [activeSkillId, skillSheetTranslateY]);

  useEffect(() => {
    if (step === 2 && !hasSeenSkillsIntroRef.current) {
      hasSeenSkillsIntroRef.current = true;
      setIsSkillsIntroPopupVisible(true);
      return;
    }

    if (step !== 2) {
      setIsSkillsIntroPopupVisible(false);
      setActiveSkillId(null);
    }
  }, [step]);

  useEffect(() => {
    if (isSkillsIntroPopupVisible) {
      setIsSkillsIntroPopupMounted(true);
      skillIntroBackdropOpacity.setValue(0);
      skillIntroCardOpacity.setValue(0);
      skillIntroCardScale.setValue(0.96);
      skillIntroCardTranslateY.setValue(18);

      Animated.parallel([
        Animated.timing(skillIntroBackdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(skillIntroCardOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(skillIntroCardScale, {
          toValue: 1,
          friction: 9,
          tension: 95,
          useNativeDriver: true,
        }),
        Animated.spring(skillIntroCardTranslateY, {
          toValue: 0,
          friction: 10,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (!isSkillsIntroPopupMounted) {
      return;
    }

    Animated.parallel([
      Animated.timing(skillIntroBackdropOpacity, {
        toValue: 0,
        duration: 170,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(skillIntroCardOpacity, {
        toValue: 0,
        duration: 170,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(skillIntroCardScale, {
        toValue: 0.96,
        duration: 170,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(skillIntroCardTranslateY, {
        toValue: 14,
        duration: 170,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSkillsIntroPopupMounted(false);
    });
  }, [
    isSkillsIntroPopupMounted,
    isSkillsIntroPopupVisible,
    skillIntroBackdropOpacity,
    skillIntroCardOpacity,
    skillIntroCardScale,
    skillIntroCardTranslateY,
  ]);

  useEffect(() => {
    const hasSelectedMajor = selectedMajor.length > 0;

    selectedMajorRowAnim.stopAnimation();
    selectedMajorLabelAnim.stopAnimation();
    selectedMajorAppearAnim.stopAnimation();

    Animated.timing(selectedMajorRowAnim, {
      toValue: hasSelectedMajor ? 1 : 0,
      duration: hasSelectedMajor ? 260 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (hasSelectedMajor && selectedMajor !== prevSelectedMajorRef.current) {
      if (!hasPlayedSelectedMajorLabelIntroRef.current) {
        selectedMajorLabelAnim.setValue(0);
        Animated.timing(selectedMajorLabelAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.bezier(0.2, 0.9, 0.22, 1),
          useNativeDriver: true,
        }).start(() => {
          hasPlayedSelectedMajorLabelIntroRef.current = true;
        });
      } else {
        selectedMajorLabelAnim.setValue(1);
      }

      selectedMajorAppearAnim.setValue(0);
      Animated.timing(selectedMajorAppearAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.bezier(0.2, 0.9, 0.22, 1),
        useNativeDriver: true,
      }).start();
    }

    if (!hasSelectedMajor) {
      selectedMajorAppearAnim.setValue(0);
      selectedMajorTapAnim.setValue(0);
    }

    prevSelectedMajorRef.current = selectedMajor;
  }, [
    selectedMajor,
    selectedMajorAppearAnim,
    selectedMajorLabelAnim,
    selectedMajorRowAnim,
    selectedMajorTapAnim,
  ]);

  useEffect(() => {
    if (!selectedMajor) {
      return;
    }

    const selectedCategoryLabel = getMajorCategoryLabel(selectedMajor);
    if (!selectedCategoryLabel) {
      return;
    }

    setExpandedMajorCategories((prev) =>
      prev.includes(selectedCategoryLabel) ? prev : [...prev, selectedCategoryLabel]
    );
  }, [selectedMajor]);

  useEffect(() => {
    MAJOR_CATEGORIES.forEach((category) => {
      const categoryAnim = getMajorCategoryExpandAnim(category.label);
      const isExpanded = normalizedMajorQuery.length > 0 || expandedMajorCategories.includes(category.label);

      Animated.spring(categoryAnim, {
        toValue: isExpanded ? 1 : 0,
        stiffness: isExpanded ? 180 : 210,
        damping: isExpanded ? 24 : 28,
        mass: 0.85,
        overshootClamping: true,
        useNativeDriver: false,
      }).start();
    });
  }, [majorQuery, normalizedMajorQuery.length, expandedMajorCategories]);

  useEffect(() => {
    const hasSelectedSchool = selectedSchool.length > 0;

    Animated.timing(selectedSchoolRowAnim, {
      toValue: hasSelectedSchool ? 1 : 0,
      duration: hasSelectedSchool ? 320 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (hasSelectedSchool && selectedSchool !== prevSelectedSchoolRef.current) {
      selectedSchoolAppearAnim.setValue(0);
      Animated.spring(selectedSchoolAppearAnim, {
        toValue: 1,
        friction: 8,
        tension: 85,
        useNativeDriver: true,
      }).start();
    }

    if (!hasSelectedSchool) {
      selectedSchoolAppearAnim.setValue(0);
    }

    prevSelectedSchoolRef.current = selectedSchool;
  }, [selectedSchool, selectedSchoolAppearAnim, selectedSchoolRowAnim]);

  useEffect(() => {
    Animated.spring(majorSearchFocusAnim, {
      toValue: isMajorSearchFocused ? 1 : 0,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isMajorSearchFocused, majorSearchFocusAnim]);

  useEffect(() => {
    Animated.spring(schoolSearchFocusAnim, {
      toValue: isSchoolSearchFocused ? 1 : 0,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isSchoolSearchFocused, schoolSearchFocusAnim]);

  useEffect(() => {
    Animated.timing(yearRevealAnim, {
      toValue: selectedSchool.trim().length > 0 ? 1 : 0,
      duration: selectedSchool.trim().length > 0 ? 380 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedSchool, yearRevealAnim]);

  useEffect(() => {
    const hasMajorSelection = selectedMajor.trim().length > 0;
    const hasSchoolSelection = selectedSchool.trim().length > 0;
    const hasYearSelection = selectedYear.trim().length > 0;
    const hasGoalSelection = generatedGoals.length > 0 && selectedGoals.length > 0;
    const shouldEnableNext =
      step === 0
        ? hasMajorSelection
        : step === 1
        ? hasSchoolSelection && hasYearSelection
        : step === 2
        ? hasAllSkillsRated
        : step === TOTAL_STEPS - 1
        ? hasGoalSelection
        : true;
    Animated.timing(nextBtnEnableAnim, {
      toValue: shouldEnableNext ? 1 : 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [
    TOTAL_STEPS,
    nextBtnEnableAnim,
    selectedGoals.length,
    generatedGoals.length,
    selectedMajor,
    selectedSchool,
    selectedYear,
    hasAllSkillsRated,
    skillLevels,
    step,
  ]);

  function animateSelectedMajorTap() {
    selectedMajorTapAnim.setValue(0);
    Animated.sequence([
      Animated.timing(selectedMajorTapAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.bezier(0.22, 0.8, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(selectedMajorTapAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.bezier(0.32, 0, 0.18, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function addCustomGoal() {
    const rawGoal = customGoalInput.trim();
    if (!rawGoal) {
      return;
    }

    const allGoals = [...generatedGoals, ...customGoals];
    const existingGoal = allGoals.find((goal) => goal.toLowerCase() === rawGoal.toLowerCase());
    const goalToSelect = existingGoal ?? rawGoal;

    if (!existingGoal) {
      customGoalAppearAnimsRef.current[rawGoal] = new Animated.Value(0);
      setCustomGoals((prev) => [...prev, rawGoal]);

      requestAnimationFrame(() => {
        const appearAnim = customGoalAppearAnimsRef.current[rawGoal];
        if (!appearAnim) {
          return;
        }

        Animated.parallel([
          Animated.timing(appearAnim, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }

    setSelectedGoals((prev) => (prev.includes(goalToSelect) ? prev : [...prev, goalToSelect]));
    setCustomGoalInput("");
  }

  function setSkillLevel(id: string, level: number) {
    setSkillLevels((prev) => ({
      ...prev,
      [id]: level,
    }));
  }

  function createSkillDotTapAnimation(skillId: string, dot: number) {
    const tapAnim = getSkillDotTapAnim(skillId, dot);
    tapAnim.stopAnimation();
    tapAnim.setValue(0);
    return Animated.sequence([
      Animated.timing(tapAnim, {
        toValue: 1,
        duration: 110,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(tapAnim, {
        toValue: 0,
        tension: 75,
        friction: 9,
        useNativeDriver: true,
      }),
    ]);
  }

  function animateSkillDotFill(skillId: string, fromLevel: number, toLevel: number) {
    if (toLevel > fromLevel) {
      const fillAnims = [];
      for (let dot = fromLevel + 1; dot <= toLevel; dot += 1) {
        fillAnims.push(createSkillDotTapAnimation(skillId, dot));
      }
      Animated.stagger(55, fillAnims).start();
      return;
    }

    if (toLevel > 0) {
      createSkillDotTapAnimation(skillId, toLevel).start();
    }
  }

  function animateSkillLabelChange(skillId: string) {
    const labelAnim = getSkillLabelAnim(skillId);
    labelAnim.stopAnimation();
    labelAnim.setValue(0);
    Animated.sequence([
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 130,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(labelAnim, {
        toValue: 0,
        tension: 72,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function toggleSkillSheet(skillId: string) {
    setActiveSkillId((prev) => (prev === skillId ? null : skillId));
  }

  function closeSkillSheet() {
    setActiveSkillId(null);
  }

  function closeSkillsIntroPopup() {
    setIsSkillsIntroPopupVisible(false);
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
        school: selectedSchool,
        year: selectedYear,
        goals: selectedGoals,
        skills: skillLevels,
      });
    });
  }

  function goNext() {
    if (!started) {
      LayoutAnimation.configureNext({
        duration: 320,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      setIsQuestionEntrySettled(false);
      setStarted(true);
      setStep(0);
      return;
    }

    if (step === 0 && selectedMajor.trim().length === 0) {
      return;
    }

    if (step === 1 && (selectedSchool.trim().length === 0 || selectedYear.trim().length === 0)) {
      return;
    }

    if (step === 2 && !hasAllSkillsRated) {
      return;
    }

    if (step === TOTAL_STEPS - 1 && selectedGoals.length === 0) {
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
    if (step === 1) return "Where do you study?";
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
          <Text style={styles.titleSmallRest}>WHERE DO YOU STUDY?</Text>
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

  function getStepSubtitle() {
    if (!started) {
      return "";
    }

    if (step === 0) {
      return "Pick your major or the closest match.";
    }

    if (step === 1) {
      return "Search for your school, then choose your year.";
    }

    if (step === 2) {
      return "Rate each skill from 1 to 4.";
    }

    return "Goals are generated from your selected major. You can choose more than one.";
  }

  const isNextDisabled =
    isTransitioning ||
    (step === 0 && selectedMajor.trim().length === 0) ||
    (step === 1 && (selectedSchool.trim().length === 0 || selectedYear.trim().length === 0)) ||
    (step === 2 && !hasAllSkillsRated) ||
    (step === TOTAL_STEPS - 1 && (!generatedGoals.length || selectedGoals.length === 0));
  const nextBtnTextColor = nextBtnEnableAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#cfd3da", "#f7f5ff"],
  });

  function renderStepContent() {
    if (!started) {
      return null;
    }

    if (step === 0) {
      const hasSelectedMajor = selectedMajor.length > 0;
      return (
        <>
          <Animated.View
            pointerEvents={hasSelectedMajor ? "auto" : "none"}
            style={[
              styles.selectedMajorShell,
              hasSelectedMajor && styles.selectedMajorShellVisible,
              {
                opacity: selectedMajorRowAnim,
                transform: [
                  {
                    translateY: selectedMajorRowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-4, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {hasSelectedMajor && (
              <View style={styles.selectedMajorStack}>
                <Animated.Text
                  style={[
                    styles.selectedMajorLabel,
                    {
                      opacity: selectedMajorLabelAnim,
                      transform: [
                        {
                          translateY: selectedMajorLabelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-6, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  Selected major
                </Animated.Text>
                <Animated.View
                  style={{
                    opacity: selectedMajorAppearAnim,
                    transform: [
                      {
                        translateY: selectedMajorAppearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                      {
                        scale: selectedMajorAppearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.96, 1],
                        }),
                      },
                      {
                        scale: selectedMajorTapAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.022],
                        }),
                      },
                    ],
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [styles.selectedMajorPill, pressed && styles.selectedMajorPillPressed]}
                    onPress={animateSelectedMajorTap}
                  >
                    <Text style={styles.selectedMajorPillText}>{selectedMajor}</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.majorSearchShell,
              {
                transform: [
                  {
                    scale: majorSearchFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.015],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.majorSearch,
                isMajorSearchFocused && styles.majorSearchFocused,
              ]}
            >
              <MaterialIcons name="search" size={20} color="#8e98b0" style={styles.majorSearchIcon} />
              <TextInput
                value={majorQuery}
                onChangeText={setMajorQuery}
                onFocus={() => setIsMajorSearchFocused(true)}
                onBlur={() => setIsMajorSearchFocused(false)}
                placeholder="Search majors"
                placeholderTextColor="#6e7790"
                style={styles.majorSearchInput}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="search"
              />
              {majorQuery.length > 0 && (
                <Pressable
                  style={({ pressed }) => [styles.majorSearchClearBtn, pressed && styles.majorSearchClearBtnPressed]}
                  onPress={() => setMajorQuery("")}
                >
                  <Text style={styles.majorSearchClearText}>Clear</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          <View style={styles.majorCategoryList}>
            {visibleMajorCategories.map((category) => {
              const isExpanded = normalizedMajorQuery.length > 0 || expandedMajorCategories.includes(category.label);
              const categoryAnim = getMajorCategoryExpandAnim(category.label);
              const chevronRotate = categoryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              });

              return (
                <View key={category.label} style={styles.majorCategoryCard}>
                  <Pressable
                    disabled={normalizedMajorQuery.length > 0}
                    style={({ pressed }) => [
                      styles.majorCategoryHeader,
                      pressed && normalizedMajorQuery.length === 0 && styles.majorCategoryHeaderPressed,
                    ]}
                    onPress={() => {
                      if (normalizedMajorQuery.length === 0) {
                        toggleMajorCategory(category.label);
                      }
                    }}
                  >
                    <View style={styles.majorCategoryHeaderCopy}>
                      <Text style={styles.majorCategoryTitle}>{category.label}</Text>
                      <Text style={styles.majorCategoryDescription}>{category.description}</Text>
                    </View>
                    <View style={styles.majorCategoryHeaderMeta}>
                      <View style={styles.majorCategoryChevronBtn}>
                        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                          <MaterialIcons name="expand-more" size={24} color="#b7c1d7" />
                        </Animated.View>
                      </View>
                    </View>
                  </Pressable>

                  <Animated.View
                    pointerEvents={isExpanded ? "auto" : "none"}
                    style={[
                      styles.majorCategoryBody,
                      {
                        maxHeight: categoryAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1600],
                        }),
                        opacity: categoryAnim,
                        transform: [
                          {
                            translateY: categoryAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-6, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.majorOptionList}>
                      {category.majors.map((major) => {
                        const isSelected = selectedMajor === major;

                        return (
                          <View key={major}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.majorOption,
                                isSelected && styles.majorOptionSelected,
                                pressed && styles.pillPressed,
                              ]}
                              onPress={() => {
                                setSelectedMajor(major);
                              }}
                            >
                              <Text style={[styles.majorOptionText, isSelected && styles.majorOptionTextSelected]}>
                                {major}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </Animated.View>
                </View>
              );
            })}
          </View>

          {!hasMajorSearchResults && majorQuery.trim().length > 0 && (
            <View style={styles.noMajorResultsCard}>
              <Text style={styles.noMajorResultsTitle}>No majors found</Text>
              <Text style={styles.noMajorResultsBody}>Try a different keyword or clear search to browse all options.</Text>
            </View>
          )}
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Animated.View
            pointerEvents={selectedSchool.length > 0 ? "auto" : "none"}
            style={[
              styles.selectedMajorShell,
              {
                opacity: selectedSchoolRowAnim,
                marginTop: selectedSchoolRowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
                marginBottom: selectedSchoolRowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
                transform: [
                  {
                    translateY: selectedSchoolRowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-6, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {selectedSchool.length > 0 && (
              <View style={styles.selectedMajorRow}>
                <Text style={styles.selectedMajorLabel}>Selected school:</Text>
                <Animated.View
                  style={{
                    opacity: selectedSchoolAppearAnim,
                    transform: [
                      {
                        translateY: selectedSchoolAppearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-8, 0],
                        }),
                      },
                      {
                        scale: selectedSchoolAppearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.97, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [styles.selectedSchoolPill, pressed && styles.selectedMajorPillPressed]}
                    onPress={() => {
                      setSelectedSchool("");
                      setSelectedYear("");
                      setSchoolQuery("");
                    }}
                  >
                    <Text style={styles.selectedMajorPillText}>{selectedSchool}</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.majorSearchShell,
              {
                transform: [
                  {
                    scale: schoolSearchFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.015],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.majorSearch,
                isSchoolSearchFocused && styles.majorSearchFocused,
              ]}
            >
              <MaterialIcons name="search" size={20} color="#8e98b0" style={styles.majorSearchIcon} />
              <TextInput
                value={schoolQuery}
                onChangeText={setSchoolQuery}
                onFocus={() => setIsSchoolSearchFocused(true)}
                onBlur={() => setIsSchoolSearchFocused(false)}
                placeholder="Search college or university"
                placeholderTextColor="#6e7790"
                style={styles.majorSearchInput}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="search"
              />
              {schoolQuery.length > 0 && (
                <Pressable
                  style={({ pressed }) => [styles.majorSearchClearBtn, pressed && styles.majorSearchClearBtnPressed]}
                  onPress={() => setSchoolQuery("")}
                >
                  <Text style={styles.majorSearchClearText}>Clear</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {schoolQuery.trim().length > 0 && (
            <>
              <View style={styles.schoolGroup}>
                {canUseCustomSchool && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.schoolOption,
                      styles.schoolCustomOption,
                      pressed && styles.yearPillPressed,
                    ]}
                    onPress={() => {
                      LayoutAnimation.configureNext({
                        duration: 360,
                        create: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                          property: LayoutAnimation.Properties.opacity,
                        },
                        update: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                        },
                        delete: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                          property: LayoutAnimation.Properties.opacity,
                        },
                      });
                      setSelectedSchool(normalizedSchoolQuery);
                      setSchoolQuery("");
                    }}
                  >
                    <Text style={styles.schoolCustomLabel}>Use &quot;{normalizedSchoolQuery}&quot;</Text>
                  </Pressable>
                )}
                {filteredSchools.map((school) => (
                  <Pressable
                    key={school}
                    style={({ pressed }) => [
                      styles.schoolOption,
                      selectedSchool === school && styles.pillSelected,
                      pressed && styles.yearPillPressed,
                    ]}
                    onPress={() => {
                      LayoutAnimation.configureNext({
                        duration: 360,
                        create: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                          property: LayoutAnimation.Properties.opacity,
                        },
                        update: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                        },
                        delete: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                          property: LayoutAnimation.Properties.opacity,
                        },
                      });
                      setSelectedSchool(school);
                      setSchoolQuery("");
                    }}
                  >
                    <Text style={[styles.schoolOptionText, selectedSchool === school && styles.pillTextSelected]}>{school}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Animated.View
            pointerEvents={selectedSchool.length > 0 ? "auto" : "none"}
            style={[
              styles.yearGroup,
              {
                opacity: yearRevealAnim,
                transform: [
                  {
                    translateY: yearRevealAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {YEARS.map((y) => {
              const scaleAnim = getYearPillScaleAnim(y);
              return (
                <Animated.View
                  key={y}
                  style={[
                    styles.yearPillWrap,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.yearPill,
                      selectedYear === y && styles.pillSelected,
                      pressed && styles.yearPillPressed,
                    ]}
                    onPressIn={() => {
                      Animated.spring(scaleAnim, {
                        toValue: 0.965,
                        friction: 6,
                        tension: 95,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 7,
                        tension: 90,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[styles.yearPillText, selectedYear === y && styles.pillTextSelected]}>{y}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>
        </>
      );
    }

    if (step === 2) {
      if (!areSkillsReadyForCurrentSelection) {
        return (
          <View style={styles.noMajorResultsCard}>
            <Text style={styles.noMajorResultsTitle}>Preparing your skill set...</Text>
            <Text style={styles.noMajorResultsBody}>Loading your major-specific skills before this step appears.</Text>
          </View>
        );
      }

      return (
        <>
          {skillsToRate.map((skill) => {
            const currentLevel = skillLevels[skill.id] ?? 0;
            const labelAnim = getSkillLabelAnim(skill.id);

            return (
              <View key={skill.id} style={styles.skillCard}>
                <View style={styles.skillHeaderRow}>
                  <Pressable
                    style={({ pressed }) => [styles.skillNameBtn, pressed && styles.skillNameBtnPressed]}
                    onPress={() => toggleSkillSheet(skill.id)}
                  >
                    <Text style={styles.skillName}>{skill.label}</Text>
                    <Text style={styles.skillHint}>tap for description</Text>
                  </Pressable>
                  <Animated.Text
                    style={[
                      styles.skillLevelLabel,
                      {
                        transform: [
                          {
                            scale: labelAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.08],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {currentLevel === 0 ? "Not rated" : SKILL_LEVEL_OPTIONS[currentLevel - 1].label}
                  </Animated.Text>
                </View>

                <View style={styles.skillRatingRow}>
                  {SKILL_LEVEL_OPTIONS.map((option) => {
                    const tapAnim = getSkillDotTapAnim(skill.id, option.value);
                    const isSelected = currentLevel === option.value;
                    return (
                      <Animated.View
                        key={option.value}
                        style={[
                          styles.skillRatingOptionWrap,
                          {
                            transform: [
                              {
                                translateY: tapAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -1],
                                }),
                              },
                              {
                                scale: tapAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.03],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <Pressable
                          style={({ pressed }) => [
                            styles.skillRatingOption,
                            isSelected && styles.skillRatingOptionSelected,
                            pressed && styles.skillRatingOptionPressed,
                          ]}
                          onPress={() => {
                            const nextLevel = currentLevel === option.value ? 0 : option.value;
                            if (nextLevel !== currentLevel) {
                              animateSkillLabelChange(skill.id);
                            }
                            animateSkillDotFill(skill.id, currentLevel, nextLevel);
                            setSkillLevel(skill.id, nextLevel);
                          }}
                        >
                          <Text
                            style={[
                              styles.skillRatingNumber,
                              isSelected && styles.skillRatingTextSelected,
                            ]}
                          >
                            {option.value}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </>
      );
    }

    return (
      <>
        {!areGoalsReadyForCurrentSelection ? (
          <View style={styles.noMajorResultsCard}>
            <Text style={styles.noMajorResultsTitle}>Generating goals for {selectedMajor}...</Text>
            <Text style={styles.noMajorResultsBody}>We are pulling in major-specific goals from Groq right now.</Text>
          </View>
        ) : (
          <>
            <View style={styles.pillGroup}>
              {[...generatedGoals, ...customGoals].map((g) => {
                const scaleAnim = getGoalPillScaleAnim(g);
                const isCustomGoal = customGoals.includes(g);
                const appearAnim = isCustomGoal ? getCustomGoalAppearAnim(g) : null;
                return (
                  <Animated.View
                    key={g}
                    style={{
                      opacity: appearAnim ?? 1,
                      transform: [
                        {
                          translateY: appearAnim
                            ? appearAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0],
                              })
                            : 0,
                        },
                        {
                          scale: appearAnim
                            ? Animated.multiply(
                                scaleAnim,
                                appearAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.95, 1],
                                })
                              )
                            : scaleAnim,
                        },
                      ],
                    }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.pill,
                        selectedGoals.includes(g) && styles.pillSelected,
                        pressed && styles.pillPressed,
                      ]}
                      onPressIn={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 0.95,
                          friction: 6,
                          tension: 100,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1,
                          friction: 6,
                          tension: 100,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPress={() => toggleGoal(g)}
                    >
                      <Text style={[styles.pillText, selectedGoals.includes(g) && styles.pillTextSelected]}>{g}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.customGoalRow}>
              <TextInput
                value={customGoalInput}
                onChangeText={setCustomGoalInput}
                placeholder="Add your own goal"
                placeholderTextColor="#6e7790"
                style={styles.customGoalInput}
                returnKeyType="done"
                onSubmitEditing={addCustomGoal}
              />
              <Pressable
                style={({ pressed }) => [styles.customGoalAddBtn, pressed && styles.customGoalAddBtnPressed]}
                onPress={addCustomGoal}
              >
                <Text style={styles.customGoalAddText}>Add</Text>
              </Pressable>
            </View>
          </>
        )}
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
      <GradientBackground variant="soft" />
      <Animated.View
        style={{
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
                >
                  <LinearGradient
                    colors={["#9584fb", "#765ee8", "#5f45d1"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </View>
            </>
          )}
          {renderTitle()}
          {started && (
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
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

          <Animated.View style={styles.ctaBtnShell}>
            <Animated.View
              pointerEvents="none"
              style={[styles.ctaGradientLayer, { opacity: nextBtnEnableAnim }]}
            >
              <LinearGradient
                colors={["#9584fb", "#765ee8", "#5f45d1"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaGradient}
              />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ctaGradientLayer,
                {
                  opacity: nextBtnEnableAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={["#4b505a", "#4b505a", "#4b505a"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaGradient}
              />
            </Animated.View>
            <Pressable
              style={({ pressed }) => [
                styles.ctaBtn,
                pressed && !isNextDisabled && styles.ctaBtnPressed,
              ]}
              onPress={goNext}
            >
              <Animated.Text style={[styles.ctaBtnText, { color: nextBtnTextColor }]}>
                {step === TOTAL_STEPS - 1 ? "GENERATE MY ROADMAP" : "NEXT"}
              </Animated.Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {activeSkillId && <Pressable style={styles.skillSheetBackdrop} onPress={closeSkillSheet} />}

      {isSkillsIntroPopupMounted && (
        <View style={styles.skillIntroPopupOverlay}>
          <Animated.View style={[styles.skillIntroPopupBackdrop, { opacity: skillIntroBackdropOpacity }]}>
            <Pressable style={styles.skillIntroPopupBackdropPressable} onPress={closeSkillsIntroPopup} />
          </Animated.View>
          <Animated.View
            style={[
              styles.skillIntroPopupCard,
              {
                opacity: skillIntroCardOpacity,
                transform: [{ translateY: skillIntroCardTranslateY }, { scale: skillIntroCardScale }],
              },
            ]}
          >
            <Text style={styles.skillIntroPopupTitle}>{SKILL_INTRO_TITLE}</Text>
            <Text style={styles.skillIntroPopupLead}>{SKILL_INTRO_LEAD}</Text>
            <View style={styles.skillIntroLevelsWrap}>
              {SKILL_LEVEL_OPTIONS.map((item) => (
                <View key={item.value} style={styles.skillIntroLevelRow}>
                  <View style={styles.skillIntroLevelBadge}>
                    <Text style={styles.skillIntroLevelBadgeText}>{item.value}</Text>
                  </View>
                  <View style={styles.skillIntroLevelTextWrap}>
                    <Text style={styles.skillIntroLevelLabel}>{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.skillIntroPopupCloseBtn,
                pressed && styles.skillIntroPopupCloseBtnPressed,
              ]}
              onPress={closeSkillsIntroPopup}
            >
              <Text style={styles.skillIntroPopupCloseText}>start rating</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {isSkillSheetVisible && (
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
            <Text style={styles.skillSheetTitle}>
              {skillsToRate.find((s) => s.id === activeSkillId)?.label}
            </Text>
            <Pressable style={({ pressed }) => [styles.skillSheetCloseBtn, pressed && styles.skillSheetCloseBtnPressed]} onPress={closeSkillSheet}>
              <Text style={styles.skillSheetCloseText}>close</Text>
            </Pressable>
          </View>
          <Text style={styles.skillSheetBody}>
            {activeSkillId ? skillDescriptions[activeSkillId] ?? "Rate your familiarity with this skill." : ""}
          </Text>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  progressLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 12,
    color: "#b7adff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
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
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 32,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  titleSmallRest: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 26,
    color: "#f5f7fb",
    letterSpacing: 0.4,
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
  selectedMajorShell: {
    overflow: "visible",
    width: "100%",
  },
  selectedMajorShellVisible: {
    marginTop: 8,
    marginBottom: 8,
  },
  selectedMajorStack: {
    width: "100%",
    gap: 10,
  },
  selectedMajorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedMajorLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 15,
    color: "#98a4bc",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  selectedMajorPill: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#7c5cff",
    backgroundColor: "#1d1835",
  },
  selectedSchoolPill: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#7c5cff",
    backgroundColor: "#1d1835",
  },
  selectedMajorPillPressed: {
    opacity: 0.92,
  },
  selectedMajorPillText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 17,
    letterSpacing: 1,
    color: "#ddd6ff",
    textAlign: "center",
  },
  majorSearchShell: {
    marginTop: 8,
    marginBottom: 10,
  },
  majorSearch: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#343b49",
    backgroundColor: "#141a24",
    paddingHorizontal: 12,
    minHeight: 52,
  },
  majorSearchFocused: {
    borderColor: "#7c5cff",
    backgroundColor: "#171d29",
  },
  majorSearchIcon: {
    marginRight: 10,
  },
  majorSearchInput: {
    flex: 1,
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 18,
    color: "#edf2ff",
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  majorSearchClearBtn: {
    marginLeft: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#3a4254",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  majorSearchClearBtnPressed: {
    opacity: 0.7,
  },
  majorSearchClearText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#b7c1d7",
  },
  majorCategoryList: {
    gap: 12,
    marginTop: 10,
    marginBottom: 24,
  },
  majorCategoryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2c3548",
    backgroundColor: "#121723",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  majorCategoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  majorCategoryHeaderPressed: {
    opacity: 0.9,
  },
  majorCategoryHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  majorCategoryTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 23,
    color: "#f1f4fb",
    letterSpacing: 0.4,
  },
  majorCategoryDescription: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 18,
    color: "#95a2bb",
    lineHeight: 23,
  },
  majorCategoryHeaderMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  majorCategoryChevronBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
  },
  majorCategoryBody: {
    overflow: "hidden",
    paddingTop: 14,
  },
  majorOptionList: {
    gap: 10,
  },
  majorOption: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
  },
  majorOptionSelected: {
    backgroundColor: "#1d1835",
    borderColor: "#7c5cff",
  },
  majorOptionText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 19,
    color: "#b0b9c8",
    textAlign: "center",
  },
  majorOptionTextSelected: {
    color: "#ddd6ff",
  },
  pillGroup: {
    flexDirection: "column",
    gap: 10,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 24,
  },
  pill: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
  },
  yearGroup: {
    flexDirection: "column",
    gap: 10,
    marginTop: 50,
    marginBottom: 24,
  },
  schoolGroup: {
    gap: 10,
    marginBottom: 16,
  },
  schoolOption: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  schoolOptionText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 16,
    color: "#b0b9c8",
  },
  schoolCustomOption: {
    borderColor: "#506087",
    backgroundColor: "#182034",
  },
  schoolCustomLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    letterSpacing: 0.8,
    color: "#d6deff",
  },
  yearPromptCard: {
    marginTop: 2,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2c3548",
    backgroundColor: "#121723",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a404d",
    backgroundColor: "#181c24",
    width: "100%",
    alignItems: "center",
  },
  yearPillWrap: {
    width: "100%",
  },
  yearPillPressed: {
    opacity: 0.85,
  },
  yearPillText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 20,
    color: "#b0b9c8",
  },
  pillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.992 }],
  },
  pillSelected: {
    backgroundColor: "#1d1835",
    borderColor: "#7c5cff",
  },
  pillText: {
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 18,
    color: "#b0b9c8",
  },
  pillTextSelected: {
    color: "#ddd6ff",
  },
  customGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -8,
    marginBottom: 24,
  },
  customGoalInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#343b49",
    backgroundColor: "#141a24",
    paddingHorizontal: 12,
    fontFamily: "ClashGrotesk-Medium",
    fontSize: 18,
    color: "#edf2ff",
    letterSpacing: 0.3,
  },
  customGoalAddBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7c5cff",
    backgroundColor: "#1d1835",
    alignItems: "center",
    justifyContent: "center",
  },
  customGoalAddBtnPressed: {
    opacity: 0.82,
  },
  customGoalAddText: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    color: "#ddd6ff",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  noMajorResultsCard: {
    marginTop: -6,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2c3548",
    backgroundColor: "#121723",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noMajorResultsTitle: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 20,
    color: "#d4ddf0",
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  noMajorResultsBody: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#95a2bb",
    letterSpacing: 0.5,
    lineHeight: 18,
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  skillNameBtn: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-start",
  },
  skillNameBtnPressed: {
    opacity: 0.8,
  },
  skillName: {
    fontFamily: "ClashGrotesk-SemiBold",
    fontSize: 20,
    letterSpacing: 0.4,
    color: "#e6ebf3",
  },
  skillHint: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#7c5cff",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  skillRatingRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  skillRatingOptionWrap: {
    flex: 1,
  },
  skillRatingOption: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#465063",
    backgroundColor: "#202633",
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  skillRatingOptionSelected: {
    borderColor: "#8d78ff",
    backgroundColor: "#372b5f",
  },
  skillRatingOptionPressed: {
    opacity: 0.8,
  },
  skillRatingNumber: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 20,
    color: "#d2daea",
    letterSpacing: 0.4,
  },
  skillRatingTextSelected: {
    color: "#f1ecff",
  },
  skillLevelLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 16,
    letterSpacing: 0.4,
    color: "#b7adff",
    minWidth: 132,
    textAlign: "right",
  },
  ctaBtnShell: {
    borderRadius: 14,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  ctaGradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  ctaBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  ctaBtnDisabled: {
    opacity: 0.72,
  },
  ctaBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  ctaBtnText: {
    fontFamily: "ClashGrotesk-SemiBold",
    fontSize: 18,
    letterSpacing: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 50,
    backgroundColor: "#0f1115",
    borderTopWidth: 1,
    borderTopColor: "#222836",
    gap: 10,
    zIndex: 40,
    elevation: 40,
  },
  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    paddingBottom: 5,
    textTransform: "uppercase",
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  secondaryBtnText: {
    fontFamily: "ClashGrotesk-Semibold",
    color: "#b7adff",
    fontSize: 15,
    letterSpacing: 1.2,
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
    zIndex: 55,
  },
  skillIntroPopupOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 70,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  skillIntroPopupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 14, 0.72)",
  },
  skillIntroPopupBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  skillIntroPopupCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#32405c",
    backgroundColor: "#111a2b",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    elevation: 80,
  },
  skillIntroPopupTitle: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 24,
    color: "#f3f7ff",
    letterSpacing: 0.7,
  },
  skillIntroPopupLead: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 17,
    color: "#d9def0",
    lineHeight: 21,
    letterSpacing: 0.3,
  },
  skillIntroPopupCloseBtn: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6a8ed0",
    backgroundColor: "#18305b",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skillIntroPopupCloseBtnPressed: {
    opacity: 0.82,
  },
  skillIntroPopupCloseText: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 17,
    color: "#e8f1ff",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
    zIndex: 60,
    elevation: 60,
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
    fontSize: 25,
    letterSpacing: 0.8,
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
    fontSize: 19,
    letterSpacing: 0.6,
    color: "#c8d0e0",
    lineHeight: 21,
  },
  skillIntroLevelsWrap: {
    gap: 8,
  },
  skillIntroLevelRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2f3a52",
    backgroundColor: "#1a2233",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 10,
  },
  skillIntroLevelBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2a3550",
    borderWidth: 1,
    borderColor: "#7b89ad",
  },
  skillIntroLevelBadgeText: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 17,
    color: "#e8edff",
  },
  skillIntroLevelTextWrap: {
    flex: 1,
  },
  skillIntroLevelLabel: {
    fontFamily: "ClashGrotesk-Semibold",
    fontSize: 19,
    color: "#eef3ff",
    letterSpacing: 0.4,
  },
});

