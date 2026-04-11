export type GoalItemType = "milestone" | "project";
export type GoalSourceTab = "milestones" | "projects" | "completed";

export type RoadmapGoalSelection = {
  type: GoalItemType;
  sourceTab?: GoalSourceTab;
  id: string;
  title: string;
  desc: string;
  tag?: string;
  skills?: string[];
  difficulty?: string;
};

export type MiniTask = {
  id: string;
  title: string;
  tip: string;
};

export type GoalDetailContent = {
  lane: string;
  mentorNote: string;
  estimatedTime: string;
  miniTasks: MiniTask[];
};

const DETAIL_CONTENT: Record<string, GoalDetailContent> = {
  "milestone:1": {
    lane: "Foundations Sprint",
    mentorNote: "Treat this as setup week. Once your tools are ready, every future task moves faster.",
    estimatedTime: "1-2 afternoons",
    miniTasks: [
      { id: "m1-1", title: "Install VS Code, Git, and your language runtime", tip: "Verify each install from the terminal." },
      { id: "m1-2", title: "Create a GitHub repo and push a hello-world project", tip: "Include a README and one commit history screenshot." },
      { id: "m1-3", title: "Set up one reusable project template", tip: "Keep starter folders for src, tests, and docs." },
    ],
  },
  "milestone:2": {
    lane: "Version Control Core",
    mentorNote: "Git confidence is a career multiplier. Build muscle memory with real commits.",
    estimatedTime: "1 week",
    miniTasks: [
      { id: "m2-1", title: "Practice branch, commit, and merge on a sample repo", tip: "Use two branches and resolve one merge conflict." },
      { id: "m2-2", title: "Push 3 meaningful commits with clear messages", tip: "Use verb-first commit messages like add/fix/refactor." },
      { id: "m2-3", title: "Open and merge one pull request", tip: "Even solo projects can use PR workflow." },
    ],
  },
  "milestone:3": {
    lane: "Project Momentum",
    mentorNote: "A finished small project beats five unfinished ones.",
    estimatedTime: "1-2 weeks",
    miniTasks: [
      { id: "m3-1", title: "Pick one idea and define 3 must-have features", tip: "Keep scope tiny and specific." },
      { id: "m3-2", title: "Build and ship a first working version", tip: "Aim for functional, not perfect." },
      { id: "m3-3", title: "Write a short README with run instructions", tip: "Future you and recruiters will thank you." },
    ],
  },
  "milestone:4": {
    lane: "Community Activation",
    mentorNote: "Opportunities come from people who remember you showed up.",
    estimatedTime: "1 week",
    miniTasks: [
      { id: "m4-1", title: "Find one CS club and attend a meeting", tip: "Introduce yourself to at least one officer." },
      { id: "m4-2", title: "Join their Discord/Slack and read current projects", tip: "Look for beginner-friendly roles." },
      { id: "m4-3", title: "Commit to one event or workshop this month", tip: "Put it on your calendar immediately." },
    ],
  },
  "milestone:5": {
    lane: "Interview Rhythm",
    mentorNote: "Consistency matters more than speed. Build a weekly practice habit.",
    estimatedTime: "Ongoing",
    miniTasks: [
      { id: "m5-1", title: "Solve one easy arrays problem", tip: "Focus on reasoning out loud first." },
      { id: "m5-2", title: "Solve one easy strings problem", tip: "Track patterns you reused." },
      { id: "m5-3", title: "Write a short reflection after each solve", tip: "Capture mistakes and better approaches." },
    ],
  },
  "milestone:6": {
    lane: "Networking Launch",
    mentorNote: "One good conversation can create your next opportunity.",
    estimatedTime: "1 event",
    miniTasks: [
      { id: "m6-1", title: "Pick one campus tech event this month", tip: "Prefer events with recruiter or engineer Q&A." },
      { id: "m6-2", title: "Prepare a 20-second intro about your interests", tip: "Mention major, year, and one project." },
      { id: "m6-3", title: "Follow up with one person after the event", tip: "Send a short thank-you or LinkedIn message." },
    ],
  },
  "project:1": {
    lane: "Builder Track",
    mentorNote: "This project teaches practical logic, state, and file persistence all at once.",
    estimatedTime: "4-8 hours",
    miniTasks: [
      { id: "p1-1", title: "Define task data model and command list", tip: "Support add, list, complete, and delete." },
      { id: "p1-2", title: "Implement persistent storage", tip: "Use JSON file read/write safely." },
      { id: "p1-3", title: "Record a short demo GIF and README", tip: "Show one complete command flow." },
    ],
  },
  "project:2": {
    lane: "Web Presence",
    mentorNote: "A simple polished portfolio often gets more responses than a complex unfinished app.",
    estimatedTime: "1 weekend",
    miniTasks: [
      { id: "p2-1", title: "Build landing, projects, and contact sections", tip: "Keep copy concise and concrete." },
      { id: "p2-2", title: "Optimize layout for mobile and desktop", tip: "Test at two phone sizes and one laptop size." },
      { id: "p2-3", title: "Deploy on GitHub Pages", tip: "Add deployed URL to your resume." },
    ],
  },
  "project:3": {
    lane: "Backend Essentials",
    mentorNote: "APIs are where many internships start. Learn predictable request and response design.",
    estimatedTime: "1-2 weeks",
    miniTasks: [
      { id: "p3-1", title: "Set up Flask routes for CRUD endpoints", tip: "Use proper HTTP status codes." },
      { id: "p3-2", title: "Validate input and return structured JSON errors", tip: "Never trust raw request payloads." },
      { id: "p3-3", title: "Document endpoints in README", tip: "Include one curl example per route." },
    ],
  },
  "project:4": {
    lane: "Automation Build",
    mentorNote: "Bots demonstrate initiative and API integration in a very visible way.",
    estimatedTime: "1 week",
    miniTasks: [
      { id: "p4-1", title: "Choose one useful bot command and implement it", tip: "Start with a command your friends will use." },
      { id: "p4-2", title: "Integrate one external API", tip: "Handle failures with friendly messages." },
      { id: "p4-3", title: "Deploy bot and collect user feedback", tip: "Refine command wording after first usage." },
    ],
  },
};

export function getGoalDetailContent(goal: RoadmapGoalSelection): GoalDetailContent {
  const key = `${goal.type}:${goal.id}`;
  const content = DETAIL_CONTENT[key];

  if (content) {
    return content;
  }

  const fallbackPrefix = goal.type === "milestone" ? "m" : "p";
  return {
    lane: goal.type === "milestone" ? "Milestone Focus" : "Project Focus",
    mentorNote: "Break this goal into concrete actions. Small checkable wins keep momentum high.",
    estimatedTime: "This week",
    miniTasks: [
      { id: `${fallbackPrefix}-fallback-1`, title: "Define a clear outcome for this goal", tip: "Write what " + "done" + " looks like in one sentence." },
      { id: `${fallbackPrefix}-fallback-2`, title: "Complete the first practical step", tip: "Pick the smallest action that creates progress." },
      { id: `${fallbackPrefix}-fallback-3`, title: "Review and plan the next step", tip: "Decide your next action before leaving this screen." },
    ],
  };
}
