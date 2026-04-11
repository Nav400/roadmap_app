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
            'Return strict JSON only. Output format: {"skills":[{"label":"...","description":"..."}]}. Exactly 6 skills.',
        },
        {
          role: "user",
          content: `Generate exactly 6 technical skills a ${year} ${major} student should self-rate for a roadmap app. Keep labels short and descriptions to one sentence each.`,
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

async function generateGoals(major) {
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
            'Return strict JSON only. Output format: {"goals":["..."]}. Exactly 5 goals. Each goal must be a short phrase of 2 to 5 words, like "Get a SWE internship" or "Publish a paper". Focus on common outcome goals such as getting a job, getting an internship, publishing a paper, going to grad school, or getting certified. No project-based goals and no full sentences.',
        },
        {
          role: "user",
          content: `Generate exactly 5 short common outcome goals for a ${major} student using a roadmap app. Each goal should be 2 to 5 words, like "Get a SWE internship" or "Publish a paper". Focus on common outcomes such as getting a job, getting an internship, publishing a paper, going to grad school, or getting certified. Do not include project-based goals. Return only JSON.`,
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
  const goals = Array.isArray(parsed?.goals)
    ? parsed.goals
        .filter((goal) => typeof goal === "string")
        .map((goal) => goal.trim().replace(/[.!?]+$/g, "").slice(0, 40))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (goals.length !== 5) {
    throw new Error("Model did not return 5 goals");
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
      const goals = await generateGoals(major);
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
