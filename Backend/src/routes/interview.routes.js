const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/auth.middleware");

const upload =
  require("../middlewares/file.middleware");

const aiLimiter =
  require("../middlewares/rateLimiter");

/* =========================
   CONTROLLERS
========================= */

const {

  generateInterviewReportController,

  getJobStatusController,

  getInterviewReportByIdController,

  getAllInterviewReportsController,

  generateResumePdfController,

} = require("../controllers/interview.controller");

/* =========================
   AUTH
========================= */

const protect =
  authMiddleware.authUser;

/* =========================
   VALIDATION
========================= */

const validateGenerateRequest = (
  req,
  res,
  next
) => {

  const {
    selfDescription,
    jobDescription,
  } = req.body;

  /* =========================
     REQUIRE:
     - job description
     - resume OR self description
  ========================= */

  const hasResume =
    !!req.file;

  const hasSelfDescription =
    !!selfDescription?.trim();

  if (!jobDescription?.trim()) {

    return res.status(400).json({
      message:
        "Job description is required",
    });
  }

  if (
    !hasResume &&
    !hasSelfDescription
  ) {

    return res.status(400).json({
      message:
        "Resume or self description is required",
    });
  }

  next();
};

/* =========================
   VALIDATE IDS
========================= */

const validateId = (
  req,
  res,
  next
) => {

  const {
    id,
    jobId,
  } = req.params;

  const value = id || jobId;

  if (
    !value ||
    value.length < 5
  ) {

    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  next();
};

/* =========================
   ROUTES
========================= */

/* GENERATE REPORT */

router.post(

  "/generate",

  protect,

  aiLimiter,

  upload.single("resume"),

  validateGenerateRequest,

  generateInterviewReportController
);

/* JOB STATUS */

router.get(

  "/job/:jobId",

  protect,

  validateId,

  getJobStatusController
);

/* GET ALL REPORTS */

router.get(

  "/",

  protect,

  getAllInterviewReportsController
);

/* GET REPORT BY ID */

router.get(

  "/:id",

  protect,

  validateId,

  getInterviewReportByIdController
);

/* GENERATE PDF */

router.post(

  "/:id/resume-pdf",

  protect,

  aiLimiter,

  validateId,

  generateResumePdfController
);

module.exports = router;