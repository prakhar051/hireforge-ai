require("dotenv").config();

const mongoose = require("mongoose");
const { Worker } = require("bullmq");

const connection = require("../config/redis");

const {
  generateInterviewReport,
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

const QUEUE_NAME = "interview-queue";

/* =========================
   CONNECT DATABASE
========================= */
async function connectDB() {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Worker connected to MongoDB");

  } catch (err) {

    console.error(
      "❌ Worker DB connection failed:",
      err.message
    );

    process.exit(1);
  }
}

/* =========================
   FALLBACK TITLE
========================= */
function generateFallbackTitle(jobDescription = "") {

  const firstLine =
    jobDescription
      .split("\n")
      .find(line => line.trim().length > 5);

  if (!firstLine) {
    return "AI Interview Report";
  }

  return firstLine.slice(0, 80);
}

/* =========================
   START WORKER
========================= */
async function startWorker() {

  await connectDB();

  console.log("👷 Worker initialized");

  const worker = new Worker(

    QUEUE_NAME,

    async (job) => {

      console.log(`⚡ Job started: ${job.id}`);

      const {
        resumeText,
        selfDescription,
        jobDescription,
        userId,
      } = job.data;

      /* =========================
         VALIDATION
      ========================= */

      if (
        !jobDescription ||
        !userId
      ) {
        throw new Error("Invalid job payload");
      }

      try {

        console.log("🧠 Calling AI...");

        const aiResult =
          await generateInterviewReport({
            resume: resumeText || "",
            selfDescription: selfDescription || "",
            jobDescription,
          });

        if (
          !aiResult ||
          typeof aiResult !== "object"
        ) {
          console.error(
            "❌ AI returned invalid:",
            aiResult
          );

          throw new Error(
            "AI returned invalid response"
          );
        }

        console.log(
          "🧠 AI RESULT KEYS:",
          Object.keys(aiResult)
        );

        /* =========================
           SAFE FALLBACKS
        ========================= */

        const safeResult = {

          title:
            aiResult.title?.trim()
              ? aiResult.title
              : generateFallbackTitle(jobDescription),

          matchScore:
            typeof aiResult.matchScore === "number"
              ? aiResult.matchScore
              : 0,

          technicalQuestions:
            Array.isArray(aiResult.technicalQuestions)
              ? aiResult.technicalQuestions
              : [],

          behavioralQuestions:
            Array.isArray(aiResult.behavioralQuestions)
              ? aiResult.behavioralQuestions
              : [],

          skillGaps:
            Array.isArray(aiResult.skillGaps)
              ? aiResult.skillGaps
              : [],

          preparationPlan:
            Array.isArray(aiResult.preparationPlan)
              ? aiResult.preparationPlan
              : [],

        };

        console.log("💾 Saving to DB...");

        const report =
          await interviewReportModel.create({

            user: userId,

            resume: resumeText || "",

            selfDescription:
              selfDescription || "",

            jobDescription,

            ...safeResult,

          });

        console.log(
          `🎉 Job ${job.id} saved: ${report._id}`
        );

        return report;

      } catch (err) {

        console.error(
          `❌ FULL WORKER ERROR (job ${job.id}):`,
          err
        );

        throw err;
      }
    },

    {
      connection,
      concurrency: 3,
    }

  );

  /* =========================
     EVENTS
  ========================= */

  worker.on("ready", () => {
    console.log(
      "🚀 Worker ready and listening for jobs..."
    );
  });

  worker.on("completed", (job) => {
    console.log(`✅ Job completed: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `💥 Job failed: ${job?.id}`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("❌ Worker crash:", err);
  });
}

startWorker();