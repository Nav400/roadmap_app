import "dotenv/config";
import { createServer } from "node:http";
import { Buffer } from "node:buffer";

const PORT = Number(process.env.SKILLS_PROXY_PORT || 8787);
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function generateSkills(major, year) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            'Return strict JSON only. Output format: {"skills":[{"label":"...","description":"..."}]}. Exactly 6 skills. Skills must be specific to the student\'s major and academic level, not generic computer science skills unless the major is CS-related. Include domain-specific areas used in that major (for example, actuarial science should emphasize probability, statistics, financial mathematics, risk modeling, insurance concepts, and actuarial software). Keep labels short and descriptions to one sentence each.',
        },
        {
          role: "user",
          content: `Generate exactly 6 major-specific skills a ${year} ${major} student should self-rate for a roadmap app. Do not default to software engineering skills unless the major is software/computer related. Keep labels short and descriptions to one sentence each.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content ?? "";
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? rawText.slice(jsonStart, jsonEnd + 1) : rawText;
  const parsed = JSON.parse(jsonText);
  const skills = Array.isArray(parsed?.skills) ? parsed.skills.slice(0, 6) : [];

  if (skills.length !== 6) {
    throw new Error("Model did not return 6 skills");
  }

  return skills;
}

async function generateGoals(major, year, school, skills) {
  const normalizedSkills =
    skills && typeof skills === "object"
      ? Object.fromEntries(
          Object.entries(skills)
            .filter(([, level]) => typeof level === "number")
            .sort(([left], [right]) => String(left).localeCompare(String(right)))
        )
      : {};
  const skillsJson = JSON.stringify(normalizedSkills);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
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

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content ?? "";
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? rawText.slice(jsonStart, jsonEnd + 1) : rawText;
  const parsed = JSON.parse(jsonText);
  const broadenSpecificGoal = (goal) => {
    const normalized = String(goal).trim().replace(/[.!?]+$/g, "");
    const hasRoleWord = /\b(role|position|job)\b/i.test(normalized);
    const hasJobTitlePattern = /\b(analyst|engineer|developer|manager|consultant|scientist|specialist)\b/i.test(normalized);
    const hasTargetingVerb = /\b(secure|get|land|become|attain|obtain|win)\b/i.test(normalized);
    if (hasRoleWord || (hasJobTitlePattern && hasTargetingVerb)) {
      return "Advance Career Readiness";
    }
    return normalized;
  };
  const goals = Array.isArray(parsed?.goals)
    ? parsed.goals
        .filter((goal) => typeof goal === "string")
        .map((goal) => broadenSpecificGoal(goal))
        .map((goal) => goal.trim().replace(/[.!?]+$/g, "").slice(0, 48))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  if (goals.length !== 6) {
    throw new Error("Model did not return 6 goals");
  }

  return goals;
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.url !== "/skills/generate" && req.url !== "/goals/generate") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!AI_API_KEY) {
    sendJson(res, 500, { error: "Server is missing AI_API_KEY" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const major = typeof body.major === "string" && body.major.trim() ? body.major.trim() : "computer science";
    const year = typeof body.year === "string" && body.year.trim() ? body.year.trim() : "college";

    if (req.url === "/goals/generate") {
      const school = typeof body.school === "string" && body.school.trim() ? body.school.trim() : "their university";
      const goals = await generateGoals(major, year, school, body.skills);
      sendJson(res, 200, { goals });
      return;
    }

    const skills = await generateSkills(major, year);
    sendJson(res, 200, { skills });
  } catch (error) {
    sendJson(res, 500, {
      error: "Failed to generate skills",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Skills proxy listening on http://localhost:${PORT}`);
});
