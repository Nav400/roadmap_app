type Profile = {
  goals?: string[];
  skills?: Record<string, number>;
};

export type PriorityMilestone = {
  title: string;
  reason: string;
};

export function getPriorityMilestone(profile: Profile): PriorityMilestone {
  const skillValues = Object.values(profile.skills ?? {});
  const avgSkill = skillValues.reduce((sum, value) => sum + value, 0) / Math.max(skillValues.length, 1);
  const goals = profile.goals ?? [];

  const title =
    avgSkill < 1.5
      ? "Set up your dev environment and push your first project to GitHub."
      : avgSkill < 2.8
      ? "Build a full-stack project and deploy it with a live URL."
      : "Lead a project or apply for a research position.";

  const reason = goals.includes("Get a SWE internship")
    ? "Recruiters want to see you can ship something real. This is step one."
    : goals.includes("Do research")
    ? "Professors want students who show initiative. A project proves that."
    : "Every goal you picked starts here. Build the habit first.";

  return { title, reason };
}