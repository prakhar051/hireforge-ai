const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  /\.vercel\.app$/
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* =========================
   IMPORT ROUTES
========================= */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* 🔥 DEBUG (REMOVE LATER) */
console.log("authRouter:", typeof authRouter);
console.log("interviewRouter:", typeof interviewRouter);

/* =========================
   USE ROUTES
========================= */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;