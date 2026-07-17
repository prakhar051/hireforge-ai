const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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