const { Queue, QueueEvents } = require("bullmq");
const connection = require("../config/redis");

// 🔥 MUST match worker
const QUEUE_NAME = "interview-queue";

/* =========================
   QUEUE INSTANCE
========================= */
const interviewQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/* =========================
   QUEUE EVENTS (STRONG DEBUG)
========================= */
const queueEvents = new QueueEvents(QUEUE_NAME, {
  connection,
});

queueEvents.on("waiting", ({ jobId }) => {
  console.log(`🟡 Job waiting: ${jobId}`);
});

queueEvents.on("active", ({ jobId }) => {
  console.log(`⚡ Job active: ${jobId}`);
});

queueEvents.on("completed", ({ jobId }) => {
  console.log(`✅ Job completed: ${jobId}`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`💥 Job failed: ${jobId}`, failedReason);
});

queueEvents.on("error", (err) => {
  console.error("❌ QueueEvents error:", err.message);
});

/* =========================
   REDIS CONNECTION LOGS
========================= */
connection.on("connect", () => {
  console.log("🔌 Redis connected (Queue)");
});

connection.on("error", (err) => {
  console.error("❌ Redis error (Queue):", err.message);
});

/* =========================
   HEALTH CHECK (VERY IMPORTANT)
========================= */
setInterval(async () => {
  try {
    const waiting = await interviewQueue.getWaitingCount();
    const active = await interviewQueue.getActiveCount();
    const completed = await interviewQueue.getCompletedCount();
    const failed = await interviewQueue.getFailedCount();

    console.log("📊 Queue Stats:", {
      waiting,
      active,
      completed,
      failed,
    });
  } catch (err) {
    console.error("❌ Queue stats error:", err.message);
  }
}, 5000);

console.log("📦 Interview Queue initialized");

module.exports = interviewQueue;