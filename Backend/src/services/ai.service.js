const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const { cache, getCacheKey } = require("../utils/cache");

/* =========================
GEMINI CONFIG
========================= */

const ai = new GoogleGenAI({
apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/* =========================
ZOD SCHEMA
========================= */

const interviewReportSchema = z.object({
matchScore: z.number(),

technicalQuestions: z.array(
z.object({
question: z.string(),
intention: z.string(),
answer: z.string(),
})
),

behavioralQuestions: z.array(
z.object({
question: z.string(),
intention: z.string(),
answer: z.string(),
})
),

skillGaps: z.array(
z.object({
skill: z.string(),
severity: z.enum(["low", "medium", "high"]),
})
),

preparationPlan: z.array(
z.object({
day: z.number(),
focus: z.string(),
tasks: z.array(z.string()),
})
),

title: z.string(),
});

/* =========================
SAFE AI GENERATOR
========================= */

async function safeGenerate(prompt, schema) {

const key = getCacheKey(prompt);

const cached = cache.get(key);

if (cached) {
console.log("Cache hit");
return cached;
}

let attempts = 0;
let lastError;

while (attempts < 3) {

try {

  console.log("AI attempt " + (attempts + 1));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(schema),
    },
  });

  const parsed =
    typeof response.text === "string"
      ? JSON.parse(response.text)
      : response.text;

  const validated = schema.parse(parsed);

  cache.set(key, validated);

  return validated;

} catch (err) {

  console.error(
    "AI attempt " + (attempts + 1) + " failed:",
    err.message
  );

  lastError = err;
  attempts++;
}


}

throw new Error(
"AI failed after 3 attempts: " + lastError.message
);
}

/* =========================
GENERATE INTERVIEW REPORT
========================= */

async function generateInterviewReport({
resume,
selfDescription,
jobDescription,
}) {

const prompt = `
You are an expert AI interview preparation assistant.

STRICT RULES:

* Return ONLY valid JSON
* Follow schema EXACTLY
* No markdown
* No explanations
* No extra text

TASK:
Analyze the candidate profile and generate:

1. Match score
2. Technical interview questions
3. Behavioral interview questions
4. Skill gaps
5. Preparation roadmap
6. Job title

CANDIDATE RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}
`;

return await safeGenerate(
prompt,
interviewReportSchema
);
}

/* =========================
TEMP PDF FUNCTION
========================= */

async function generateResumePdf() {

console.log("PDF generation temporarily disabled");

return Buffer.from(
"PDF generation temporarily disabled"
);
}

/* =========================
EXPORTS
========================= */

module.exports = {
generateInterviewReport,
generateResumePdf,
};
