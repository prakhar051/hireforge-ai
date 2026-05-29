const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

// ✅ CACHE IMPORT
const { cache, getCacheKey } = require("../utils/cache");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/* =========================
   ZOD SCHEMAS
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

const resumePdfSchema = z.object({
  html: z.string(),
});

/* =========================
   SAFE AI CALL WITH CACHE + RETRY
========================= */

async function safeGenerate(prompt, schema) {
  const key = getCacheKey(prompt);

  // 🔥 1. CHECK CACHE FIRST
  const cached = cache.get(key);
  if (cached) {
    console.log("⚡ Cache hit");
    return cached;
  }

  let attempts = 0;
  let lastError;

  while (attempts < 3) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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

      // 🔥 2. STORE IN CACHE
      cache.set(key, validated);

      return validated;

    } catch (err) {
      console.error(`AI attempt ${attempts + 1} failed:`, err.message);
      lastError = err;
      attempts++;
    }
  }

  throw new Error("AI failed after 3 attempts: " + lastError.message);
}

/* =========================
   INTERVIEW REPORT
========================= */

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert interview assistant.

STRICT RULES:
- Return ONLY valid JSON
- Follow schema exactly
- No extra text

DATA:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  return await safeGenerate(prompt, interviewReportSchema);
}

/* =========================
   PDF GENERATOR (SAFE)
========================= */

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/* =========================
   RESUME PDF GENERATION
========================= */

async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert resume writer.

STRICT RULES:
- Return ONLY valid JSON
- No explanations

FORMAT:
{
  "html": "<html>...</html>"
}

DATA:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Requirements:
- ATS friendly
- clean professional layout
- 1-2 pages
`;

  const result = await safeGenerate(prompt, resumePdfSchema);

  return await generatePdfFromHtml(result.html);
}

/* =========================
   EXPORTS
========================= */

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};